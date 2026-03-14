import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PRICE_PER_SQM,
  DEFAULT_RUG_WIDTH,
  DEFAULT_RUG_HEIGHT,
  GRID_UNIT_SIZE,
  CANVAS_GRID_SIZE,
  DEFAULT_WASTE_ALLOWANCE,
  DEFAULT_PRECISION_TOLERANCE,
} from '@/constants/designer-defaults';

export interface DesignerSettingsRow {
  price_per_sqm: number;
  default_rug_width: number;
  default_rug_height: number;
  waste_allowance: number;
  precision_tolerance: number;
  grid_unit_size: number;
  canvas_grid_size: number;
  // Admin-controlled settings
  company_email: string;
  company_name: string;
  pdf_header_text: string;
  default_tool_mode: string;
  show_grid: boolean;
  show_rulers: boolean;
  max_rug_width: number;
  max_rug_height: number;
  show_price: boolean;
  /** Admin-defined thread (ip) colors – hex codes without # (e.g. E8E4DC). Designer shows only these. */
  thread_colors: string[];
  /** Hero section (home page) image URLs. Multiple = sliding carousel. */
  hero_images: string[];
}

const DEFAULTS: DesignerSettingsRow = {
  price_per_sqm: PRICE_PER_SQM,
  default_rug_width: DEFAULT_RUG_WIDTH,
  default_rug_height: DEFAULT_RUG_HEIGHT,
  waste_allowance: DEFAULT_WASTE_ALLOWANCE,
  precision_tolerance: DEFAULT_PRECISION_TOLERANCE,
  grid_unit_size: GRID_UNIT_SIZE,
  canvas_grid_size: CANVAS_GRID_SIZE,
  company_email: '',
  company_name: '',
  pdf_header_text: 'PROFESSIONAL RUG DESIGN • SPECIFICATION v2.5',
  default_tool_mode: 'add',
  show_grid: true,
  show_rulers: true,
  max_rug_width: 5,
  max_rug_height: 5,
  show_price: true,
  thread_colors: [],
  hero_images: [],
};

async function fetchSettings(): Promise<DesignerSettingsRow> {
  const { data, error } = await supabase
    .from('designer_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !data) return DEFAULTS;
  const d = data as Record<string, unknown>;
  return {
    price_per_sqm: Number(d.price_per_sqm),
    default_rug_width: Number(d.default_rug_width),
    default_rug_height: Number(d.default_rug_height),
    waste_allowance: Number(d.waste_allowance),
    precision_tolerance: Number(d.precision_tolerance),
    grid_unit_size: Number(d.grid_unit_size),
    canvas_grid_size: Number(d.canvas_grid_size),
    company_email: d.company_email != null && d.company_email !== '' ? String(d.company_email) : DEFAULTS.company_email,
    company_name: d.company_name != null && d.company_name !== '' ? String(d.company_name) : DEFAULTS.company_name,
    pdf_header_text: String(d.pdf_header_text ?? DEFAULTS.pdf_header_text),
    default_tool_mode: String(d.default_tool_mode ?? DEFAULTS.default_tool_mode),
    show_grid: d.show_grid !== false,
    show_rulers: d.show_rulers !== false,
    max_rug_width: Number(d.max_rug_width ?? DEFAULTS.max_rug_width),
    max_rug_height: Number(d.max_rug_height ?? DEFAULTS.max_rug_height),
    show_price: d.show_price !== false,
    thread_colors: Array.isArray(d.thread_colors)
      ? (d.thread_colors as string[]).filter((c) => typeof c === 'string' && /^[0-9A-Fa-f]{6}$/.test(String(c).replace(/^#/, '')))
      : [],
    hero_images: Array.isArray(d.hero_images)
      ? (d.hero_images as string[]).filter((c) => typeof c === 'string' && c.length > 0)
      : [],
  };
}

const SETTINGS_QUERY_KEY = ['designer-settings'] as const;

export function useDesignerSettings() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchSettings,
    staleTime: 2 * 60 * 1000,
    placeholderData: DEFAULTS,
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<DesignerSettingsRow>) => {
      const payload: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) payload[key] = val;
      }
      const { error } = await supabase
        .from('designer_settings')
        .update(payload as Record<string, unknown>)
        .eq('id', 'default')
        .select()
        .single();

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY }),
  });

  const settings: DesignerSettingsRow = query.data ?? DEFAULTS;

  return {
    settings,
    isLoading: query.isLoading,
    isError: query.isError,
    updateSettings: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    /** Refetch from DB (e.g. before submit) so payload uses latest company_email. */
    refetch: query.refetch,
  };
}
