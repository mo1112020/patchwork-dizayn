import React, { useState, useEffect } from 'react';
import { useContactMessages, ContactMessage } from '@/hooks/useContactMessages';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Calendar,
    User,
    Mail,
    MessageSquare,
    Trash2,
    CheckCircle2,
    RefreshCw,
    Clock,
    UserCircle
} from 'lucide-react';
import { format } from 'date-fns';

export const AdminMessages: React.FC = () => {
    const { getMessages, markAsRead, deleteMessage } = useContactMessages();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await getMessages();
            setMessages(data);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Mesajlar yüklenemedi.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
            toast({ title: 'Başarılı', description: 'Mesaj okundu olarak işaretlendi.' });
        } catch (error) {
            toast({ title: 'Hata', description: 'İşlem başarısız.', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        try {
            await deleteMessage(id);
            setMessages(prev => prev.filter(m => m.id !== id));
            toast({ title: 'Başarılı', description: 'Mesaj silindi.' });
        } catch (error) {
            toast({ title: 'Hata', description: 'Silme işlemi başarısız.', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">Mesajlar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">İletişim Mesajları</h1>
                    <p className="text-muted-foreground">İletişim sayfasından gelen mesajları görüntüleyin.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchMessages} className="rounded-xl h-10 gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Yenile
                </Button>
            </header>

            {messages.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">Henüz mesaj yok</h3>
                        <p className="text-sm text-muted-foreground">İletişim formundan mesaj geldiğinde burada görünecektir.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            onMarkRead={handleMarkAsRead}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const MessageItem: React.FC<{
    message: ContactMessage;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ message, onMarkRead, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className={`overflow-hidden border-border/60 shadow-sm transition-all rounded-xl ${!message.is_read ? 'border-l-4 border-l-primary' : ''}`}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${!message.is_read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <UserCircle className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold truncate">{message.name}</h3>
                            {!message.is_read && <Badge className="text-[9px] h-4 px-1">Yeni</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium truncate sm:max-w-md">
                            {message.subject} • {format(new Date(message.created_at), 'd MMM, HH:mm')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg sm:hidden" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                        <Clock className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                    <div className="hidden sm:flex items-center gap-1.5">
                        {!message.is_read && (
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); onMarkRead(message.id); }}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Okundu
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onDelete(message.id); }}>
                            <Trash2 className="w-3.5 h-3.5" /> Sil
                        </Button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <CardContent className="p-5 border-t border-border/50 animate-in slide-in-from-top-2 duration-200 bg-muted/5">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">E-posta</p>
                                <a href={`mailto:${message.email}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" /> {message.email}
                                </a>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tarih</p>
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> {format(new Date(message.created_at), 'd MMMM yyyy, HH:mm')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Mesaj</p>
                            <div className="bg-background border border-border/60 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                {message.message}
                            </div>
                        </div>

                        <div className="flex sm:hidden items-center justify-end gap-2 pt-2">
                            {!message.is_read && (
                                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => onMarkRead(message.id)}>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Okundu
                                </Button>
                            )}
                            <Button variant="outline" size="sm" className="text-xs gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => onDelete(message.id)}>
                                <Trash2 className="w-3.5 h-3.5" /> Sil
                            </Button>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
