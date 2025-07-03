
export interface ValidationRequest {
  question_text: string;
  correct_answer: string;
  student_answer: string;
  question_style: string;
}

export interface ValidationResponse {
  is_correct: boolean;
  feedback_text: string;
}

export const validateAnswerExternal = async (
  question: { question_text: string; correct_answer: string; question_style: string },
  studentAnswer: string
): Promise<ValidationResponse> => {
  console.log('Starting external validation for:', { question, studentAnswer });
  
  try {
    const requestBody = {
      question_text: question.question_text,
      correct_answer: question.correct_answer,
      student_answer: studentAnswer,
      question_style: question.question_style,
    };
    
    console.log('Sending request to external API:', requestBody);
    
    const response = await fetch(
      'https://89f4pjd9jb.execute-api.eu-central-1.amazonaws.com/dev/validate-answer',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);

    if (!response.ok) {
      console.error('API request failed with status:', response.status);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`API validation failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API Response data:', result);
    return result;
  } catch (error) {
    console.error('External validation error:', error);
    throw error;
  }
};
