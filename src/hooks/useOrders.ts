import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Order {
  id: string;
  user_id: string;
  design_id: string | null;
  design_snapshot: any;
  status: 'pending' | 'price_sent' | 'in_progress' | 'ready' | 'delivered';
  admin_note: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as Order[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('user-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchOrders]);

  const createOrder = useCallback(async (designId: string | undefined, designSnapshot: any): Promise<Order | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        design_id: designId || null,
        design_snapshot: designSnapshot,
        status: 'pending',
      } as any)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    await fetchOrders();
    return data as unknown as Order;
  }, [user, fetchOrders]);

  const getLatestOrderForDesign = useCallback((designId?: string) => {
    if (!designId) return null;
    return orders.find(o => o.design_id === designId) || null;
  }, [orders]);

  return { orders, loading, createOrder, fetchOrders, getLatestOrderForDesign };
};
