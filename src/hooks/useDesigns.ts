import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RugDesign, Patch } from '@/types/design';
import { DEFAULT_WASTE_ALLOWANCE, DEFAULT_PRECISION_TOLERANCE } from '@/constants/designer-defaults';

const generateShortId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useDesigns = () => {
  const mapToRugDesign = (d: any): RugDesign => {
    // Patches column stores either a plain array (old format) or an object
    // { items, metadata, constraints, settings } (new format that preserves all design state)
    const rawPatches = d.patches;
    const isNewFormat = rawPatches && !Array.isArray(rawPatches) && rawPatches.items !== undefined;
    const patches: Patch[] = isNewFormat ? (rawPatches.items || []) : (rawPatches || []);
    const metadata = isNewFormat ? (rawPatches.metadata || {}) : (d.metadata || {});
    const constraints = isNewFormat ? (rawPatches.constraints || {}) : (d.constraints || {});
    const settings = isNewFormat ? (rawPatches.settings || {}) : (d.settings || {});

    return {
      id: d.id,
      userId: d.user_id,
      name: d.name,
      width: d.width,
      height: d.height,
      patches,
      totalArea: d.total_area || d.width * d.height,
      totalPrice: d.total_price || 0,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      constraints: {
        lockRotation: false,
        lockAspectRatio: false,
        lockPosition: false,
        lockWholeDesign: false,
        ...constraints,
      },
      metadata: {
        clientName: '',
        referenceNumber: '',
        manufacturerNotes: '',
        orientationMarker: 'North',
        threadColor: '#E8E4DC',
        ...metadata,
      },
      settings: {
        wasteAllowance: DEFAULT_WASTE_ALLOWANCE,
        precisionTolerance: DEFAULT_PRECISION_TOLERANCE,
        ...settings,
      },
    };
  };

  const saveDesign = useCallback(async (design: RugDesign, name?: string): Promise<{ id: string } | null> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in to save a design');
    }

    // Pack metadata, constraints and settings into the patches JSON column
    // (the DB schema has no separate columns for them)
    const patchesPayload = {
      items: design.patches,
      metadata: design.metadata || {},
      constraints: design.constraints || {},
      settings: design.settings || {},
    };

    // Only reuse the existing ID when the current user owns the design.
    // If the design was loaded from a shared link (different owner), generate a
    // new ID so we INSERT a copy rather than trying to UPDATE someone else's row.
    const ownedId = design.id && design.userId === user.id ? design.id : undefined;

    const designData: any = {
      id: ownedId || generateShortId(),
      user_id: user.id,
      name: name || design.name || 'Untitled Design',
      width: design.width,
      height: design.height,
      patches: JSON.parse(JSON.stringify(patchesPayload)),
      total_area: design.totalArea,
      total_price: design.totalPrice,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('designs')
      .upsert(designData, { onConflict: 'id' })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving design:', error);
      throw new Error(error.message);
    }

    return data;
  }, []);

  const updateDesign = useCallback(async (designId: string, design: RugDesign, name?: string): Promise<void> => {
    const patchesPayload = {
      items: design.patches,
      metadata: design.metadata || {},
      constraints: design.constraints || {},
      settings: design.settings || {},
    };

    const { error } = await supabase
      .from('designs')
      .update({
        name: name || design.name || 'Untitled Design',
        width: design.width,
        height: design.height,
        patches: JSON.parse(JSON.stringify(patchesPayload)),
        total_area: design.totalArea,
        total_price: design.totalPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', designId);

    if (error) {
      console.error('Error updating design:', error);
      throw new Error(error.message);
    }
  }, []);

  const getDesigns = useCallback(async (): Promise<RugDesign[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching designs:', error);
      throw new Error(error.message);
    }

    return (data || []).map(mapToRugDesign);
  }, []);

  const getDesign = useCallback(async (id: string): Promise<RugDesign | null> => {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching design:', error);
      return null;
    }

    return mapToRugDesign(data);
  }, []);

  const deleteDesign = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting design:', error);
      throw new Error(error.message);
    }
  }, []);

  return {
    saveDesign,
    updateDesign,
    getDesigns,
    getDesign,
    deleteDesign,
  };
};
