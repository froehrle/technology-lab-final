export interface QuestionGenerationParams {
  schwierigkeitsgrad: 'leicht' | 'mittel' | 'schwer';
  anzahl_fragen: number;
  thema: string;
  fragetyp: 'Verständnisfragen' | 'Rechenfragen';
  zielgruppe: string;
  keywords: string;
}

export interface GeneratedQuestion {
  question_text: string;
  question_type: string;
  options?: string[];
  correct_answer: string;
}

export interface QuestionGenerationResponse {
  questions: {
    questions: GeneratedQuestion[];
  };
}

export const generateQuestions = async (
  params: QuestionGenerationParams
): Promise<GeneratedQuestion[]> => {
  try {
    console.log('Sending question generation request:', params);
    
    const response = await fetch(
      'https://o662virii4xhey5nodl4n5umi40uuddp.lambda-url.eu-central-1.on.aws/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );

    console.log('Question generation API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Question generation API error:', errorText);
      throw new Error(`Fragenerstellung fehlgeschlagen: ${response.status}`);
    }

    const result: QuestionGenerationResponse = await response.json();
    console.log('Question generation API response:', result);

    // Extract the nested questions array and map field names
    const questions = result.questions?.questions || [];
    
    // Map API response fields to our interface
    const mappedQuestions = questions.map(q => ({
      ...q,
      options: (q as any).multiple_choice_options || q.options
    }));

    return mappedQuestions;

  } catch (error) {
    console.error('Question generation error:', error);
    throw new Error('Netzwerkfehler bei der Fragenerstellung');
  }
};