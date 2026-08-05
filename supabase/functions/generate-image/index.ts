import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAGE_GEN_DAILY_LIMIT = 20;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { transcript_line_id, prompt } = await req.json();

    if (!transcript_line_id || !prompt) {
      return new Response(JSON.stringify({ error: 'Missing transcript_line_id or prompt' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify caller has access to this line (manager, or assigned editor)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const { data: line } = await supabase
      .from('transcript_lines')
      .select('assigned_editor_id, project_id')
      .eq('id', transcript_line_id)
      .single();

    if (!line) {
      return new Response(JSON.stringify({ error: 'Line not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (profile?.role !== 'admin' && profile?.role !== 'manager' && line.assigned_editor_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check rate limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .eq('asset_type', 'ai_generated')
      .gte('created_at', today.toISOString());

    if ((count || 0) >= IMAGE_GEN_DAILY_LIMIT) {
      return new Response(JSON.stringify({ limit: IMAGE_GEN_DAILY_LIMIT, message: 'Daily image generation limit reached.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call Gemini Imagen API
    let base64Image = '';
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1 }
        }),
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Imagen API error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      base64Image = data.predictions?.[0]?.bytesBase64Encoded;
      
      if (!base64Image) {
        throw new Error('No image returned from API');
      }
    } catch (e: any) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'image_gen_failed', message: e.message }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Upload to Supabase Storage
    const imageBytes = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    const uuid = crypto.randomUUID();
    const storagePath = `project-assets/${line.project_id}/${transcript_line_id}/${uuid}.png`;

    const { error: uploadError } = await supabase
      .storage
      .from('assets')
      .upload(storagePath, imageBytes, { contentType: 'image/png' });

    if (uploadError) {
      console.error('Upload Error', uploadError);
      return new Response(JSON.stringify({ error: 'upload_failed', message: uploadError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Insert assets row
    const { data: assetRow, error: insertError } = await supabase
      .from('assets')
      .insert({
        transcript_line_id,
        storage_path: storagePath,
        asset_type: 'ai_generated',
        generation_prompt: prompt,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('DB Insert Error', insertError);
      return new Response(JSON.stringify({ error: 'db_error', message: insertError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('assets')
      .createSignedUrl(storagePath, 3600);

    return new Response(JSON.stringify({ asset: assetRow, signed_url: signedUrlData?.signedUrl }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    
  } catch (error: any) {
    console.error('Function error', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
