
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
  const response = await fetch(
    'https://89f4pjd9jb.execute-api.eu-central-1.amazonaws.com/dev/validate-answer',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question_id: questionId,
        student_answer: studentAnswer,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`API validation failed: ${response.status}`);
  }

  return await response.json();
};
