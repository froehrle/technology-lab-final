import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, courseId } = await req.json();
    
    console.log('Chatbot conversation request:', { message, courseId, historyLength: conversationHistory?.length });

    // Get course context for better responses
    const { data: course } = await supabase
      .from('courses')
      .select('title, description')
      .eq('id', courseId)
      .single();

    // Build system prompt with course context
    const systemPrompt = `Du bist ein KI-Assistent, der Lehrern dabei hilft, Fragen für ihre Kurse zu erstellen. 

Kurskontext:
- Kurstitel: ${course?.title || 'Unbekannt'}
- Kursbeschreibung: ${course?.description || 'Keine Beschreibung verfügbar'}

Deine Aufgabe ist es, mit dem Lehrer über die Fragenerstellung zu sprechen und folgende Parameter zu sammeln:
- Schwierigkeitsgrad (leicht, mittel, schwer)
- Anzahl der Fragen (1-20)
- Thema/Themen
- Fragetyp (Verständnisfragen, Rechenfragen)
- Zielgruppe
- Schlüsselwörter

Sei freundlich, professionell und stelle gezielte Fragen, um die Anforderungen zu verstehen. Gib hilfreiche Vorschläge basierend auf pädagogischen Best Practices.

Wenn du genügend Informationen gesammelt hast, fasse die Parameter zusammen und frage nach Bestätigung für die Fragenerstellung.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    console.log('OpenAI response received successfully');

    return new Response(JSON.stringify({ 
      message: assistantResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-conversation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});