
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Upload, Bot } from 'lucide-react';
import PdfUploadDialog from './PdfUploadDialog';
import ChatbotQuestionDialog from './chatbot/ChatbotQuestionDialog';

interface Course {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CourseHeaderProps {
  course: Course;
  onCreateQuestion: () => void;
  onGenerateQuestions: () => void;
  onMaterialsRefresh?: () => void;
  onQuestionsRefresh?: () => void;
}

const CourseHeader = ({ course, onCreateQuestion, onGenerateQuestions, onMaterialsRefresh, onQuestionsRefresh }: CourseHeaderProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showChatbotDialog, setShowChatbotDialog] = useState(false);

  return (
    <>
      <div className="mb-6">
        <Link to="/teacher-dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Dashboard
          </Button>
        </Link>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            {course.description && (
              <p className="text-gray-600 mt-2">{course.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              PDF-Dateien hochladen
            </Button>
            <Button variant="outline" onClick={() => setShowChatbotDialog(true)}>
              <Bot className="h-4 w-4 mr-2" />
              KI-Chat
            </Button>
            <Button variant="outline" onClick={onGenerateQuestions}>
              <Bot className="h-4 w-4 mr-2" />
              Fragen generieren
            </Button>
            <Button onClick={onCreateQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Frage hinzufügen
            </Button>
          </div>
        </div>
      </div>

      <PdfUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        courseId={course.id}
        onUploadSuccess={onMaterialsRefresh}
      />

      <ChatbotQuestionDialog
        open={showChatbotDialog}
        onOpenChange={setShowChatbotDialog}
        courseId={course.id}
        onQuestionsGenerated={() => {
          onQuestionsRefresh?.();
        }}
      />

    </>
  );
};

export default CourseHeader;
