import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDesigns } from '@/hooks/useDesigns';
import { useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/context/LanguageContext';
import { RugDesign } from '@/types/design';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderStatusBadge } from '@/components/designer/OrderStatusBadge';
import {
    FolderHeart,
    Trash2,
    ExternalLink,
    Grid3X3,
    Calendar,
    Box,
    User,
    LogOut,
    ArrowRight,
    Plus,
    Loader2,
    ShoppingBag,
    ClipboardList,
    Mail,
    Phone,
    Truck
} from 'lucide-react';
import { format } from 'date-fns';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
    const { getDesigns, deleteDesign } = useDesigns();
    const { orders, loading: ordersLoading } = useOrders();
    const { toast } = useToast();
    const [designs, setDesigns] = useState<RugDesign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        const fetchDesigns = async () => {
            try {
                const data = await getDesigns();
                setDesigns(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDesigns();
    }, [isAuthenticated, authLoading, navigate, getDesigns]);

    const handleDelete = async (id: string) => {
        if (!confirm(t('profile.deleteConfirm'))) return;

        try {
            await deleteDesign(id);
            setDesigns(prev => prev.filter(d => d.id !== id));
            toast({
                title: t('profile.deleted'),
                description: t('profile.deletedDesc'),
            });
        } catch (error) {
            toast({
                title: t('profile.error'),
                description: t('profile.deleteFailed'),
                variant: 'destructive',
            });
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    if (authLoading || (isAuthenticated && isLoading)) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">{t('profile.loading')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-1 page-container pt-24 pb-16">
                <Tabs defaultValue="designs">
                    <div className="flex flex-col lg:flex-row gap-12 items-start">

                        {/* User Profile Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full lg:w-80 space-y-6"
                        >
                            <div className="bg-card/50 backdrop-blur-xl border border-border shadow-elevation-lg rounded-[2.5rem] p-8 sticky top-32">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative group mb-8">
                                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/40 to-primary/10 rounded-full blur-lg opacity-40 group-hover:opacity-100 transition duration-500"></div>
                                        <div className="relative w-28 h-28 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-2xl overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
                                            <User className="w-12 h-12 text-primary relative z-10" />
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold mb-1 tracking-tight truncate w-full">
                                        {user?.user_metadata?.full_name || t('profile.user')}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-8 truncate w-full opacity-70">
                                        {user?.email}
                                    </p>

                                    <div className="w-full space-y-4">
                                        {/* Main Action */}
                                        <Button
                                            className="w-full rounded-2xl h-14 font-bold shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all text-base group mb-2"
                                            onClick={() => navigate('/designer')}
                                        >
                                            <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                                            {t('profile.newDesign')}
                                        </Button>

                                        {/* Navigation Tabs */}
                                        <div className="space-y-3 pt-2 border-t border-border/50">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.2em] px-4 py-2">
                                                {t('profile.trackOrders')}
                                            </p>
                                            <TabsList className="bg-transparent p-0 flex flex-col w-full gap-2.5 h-auto border-0">
                                                <TabsTrigger
                                                    value="designs"
                                                    className="w-full rounded-[1.25rem] h-14 px-6 text-sm font-bold bg-muted/30 border border-transparent data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-elevation-sm transition-all gap-4 justify-start group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center group-data-[state=active]:bg-primary group-data-[state=active]:border-primary transition-colors">
                                                        <Grid3X3 className="w-4 h-4 text-muted-foreground group-data-[state=active]:text-primary-foreground" />
                                                    </div>
                                                    <span className="text-muted-foreground group-data-[state=active]:text-foreground transition-colors">
                                                        {t('profile.designs')}
                                                    </span>
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="orders"
                                                    className="w-full rounded-[1.25rem] h-14 px-6 text-sm font-bold bg-muted/30 border border-transparent data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-elevation-sm transition-all gap-4 justify-start group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center group-data-[state=active]:bg-primary group-data-[state=active]:border-primary transition-colors">
                                                        <ShoppingBag className="w-4 h-4 text-muted-foreground group-data-[state=active]:text-primary-foreground" />
                                                    </div>
                                                    <span className="text-muted-foreground group-data-[state=active]:text-foreground transition-colors">
                                                        {t('profile.myOrders')}
                                                    </span>
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>

                                        {/* Logout Section */}
                                        <div className="pt-6 mt-6 border-t border-border/50 flex flex-col items-center">
                                            <Button
                                                variant="ghost"
                                                className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-2xl h-12 font-bold text-sm transition-all border border-transparent hover:border-destructive/10 gap-2"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="w-4 h-4" />
                                                {t('profile.signOut')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Content Section */}
                        <div className="flex-1 w-full overflow-hidden">
                            <div className="space-y-10">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                                    <header>
                                        <h1 className="text-5xl font-black tracking-tighter mb-3 leading-[1.1]">{t('profile.designs')}</h1>
                                        <p className="text-muted-foreground text-lg opacity-70 font-medium">{t('profile.manageDesigns')}</p>
                                    </header>
                                </div>

                                <TabsContent value="designs" className="mt-0 focus-visible:ring-0">
                                    {designs.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center justify-center py-32 text-center bg-muted/20 border-3 border-dashed border-border/80 rounded-[3rem] group hover:border-primary/30 transition-colors duration-500"
                                        >
                                            <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center mb-8 border border-border shadow-soft relative overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <FolderHeart className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <h3 className="text-2xl font-black mb-3">{t('profile.noDesigns')}</h3>
                                            <p className="text-muted-foreground max-w-sm mb-10 text-lg leading-relaxed px-6">
                                                {t('profile.noDesignsHint')}
                                            </p>
                                            <Button size="lg" className="rounded-[1.25rem] h-16 px-10 text-lg font-black shadow-xl shadow-primary/20" onClick={() => navigate('/designer')}>
                                                {t('profile.openDesigner')}
                                                <ArrowRight className="ml-3 w-6 h-6" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
                                            <AnimatePresence mode="popLayout">
                                                {designs.map((design, index) => (
                                                    <motion.div
                                                        key={design.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                                    >
                                                        <Card className="flex flex-col h-full overflow-hidden border border-border/60 hover:border-primary/40 transition-all duration-500 rounded-[2.5rem] shadow-sm hover:shadow-elevation-xl bg-card/60 backdrop-blur-sm group">
                                                            <div className="aspect-[16/10] bg-muted/40 relative flex items-center justify-center overflow-hidden">
                                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-50"></div>
                                                                <div className="flex flex-col items-center gap-3 text-muted-foreground/20 transition-all group-hover:scale-110 group-hover:text-primary/10 duration-700">
                                                                    <Box className="w-20 h-20" />
                                                                </div>
                                                                <Badge className="absolute top-6 left-6 bg-background/90 backdrop-blur-md text-foreground border-border text-[11px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                                                                    {design.width.toFixed(1)}m × {design.height.toFixed(1)}m
                                                                </Badge>
                                                            </div>
                                                            <CardHeader className="p-8 pb-4">
                                                                <div className="flex items-start justify-between gap-6">
                                                                    <div className="space-y-1.5 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t('profile.preview')}</span>
                                                                        </div>
                                                                        <CardTitle className="text-2xl font-black truncate tracking-tight leading-none group-hover:text-primary transition-colors duration-300">
                                                                            {design.name}
                                                                        </CardTitle>
                                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold opacity-60">
                                                                            <Calendar className="w-3.5 h-3.5" />
                                                                            {design.updatedAt ? format(new Date(design.updatedAt), 'd MMM yyyy') : '...'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="icon"
                                                                            className="rounded-2xl h-11 w-11 bg-background border border-border hover:border-primary/40 transition-colors shadow-sm"
                                                                            onClick={() => navigate(`/designer?id=${design.id}`)}
                                                                            title={t('profile.openInDesigner')}
                                                                        >
                                                                            <ExternalLink className="w-5 h-5" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="rounded-2xl h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all opacity-40 hover:opacity-100"
                                                                            onClick={() => handleDelete(design.id!)}
                                                                            title={t('profile.deleteDesign')}
                                                                        >
                                                                            <Trash2 className="w-5 h-5" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="px-8 pb-8 pt-4 flex flex-col flex-1">
                                                                {(() => {
                                                                    const designOrder = orders.find(o => o.design_id === design.id);
                                                                    const confirmedPrice = designOrder && designOrder.status !== 'pending'
                                                                        ? designOrder.design_snapshot?.totalPrice
                                                                        : undefined;
                                                                    return (
                                                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                                                            <div className="bg-background/80 rounded-2xl p-4 border border-border/50 shadow-sm flex flex-col justify-center">
                                                                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-1 opacity-60">{t('profile.totalArea')}</p>
                                                                                <p className="text-lg font-black font-mono tracking-tight">{design.totalArea.toFixed(2)} m²</p>
                                                                            </div>
                                                                            <div className="bg-primary/[0.03] rounded-2xl p-4 border border-primary/10 shadow-sm flex flex-col justify-center">
                                                                                <p className="text-[9px] text-primary uppercase font-black tracking-[0.15em] mb-1 opacity-70">{t('profile.price')}</p>
                                                                                {confirmedPrice != null ? (
                                                                                    <p className="text-lg font-black font-mono tracking-tight text-primary">€{Number(confirmedPrice).toFixed(2)}</p>
                                                                                ) : (
                                                                                    <p className="text-xs font-bold text-muted-foreground opacity-50 italic">
                                                                                        {designOrder ? t('orderStatusBadge.pending') : '—'}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
                                                                <Button className="w-full rounded-2xl font-black h-14 mt-auto shadow-sm group/btn relative overflow-hidden transition-all text-base" variant="secondary" onClick={() => navigate(`/designer?id=${design.id}`)}>
                                                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                                                        {t('profile.editDesign')}
                                                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                                                    </span>
                                                                </Button>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="orders" className="mt-0 focus-visible:ring-0">
                                    <div className="space-y-6">
                                        {ordersLoading ? (
                                            <div className="flex items-center justify-center py-20">
                                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center justify-center py-32 text-center bg-muted/20 border-3 border-dashed border-border/80 rounded-[3rem]"
                                            >
                                                <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center mb-8 border border-border shadow-soft">
                                                    <ClipboardList className="w-10 h-10 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-2xl font-black mb-3">{t('profile.noOrders')}</h3>
                                                <p className="text-muted-foreground max-w-sm mb-10 text-lg">
                                                    {t('profile.noOrdersHint')}
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-6 pb-8">
                                                {orders.map((order, index) => (
                                                    <motion.div
                                                        key={order.id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Card className="border border-border/60 rounded-[2rem] overflow-hidden bg-card/60 backdrop-blur-sm group hover:border-primary/30 transition-all duration-300">
                                                            <CardHeader className="p-8 pb-4">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                            <ShoppingBag className="w-6 h-6 text-primary/70" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('profile.orderDate')}</span>
                                                                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
                                                                                <span className="text-xs font-bold">{format(new Date(order.created_at), 'd MMM yyyy, HH:mm')}</span>
                                                                            </div>
                                                                            <CardTitle className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                                                                                ID: {order.id.slice(0, 8)}
                                                                            </CardTitle>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="p-8 pt-4">
                                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6 border-t border-border/50">
                                                                    <div className="flex flex-wrap gap-10">
                                                                        <div className="space-y-1">
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">{t('profile.designs')}</p>
                                                                            <p className="font-bold text-lg">{order.design_snapshot?.name || 'Rug Design'}</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">{t('profile.totalArea')}</p>
                                                                            <p className="font-black text-lg font-mono">{(order.design_snapshot?.totalArea || 0).toFixed(2)} m²</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{t('profile.price')}</p>
                                                                            <p className="font-black text-lg font-mono text-primary">
                                                                                {order.status === 'pending' ? (
                                                                                    <span className="text-muted-foreground opacity-50 text-xs italic">{t('orderStatusBadge.pending')}</span>
                                                                                ) : (
                                                                                    `€${(order.design_snapshot?.totalPrice || 0).toFixed(2)}`
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                        {order.design_snapshot?.metadata?.phoneNumber && (
                                                                            <div className="space-y-1">
                                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">{t('designerSetup.phoneNumber')}</p>
                                                                                <div className="flex items-center gap-2 text-primary">
                                                                                    <Phone className="w-4 h-4" />
                                                                                    <p className="font-bold text-lg">{order.design_snapshot.metadata.phoneNumber}</p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <Button
                                                                        variant="outline"
                                                                        className="rounded-2xl h-14 px-8 font-black text-base border-2 hover:bg-muted"
                                                                        onClick={() => navigate(`/designer?id=${order.design_id}`)}
                                                                    >
                                                                        {t('profile.editDesign')}
                                                                    </Button>
                                                                </div>

                                                                {order.tracking_number && (
                                                                    <div className="mt-8 p-6 bg-primary/[0.03] border border-primary/10 rounded-2xl flex items-center gap-4 group/tracking hover:bg-primary/[0.05] transition-colors">
                                                                        <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                                                                            <Truck className="w-6 h-6 text-primary group-hover/tracking:scale-110 transition-transform" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{t('profile.trackingNumber') || 'Takip Numarası'}</p>
                                                                            <p className="text-xl font-black font-mono tracking-wider">{order.tracking_number}</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {order.admin_note && (
                                                                    <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                                                                        <Mail className="w-6 h-6 text-primary mt-1" />
                                                                        <div className="space-y-1">
                                                                            <p className="text-xs font-black uppercase tracking-widest text-primary/70">Admin Note</p>
                                                                            <p className="text-base font-medium leading-relaxed">{order.admin_note}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </main>
        </div>
    );
};

export default Profile;
