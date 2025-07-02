
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const StudentCourses = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meine Kurse</h1>
        <p className="text-gray-600 mt-2">Setzen Sie Ihre Lernreise fort</p>
      </div>

      <div className="text-center py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Noch keine Kurse verfügbar</CardTitle>
            <CardDescription>
              Es sind noch keine Kurse verfügbar. Schauen Sie später wieder vorbei oder kontaktieren Sie Ihren Lehrer.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default StudentCourses;
