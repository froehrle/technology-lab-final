
export interface ValidationRequest {
  question_id: string;
  student_answer: string;
}

export interface ValidationResponse {
  is_correct: boolean;
  feedback_text: string;
}

export const validateAnswerExternal = async (
  questionId: string,
  studentAnswer: string
): Promise<ValidationResponse> => {
  console.log('Starting external validation for:', { questionId, studentAnswer });
  
  try {
    const requestBody = {
      question_id: questionId,
      student_answer: studentAnswer,
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
