import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RugDesign, RugTexture } from '@/types/design';
import { User } from '@supabase/supabase-js';
export const generateOrderPdf = (
    design: RugDesign,
    designImage: string,
    user: User | null,
    logoBase64?: string,
    textures?: RugTexture[],
    adminSettings?: { company_name?: string; pdf_header_text?: string; grid_unit_size?: number },
    textureImageDataUrls?: Record<string, string>
) => {
    const textureList = textures ?? [];
    const gridUnitSize = adminSettings?.grid_unit_size ?? 0.1;
    const clientName = design.metadata.clientName?.trim() || '—';
    const phoneNumber = design.metadata.phoneNumber?.trim() || '—';
    const email = user?.email || '—';
    const docDate = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    const primaryBlack = '#1A1A1A';
    const accentGold = '#D4AF37';
    const softGray = '#F5F5F7';
    const textSecondary = '#666666';

    // --- Black header: company, client name, date ---
    doc.setFillColor(primaryBlack);
    doc.rect(0, 0, pageWidth, 44, 'F');

    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(adminSettings?.company_name || 'PATCHWORK DIZAYN', margin, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#E8E8E8');

    doc.text(`Client: ${clientName}`, margin, 24);
    doc.setFontSize(9);
    doc.setTextColor('#CCCCCC');
    doc.text(`Email: ${email}`, margin, 30);
    doc.text(`Phone: ${phoneNumber}`, margin, 36);

    doc.text(`Date: ${docDate}`, pageWidth - margin, 30, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor('#AAAAAA');
    doc.text(`Ref: ${design.metadata.referenceNumber || '—'}`, pageWidth - margin, 38, { align: 'right' });

    // --- Content ---
    let currentY = 52;

    doc.setDrawColor('#EEEEEE');
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    doc.setFontSize(7);
    doc.setTextColor(textSecondary);
    doc.setFont('helvetica', 'bold');
    doc.text('DIMENSIONS', margin, currentY);
    doc.text('TOTAL AREA', 55, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(primaryBlack);
    doc.text(`${design.width.toFixed(2)}m × ${design.height.toFixed(2)}m`, margin, currentY + 5);
    doc.text(`${design.totalArea.toFixed(2)} m²`, 55, currentY + 5);
    currentY += 14;

    // --- Design image (compact to fit one page) ---
    doc.setFillColor(softGray);
    doc.rect(margin, currentY, pageWidth - margin * 2, 72, 'F');

    if (designImage) {
        const maxWidth = pageWidth - margin * 2 - 16;
        const maxHeight = 64;
        const imgProps = doc.getImageProperties(designImage);
        let displayWidth = maxWidth;
        let displayHeight = (imgProps.height * displayWidth) / imgProps.width;
        if (displayHeight > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = (imgProps.width * displayHeight) / imgProps.height;
        }
        const centerX = (pageWidth - displayWidth) / 2;
        const centerY = currentY + (72 - displayHeight) / 2;
        doc.addImage(designImage, 'PNG', centerX, centerY, displayWidth, displayHeight);
    }

    // --- Bill of Materials: improved table UI/UX ---
    currentY += 78;
    doc.setFontSize(11);
    doc.setTextColor(primaryBlack);
    doc.setFont('helvetica', 'bold');
    doc.text('Materials', margin, currentY);
    currentY += 2;

    const patchDetails: Array<{
        textureId?: string;
        hex: string;
        name: string;
        code: string;
        width: string;
        height: string;
        area: number;
        count: number;
    }> = [];

    design.patches.forEach(p => {
        const w = (p.width * gridUnitSize).toFixed(2);
        const h = (p.height * gridUnitSize).toFixed(2);
        const area = (p.width * gridUnitSize) * (p.height * gridUnitSize);
        const textureOption = p.textureId ? textureList.find(t => t.id === p.textureId) : null;
        const hex = textureOption?.hex ?? p.color;
        const name = textureOption?.name ?? 'Custom';
        const code = textureOption?.code ?? 'N/A';

        const existing = patchDetails.find(pd =>
            (pd.textureId ?? '') === (p.textureId ?? '') &&
            pd.hex.toLowerCase() === hex.toLowerCase() &&
            pd.width === w &&
            pd.height === h
        );

        if (existing) {
            existing.count += 1;
        } else {
            patchDetails.push({
                textureId: p.textureId,
                hex,
                name,
                code,
                width: w,
                height: h,
                area: area,
                count: 1
            });
        }
    });

    patchDetails.sort((a, b) => {
        if (a.name !== b.name) return a.name.localeCompare(b.name);
        return b.area - a.area;
    });

    const tableData = patchDetails.map(detail => [
        '',
        detail.name,
        detail.code,
        `${detail.width}m × ${detail.height}m`,
        detail.count.toString(),
        `${(detail.area * detail.count).toFixed(2)} m²`,
        `${(((detail.area * detail.count) / design.totalArea) * 100).toFixed(1)}%`
    ]);

    const swatchSize = 14;
    const tableStartY = currentY + 2;
    autoTable(doc, {
        startY: tableStartY,
        head: [['', 'Material', 'Code', 'Dimensions', 'Qty', 'Area', '%']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: primaryBlack,
            textColor: '#FFFFFF',
            fontSize: 8,
            fontStyle: 'bold',
            cellPadding: 4,
            halign: 'left'
        },
        alternateRowStyles: {
            fillColor: '#FAFAFA'
        },
        styles: {
            fontSize: 8,
            valign: 'middle',
            textColor: primaryBlack,
            cellPadding: 4
        },
        columnStyles: {
            0: { cellWidth: swatchSize + 6, halign: 'center' },
            1: { cellWidth: 'auto', fontStyle: 'bold' },
            2: { cellWidth: 22, textColor: textSecondary },
            3: { halign: 'center', cellWidth: 32 },
            4: { halign: 'center', cellWidth: 14 },
            5: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
            6: { halign: 'right', cellWidth: 16 }
        },
        margin: { left: margin, right: margin },
        tableLineWidth: 0.2,
        tableLineColor: '#E0E0E0',
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                const detail = patchDetails[data.row.index];
                if (!detail) return;
                const posX = data.cell.x + (data.cell.width - swatchSize) / 2;
                const posY = data.cell.y + (data.cell.height - swatchSize) / 2;
                const imgData = detail.textureId && textureImageDataUrls?.[detail.textureId];
                if (imgData) {
                    try {
                        const format = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
                        doc.addImage(imgData, format, posX, posY, swatchSize, swatchSize);
                    } catch {
                        doc.setFillColor(detail.hex);
                        doc.rect(posX, posY, swatchSize, swatchSize, 'F');
                    }
                } else {
                    doc.setFillColor(detail.hex);
                    doc.rect(posX, posY, swatchSize, swatchSize, 'F');
                }
                doc.setDrawColor('#DDDDDD');
                doc.setLineWidth(0.25);
                doc.rect(posX, posY, swatchSize, swatchSize, 'S');
            }
        }
    });

    const finalTableY = (doc as any).lastAutoTable.finalY || currentY + 30;

    // --- Footer: client, date, tolerance, total ---
    const footerY = Math.min(pageHeight - 28, finalTableY + 16);
    doc.setDrawColor('#E8E8E8');
    doc.setLineWidth(0.4);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFontSize(7);
    doc.setTextColor(textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client: ${clientName}  •  ${email}`, margin, footerY + 5);
    doc.text(`Phone: ${phoneNumber}  •  Tolerance: ±${design.settings.precisionTolerance}mm`, margin, footerY + 10);
    doc.setTextColor(primaryBlack);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${design.totalPrice.toFixed(2)} USD`, pageWidth - margin, footerY + 8, { align: 'right' });

    return doc;
};
