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
  questions: GeneratedQuestion[];
}

export const generateQuestions = async (
  params: QuestionGenerationParams
): Promise<GeneratedQuestion[]> => {
  try {
    console.log('Sending question generation request:', params);
    
    const response = await fetch(
      'https://aj48g50oqa.execute-api.eu-central-1.amazonaws.com/dev/qa-pairs',
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

    return result.questions || [];

  } catch (error) {
    console.error('Question generation error:', error);
    throw new Error('Netzwerkfehler bei der Fragenerstellung');
  }
};