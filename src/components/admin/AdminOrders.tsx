import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { OrderStatusBadge } from '@/components/designer/OrderStatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Loader2,
    Calendar,
    User,
    Phone,
    Mail,
    Box,
    ExternalLink,
    ClipboardList,
    MessageSquare,
    Save,
    CheckCircle2,
    Truck,
    Clock,
    RefreshCw,
    Archive,
    ArchiveRestore,
    Inbox,
    Euro,
    Send,
    Trash2
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchAllOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10000); // explicit high limit to ensure all orders are returned

        if (error) {
            toast({
                title: 'Hata',
                description: 'Siparişler yüklenemedi.',
                variant: 'destructive',
            });
        } else {
            setOrders(data as unknown as Order[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    // Archive stored in DB (design_snapshot._archived) so it persists across devices
    const archiveOrder = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const newSnapshot = { ...order.design_snapshot, _archived: true };
        const { error } = await supabase
            .from('orders')
            .update({ design_snapshot: newSnapshot } as any)
            .eq('id', orderId);
        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, design_snapshot: newSnapshot } : o));
            toast({ title: 'Arşivlendi', description: 'Sipariş arşive taşındı.' });
        }
    };

    const deleteOrder = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);
        if (!error) {
            setOrders(prev => prev.filter(o => o.id !== orderId));
            toast({ title: 'Silindi', description: 'Sipariş kalıcı olarak silindi.' });
        } else {
            toast({ title: 'Hata', description: 'Sipariş silinemedi.', variant: 'destructive' });
        }
    };

    const unarchiveOrder = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const { _archived, ...rest } = order.design_snapshot || {};
        const newSnapshot = rest;
        const { error } = await supabase
            .from('orders')
            .update({ design_snapshot: newSnapshot } as any)
            .eq('id', orderId);
        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, design_snapshot: newSnapshot } : o));
            toast({ title: 'Geri Alındı', description: 'Sipariş aktif listeye taşındı.' });
        }
    };

    const updateOrderStatus = async (orderId: string, status: Order['status'], adminNote: string | null, trackingNumber: string | null, finalPrice?: number) => {
        setUpdatingId(orderId);

        const updateData: any = { status, admin_note: adminNote, tracking_number: trackingNumber };

        // If price is provided, update it inside design_snapshot
        if (finalPrice !== undefined) {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                const newSnapshot = { ...order.design_snapshot, totalPrice: finalPrice };
                updateData.design_snapshot = newSnapshot;
            }
        }

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (error) {
            toast({
                title: 'Hata',
                description: 'Sipariş güncellenemedi.',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Başarılı',
                description: 'Sipariş güncellendi.',
            });
            setOrders(prev => prev.map(o => o.id === orderId ? {
                ...o,
                status,
                admin_note: adminNote,
                tracking_number: trackingNumber,
                design_snapshot: finalPrice !== undefined ? { ...o.design_snapshot, totalPrice: finalPrice } : o.design_snapshot
            } : o));
        }
        setUpdatingId(null);
    };

    const activeOrders = orders.filter(o => !o.design_snapshot?._archived);
    const archivedOrders = orders.filter(o => o.design_snapshot?._archived);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">Siparişler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sipariş Yönetimi</h1>
                    <p className="text-muted-foreground">Tüm tasarım taleplerini buradan yönetin.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAllOrders} className="rounded-xl h-10 gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Yenile
                </Button>
            </header>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList className="bg-muted/40 p-1 rounded-xl h-auto border border-border/50">
                    <TabsTrigger value="active" className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all gap-2">
                        <Inbox className="w-4 h-4" />
                        Aktif ({activeOrders.length})
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all gap-2">
                        <Archive className="w-4 h-4" />
                        Arşiv ({archivedOrders.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-0 focus-visible:ring-0">
                    {activeOrders.length === 0 ? (
                        <Card className="border-dashed border-2 bg-muted/20">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <ClipboardList className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold">Aktif sipariş yok</h3>
                                <p className="text-sm text-muted-foreground">Yeni siparişler burada görünecektir.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {activeOrders.map((order) => (
                                <OrderItem
                                    key={order.id}
                                    order={order}
                                    isUpdating={updatingId === order.id}
                                    onUpdate={updateOrderStatus}
                                    onArchive={() => archiveOrder(order.id)}
                                    onDelete={() => deleteOrder(order.id)}
                                    archiveMode="archive"
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="archived" className="mt-0 focus-visible:ring-0">
                    {archivedOrders.length === 0 ? (
                        <Card className="border-dashed border-2 bg-muted/20">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <Archive className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold">Arşiv boş</h3>
                                <p className="text-sm text-muted-foreground">Arşivlenen siparişler burada görünecektir.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {archivedOrders.map((order) => (
                                <OrderItem
                                    key={order.id}
                                    order={order}
                                    isUpdating={updatingId === order.id}
                                    onUpdate={updateOrderStatus}
                                    onArchive={() => unarchiveOrder(order.id)}
                                    onDelete={() => deleteOrder(order.id)}
                                    archiveMode="unarchive"
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

const OrderItem: React.FC<{
    order: Order;
    isUpdating: boolean;
    onUpdate: (id: string, status: Order['status'], note: string | null, tracking: string | null, price?: number) => void;
    onArchive: () => void;
    onDelete: () => void;
    archiveMode: 'archive' | 'unarchive';
}> = ({ order, isUpdating, onUpdate, onArchive, onDelete, archiveMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [note, setNote] = useState<string>(order.admin_note || '');
    const [tracking, setTracking] = useState<string>(order.tracking_number || '');
    const [status, setStatus] = useState<Order['status']>(order.status);
    const [price, setPrice] = useState<string>((order.design_snapshot?.totalPrice || 0).toString());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const clientName = order.design_snapshot?.metadata?.clientName || 'İsimsiz Müşteri';
    const phoneNumber = order.design_snapshot?.metadata?.phoneNumber || 'Belirtilmedi';

    return (
        <Card className="overflow-hidden border-border/60 shadow-sm transition-all rounded-xl">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 border border-border flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary/70" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold truncate">{clientName}</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">#{order.id.slice(0, 8)} • {format(new Date(order.created_at), 'd MMM, HH:mm')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end gap-0.5 text-[10px] font-bold sm:flex-row sm:items-center sm:gap-4 sm:text-xs sm:mr-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Box className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {(order.design_snapshot?.totalArea || 0).toFixed(2)}m²</span>
                        <span className="flex items-center gap-1.5 text-primary">€{(order.design_snapshot?.totalPrice || 0).toFixed(2)}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg shrink-0">
                        <Clock className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <CardContent className="p-0 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Design Details */}
                        <div className="p-5 space-y-4 border-b md:border-b-0 md:border-r border-border/40 bg-muted/5">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Box className="w-3.5 h-3.5" /> Tasarım Bilgileri
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase">Model</p>
                                    <p className="text-sm font-bold truncate">{order.design_snapshot?.name || 'Halı'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase">Ölçüler</p>
                                    <p className="text-sm font-bold">{order.design_snapshot?.width}m × {order.design_snapshot?.height}m</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase">İletişim</p>
                                    <p className="text-xs font-bold text-primary flex items-center gap-1.5"><Phone className="w-3 h-3" /> {phoneNumber}</p>
                                </div>
                                <div className="flex items-end">
                                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold gap-1.5 px-3" asChild>
                                        <a href={`/designer?id=${order.design_id}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-3 h-3" /> Tasarımı Gör
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-5 space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Truck className="w-3.5 h-3.5" /> Yönetim
                            </h4>
                            <div className="space-y-3">
                                {/* Status Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Sipariş Durumu</label>
                                    <Select value={status} onValueChange={(val) => setStatus(val as Order['status'])}>
                                        <SelectTrigger className="h-9 text-xs rounded-lg font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">⏳ Fiyat Bekleniyor</SelectItem>
                                            <SelectItem value="price_sent">💬 Fiyat Gönderildi</SelectItem>
                                            <SelectItem value="in_progress">🔄 Hazırlanıyor</SelectItem>
                                            <SelectItem value="ready">✅ Hazır</SelectItem>
                                            <SelectItem value="delivered">📦 Teslim Edildi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Takip No</label>
                                        <Input
                                            placeholder="Takip no..."
                                            className="h-9 text-xs rounded-lg"
                                            value={tracking}
                                            onChange={(e) => setTracking(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Fiyat (€)</label>
                                        <div className="relative">
                                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="Fiyat..."
                                                className="h-9 text-xs rounded-lg pl-8"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2 grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            className="h-10 rounded-lg font-bold text-xs gap-2"
                                            disabled={isUpdating}
                                            onClick={() => onUpdate(order.id, status, note, tracking, parseFloat(price))}
                                        >
                                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                            Güncelle
                                        </Button>
                                        <Button
                                            className="h-10 rounded-lg font-bold text-xs gap-2 bg-green-600 hover:bg-green-700"
                                            disabled={isUpdating}
                                            onClick={() => {
                                                setStatus('price_sent');
                                                onUpdate(order.id, 'price_sent', note, tracking, parseFloat(price));
                                            }}
                                        >
                                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                            Fiyatı Gönder
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="px-4 py-2 rounded-xl text-xs font-black tracking-wide border-2">
                                        ID: {order.id.slice(0, 8)}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-9 rounded-lg text-xs font-bold gap-2 ${archiveMode === 'archive' ? 'hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30' : 'hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/30'}`}
                                        onClick={(e) => { e.stopPropagation(); onArchive(); }}
                                    >
                                        {archiveMode === 'archive' ? (
                                            <><Archive className="w-3.5 h-3.5" /> Arşivle</>
                                        ) : (
                                            <><ArchiveRestore className="w-3.5 h-3.5" /> Geri Al</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 rounded-lg text-xs font-bold gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                        onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Sil
                                    </Button>
                                </div>

                                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Siparişi Sil</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Bu siparişi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                                onClick={onDelete}
                                            >
                                                Kalıcı Olarak Sil
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Not (Müşteriye Görünür)</label>
                                    <Textarea
                                        placeholder="Müşteri notu..."
                                        className="min-h-[60px] text-xs rounded-lg py-2"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
