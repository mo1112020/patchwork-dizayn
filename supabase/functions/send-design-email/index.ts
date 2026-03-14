// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req: Request) => {
    console.log('Function reached! Method:', req.method)

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        if (!RESEND_API_KEY) {
            console.error('CRITICAL: RESEND_API_KEY is not set in Supabase Secrets!')
            throw new Error('RESEND_API_KEY is missing in Edge Function secrets.')
        }

        const { designData, pdfBase64, userEmail, userName, companyEmail, companyName } = await req.json()

        const adminEmail = (companyEmail && String(companyEmail).trim()) || null
        const rawBrandName = (companyName && String(companyName).trim()) || 'Patchwork Dizayn'

        // Remove characters that could break the "From" header
        const brandName = rawBrandName.replace(/[<>"]/g, '');

        if (!adminEmail) {
            console.error('Company email not configured.')
            return new Response(
                JSON.stringify({ error: 'Recipient email is not configured in Admin Settings.' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        console.log('Processing email for:', designData?.name, 'to:', adminEmail)

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: `${brandName} <onboarding@resend.dev>`,
                to: [adminEmail],
                subject: `New Rug Design: ${designData.name}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A1A1A;">New Rug Design Submitted</h2>
            <div style="background: #F5F5F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Design Name:</strong> ${designData.name}</p>
              <p><strong>Dimensions:</strong> ${designData.width}m × ${designData.height}m</p>
              <p><strong>Total Area:</strong> ${designData.totalArea.toFixed(2)} m²</p>
              <p><strong>Estimated Price:</strong> €${designData.totalPrice.toFixed(2)}</p>
              <p><strong>Number of Patches:</strong> ${designData.patches.length}</p>
              ${designData.metadata?.clientName ? `<p><strong>Client:</strong> ${designData.metadata.clientName}</p>` : ''}
              ${designData.metadata?.referenceNumber ? `<p><strong>Reference:</strong> ${designData.metadata.referenceNumber}</p>` : ''}
            </div>
            <div style="background: #E8E1D9; padding: 15px; border-radius: 8px;">
              <p><strong>Submitted by:</strong> ${userName || 'Anonymous'}</p>
              <p><strong>Email:</strong> ${userEmail || 'Not provided'}</p>
              ${designData.metadata?.phoneNumber ? `<p><strong>Phone:</strong> ${designData.metadata.phoneNumber}</p>` : ''}
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="margin-top: 20px; color: #666;">The complete specification PDF is attached to this email.</p>
          </div>
        `,
                attachments: [
                    {
                        filename: `${designData.name.replace(/[^a-z0-9]/gi, '_')}_spec.pdf`,
                        content: pdfBase64,
                    },
                ],
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            console.error('Resend API error:', JSON.stringify(data))
            throw new Error(data.message || 'Resend API error')
        }

        console.log('Email sent successfully:', data.id)

        return new Response(
            JSON.stringify({ success: true, messageId: data.id }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Email function error:', errorMessage)
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    }
})
