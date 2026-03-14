// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Max-Age': '86400',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

function unauthorized(msg: string) {
  return jsonResponse({ error: msg }, 401)
}

serve(async (req: Request) => {
  // CORS preflight: must return 200 with CORS headers so browser allows the actual POST.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const secret = req.headers.get('x-admin-secret')
  const expected = Deno.env.get('ADMIN_SECRET')
  if (!expected || secret !== expected) {
    return unauthorized('Invalid admin secret')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceRole)

  try {
    const body = await req.json().catch(() => ({}))
    const { action, payload } = body

    switch (action) {
      case 'updateSettings': {
        const { error } = await supabase
          .from('designer_settings')
          .update({
            price_per_sqm: payload.price_per_sqm,
            default_rug_width: payload.default_rug_width,
            default_rug_height: payload.default_rug_height,
            waste_allowance: payload.waste_allowance,
            precision_tolerance: payload.precision_tolerance,
            grid_unit_size: payload.grid_unit_size,
            canvas_grid_size: payload.canvas_grid_size,
          })
          .eq('id', 'default')
        if (error) throw error
        return jsonResponse({ ok: true })
      }

      case 'createTexture': {
        const { error } = await supabase.from('rug_textures').insert({
          id: payload.id,
          name: payload.name,
          code: payload.code,
          hex: payload.hex || null,
          display_order: payload.display_order ?? 999,
        })
        if (error) throw error
        return jsonResponse({ ok: true })
      }

      case 'updateTexture': {
        const { error } = await supabase
          .from('rug_textures')
          .update({
            name: payload.name,
            code: payload.code,
            hex: payload.hex || null,
          })
          .eq('id', payload.id)
        if (error) throw error
        return jsonResponse({ ok: true })
      }

      case 'deleteTexture': {
        const { error } = await supabase.from('rug_textures').delete().eq('id', payload.id)
        if (error) throw error
        return jsonResponse({ ok: true })
      }

      case 'setTextureImagePath': {
        const { error } = await supabase
          .from('rug_textures')
          .update({ image_path: payload.image_path })
          .eq('id', payload.id)
        if (error) throw error
        return jsonResponse({ ok: true })
      }

      case 'uploadTextureImage': {
        const { id, base64, contentType } = payload
        const ext = contentType?.includes('png') ? 'png' : 'jpg'
        const path = `${id}.${ext}`
        const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
        const { error: uploadError } = await supabase.storage
          .from('rug-textures')
          .upload(path, bin, { contentType: contentType || 'image/jpeg', upsert: true })
        if (uploadError) throw uploadError
        const { error: updateError } = await supabase
          .from('rug_textures')
          .update({ image_path: path })
          .eq('id', id)
        if (updateError) throw updateError
        return jsonResponse({ ok: true, path })
      }

      default:
        return jsonResponse({ error: 'Unknown action' }, 400)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: message }, 400)
  }
})
