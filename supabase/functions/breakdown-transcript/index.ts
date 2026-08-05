import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LineSchema = z.object({
  line_order: z.number().int().positive(),
  text: z.string().min(1),
  output_type: z.enum(['motion_graphics', 'b_roll', 'static_image_animation', 'text_animation', 'split_screen', 'live_footage', 'other']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional()
});

const Schema = z.array(LineSchema).min(1);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify caller is admin/manager
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { project_id, transcript } = await req.json();

    if (!project_id || !transcript) {
      return new Response(JSON.stringify({ error: 'Missing project_id or transcript' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are breaking a video script/transcript into production segments for a video editing agency. Split the transcript into logical lines or beats — do not merge unrelated ideas, do not split a single sentence unnecessarily.

For each segment, output an object with exactly these fields:
- line_order: integer, starting at 1, sequential
- text: the exact original text for this segment, unmodified
- output_type: one of ["motion_graphics", "b_roll", "static_image_animation", "text_animation", "split_screen", "live_footage", "other"]
- confidence: float between 0 and 1, your confidence in the output_type choice
- reasoning: one short sentence explaining the choice

Return ONLY a JSON array of these objects. No prose, no markdown code fences, no explanation text before or after the array.`;

    const callGemini = async (prompt: string, text: string) => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { text: text }] }]
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    };

    let rawResponse = '';
    try {
      rawResponse = await callGemini(systemPrompt, transcript);
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: 'llm_unavailable' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const parseResponse = (text: string) => {
      // Strip markdown fences
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      return JSON.parse(cleaned.trim());
    };

    let parsedData;
    let isValid = false;

    try {
      parsedData = parseResponse(rawResponse);
      Schema.parse(parsedData);
      isValid = true;
    } catch (e) {
      // Validation failed, retry once
      try {
        const correctivePrompt = "Your previous response was invalid JSON. Return ONLY the JSON array, no other text.";
        rawResponse = await callGemini(systemPrompt + "\n\n" + correctivePrompt, transcript);
        parsedData = parseResponse(rawResponse);
        Schema.parse(parsedData);
        isValid = true;
      } catch (e2) {
        console.error('Failed on retry', e2);
        return new Response(JSON.stringify({ error: 'parse_failed' }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    if (isValid && parsedData) {
      // Prepare bulk insert data
      const insertData = parsedData.map((line: any) => ({
        project_id,
        line_order: line.line_order,
        text: line.text,
        output_type: line.output_type,
        status: 'needs_asset',
      }));

      const { data: insertedRows, error: insertError } = await supabase
        .from('transcript_lines')
        .insert(insertData)
        .select();

      if (insertError) {
        console.error('DB Insert Error', insertError);
        return new Response(JSON.stringify({ error: 'db_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      await supabase
        .from('projects')
        .update({ status: 'breakdown' })
        .eq('id', project_id);

      await supabase
        .from('activity_log')
        .insert({
          project_id,
          actor_id: user.id,
          action: 'transcript_breakdown',
          meta: { line_count: insertedRows.length }
        });

      return new Response(JSON.stringify({ lines: insertedRows }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error: any) {
    console.error('Function error', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
