
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  domain?: string;
  theme_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useStore = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [user]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStores(data || []);
      if (data && data.length > 0 && !currentStore) {
        setCurrentStore(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (storeData: { name: string; slug: string; description?: string }) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert([
          {
            ...storeData,
            user_id: user?.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setStores(prev => [data, ...prev]);
      setCurrentStore(data);
      
      toast({
        title: "Success",
        description: "Store created successfully!",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateStore = async (id: string, updates: Partial<Store>) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setStores(prev => prev.map(store => 
        store.id === id ? data : store
      ));
      
      if (currentStore?.id === id) {
        setCurrentStore(data);
      }

      toast({
        title: "Success",
        description: "Store updated successfully!",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    stores,
    currentStore,
    loading,
    setCurrentStore,
    createStore,
    updateStore,
    refetch: fetchStores,
  };
};
