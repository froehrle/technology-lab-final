
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

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
}

const CourseHeader = ({ course, onCreateQuestion }: CourseHeaderProps) => {
  return (
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
        <Button onClick={onCreateQuestion}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Frage hinzufügen
        </Button>
      </div>
    </div>
  );
};

export default CourseHeader;
