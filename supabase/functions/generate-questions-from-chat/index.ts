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

interface QuestionGenerationParams {
  schwierigkeitsgrad: 'leicht' | 'mittel' | 'schwer';
  anzahl_fragen: number;
  thema: string;
  fragetyp: 'Verständnisfragen' | 'Rechenfragen';
  zielgruppe: string;
  keywords: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationHistory, courseId, teacherId } = await req.json();
    
    console.log('Generate questions from chat request:', { courseId, teacherId });

    // Define smart defaults
    const defaults: QuestionGenerationParams = {
      schwierigkeitsgrad: 'mittel',
      anzahl_fragen: 5,
      thema: 'Allgemeine Fragen',
      fragetyp: 'Verständnisfragen',
      zielgruppe: 'Studenten',
      keywords: ''
    };

    // Extract parameters from conversation using OpenAI
    const extractionPrompt = `Analysiere das folgende Gespräch zwischen einem Lehrer und einem KI-Assistenten über die Erstellung von Fragen. 

Verwende diese Standardwerte als Basis:
- schwierigkeitsgrad: "mittel"
- anzahl_fragen: 5
- thema: "Allgemeine Fragen"
- fragetyp: "Verständnisfragen"
- zielgruppe: "Studenten"
- keywords: ""

Überschreibe NUR die Parameter, die der Lehrer explizit erwähnt hat. Behalte die Standardwerte für alle anderen bei.

Gespräch:
${conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

Antworte mit einem JSON-Objekt im folgenden Format:
{
  "schwierigkeitsgrad": "leicht" | "mittel" | "schwer",
  "anzahl_fragen": number (1-20),
  "thema": "string",
  "fragetyp": "Verständnisfragen" | "Rechenfragen",
  "zielgruppe": "string",
  "keywords": "string"
}

Antworte nur mit dem JSON-Objekt, ohne zusätzlichen Text.`;

    console.log('Sending extraction request to OpenAI...');
    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: extractionPrompt }],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!extractionResponse.ok) {
      console.error('OpenAI extraction failed:', extractionResponse.status, await extractionResponse.text());
      throw new Error(`OpenAI extraction failed: ${extractionResponse.status}`);
    }

    const extractionData = await extractionResponse.json();
    let extractedParams: QuestionGenerationParams;
    
    try {
      const extractedContent = extractionData.choices[0].message.content;
      console.log('OpenAI extraction response:', extractedContent);
      
      extractedParams = JSON.parse(extractedContent);
      // Merge with defaults to ensure all required fields are present
      extractedParams = { ...defaults, ...extractedParams };
      
      // Validate extracted parameters
      if (!['leicht', 'mittel', 'schwer'].includes(extractedParams.schwierigkeitsgrad)) {
        console.warn('Invalid schwierigkeitsgrad, using default:', extractedParams.schwierigkeitsgrad);
        extractedParams.schwierigkeitsgrad = defaults.schwierigkeitsgrad;
      }
      
      if (!['Verständnisfragen', 'Rechenfragen'].includes(extractedParams.fragetyp)) {
        console.warn('Invalid fragetyp, using default:', extractedParams.fragetyp);
        extractedParams.fragetyp = defaults.fragetyp;
      }
      
      if (extractedParams.anzahl_fragen < 1 || extractedParams.anzahl_fragen > 20) {
        console.warn('Invalid anzahl_fragen, using default:', extractedParams.anzahl_fragen);
        extractedParams.anzahl_fragen = defaults.anzahl_fragen;
      }
      
    } catch (parseError) {
      console.error('Failed to parse extracted parameters, using defaults:', parseError);
      console.error('Raw OpenAI response:', extractionData);
      extractedParams = defaults;
    }
    
    console.log('Final parameters for Lambda:', extractedParams);

    // Call the existing lambda function with enhanced error handling
    console.log('Calling Lambda function...');
    const lambdaResponse = await fetch(
      'https://aj48g50oqa.execute-api.eu-central-1.amazonaws.com/dev/qa-pairs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedParams),
      }
    );

    console.log('Lambda response status:', lambdaResponse.status);
    console.log('Lambda response headers:', Object.fromEntries(lambdaResponse.headers.entries()));

    if (!lambdaResponse.ok) {
      const errorBody = await lambdaResponse.text();
      console.error('Lambda function error details:');
      console.error('Status:', lambdaResponse.status);
      console.error('Status Text:', lambdaResponse.statusText);
      console.error('Response Body:', errorBody);
      console.error('Request Parameters:', JSON.stringify(extractedParams, null, 2));
      
      throw new Error(`Lambda function error: ${lambdaResponse.status} - ${errorBody}`);
    }

    const lambdaResult = await lambdaResponse.json();
    const questions = lambdaResult.questions?.questions || [];
    
    console.log('Lambda response received:', { questionCount: questions.length });

    // Save questions to pending_questions table
    const pendingQuestions = questions.map((q: any) => ({
      course_id: courseId,
      teacher_id: teacherId,
      question_text: q.question_text,
      question_type: q.question_type || 'multiple_choice',
      question_style: extractedParams.fragetyp,
      options: q.options || q.multiple_choice_options,
      correct_answer: q.correct_answer,
      chat_context: conversationHistory,
      status: 'pending'
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('pending_questions')
      .insert(pendingQuestions)
      .select();

    if (insertError) {
      console.error('Error inserting pending questions:', insertError);
      throw new Error('Failed to save questions');
    }

    console.log('Questions saved to pending_questions table:', insertedQuestions?.length);

    return new Response(JSON.stringify({ 
      success: true,
      questionsGenerated: questions.length,
      extractedParams,
      pendingQuestions: insertedQuestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-questions-from-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});