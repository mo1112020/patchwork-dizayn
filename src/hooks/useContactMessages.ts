import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactMessage {
    id: string;
    created_at: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
}

export const useContactMessages = () => {
    const submitMessage = useCallback(async (data: { name: string, email: string, subject: string, message: string }) => {
        const { error } = await supabase
            .from('contact_messages' as any)
            .insert([data]);

        if (error) {
            console.error('Error submitting contact message:', error);
            throw error;
        }
    }, []);

    const getMessages = useCallback(async (): Promise<ContactMessage[]> => {
        const { data, error } = await supabase
            .from('contact_messages' as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error getting contact messages:', error);
            throw error;
        }

        return (data as any) || [];
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        const { error } = await supabase
            .from('contact_messages' as any)
            .update({ is_read: true } as any)
            .eq('id', id);

        if (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }, []);

    const deleteMessage = useCallback(async (id: string) => {
        const { error } = await supabase
            .from('contact_messages' as any)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }, []);

    return {
        submitMessage,
        getMessages,
        markAsRead,
        deleteMessage
    };
};
