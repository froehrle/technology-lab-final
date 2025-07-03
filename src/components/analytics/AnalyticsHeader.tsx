import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface AnalyticsHeaderProps {
  selectedCourseId: string;
  onCourseChange: (value: string) => void;
  courses: any[];
  attemptFilter: string;
  onAttemptFilterChange: (value: string) => void;
}

const AnalyticsHeader = ({ selectedCourseId, onCourseChange, courses, attemptFilter, onAttemptFilterChange }: AnalyticsHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Kurs Analytics</CardTitle>
          <CardDescription>Umfassende Statistiken zu Ihren Kursen</CardDescription>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCourseId} onValueChange={onCourseChange}>
              <SelectTrigger className="w-48 bg-background border-border">
                <SelectValue placeholder="Kurs auswählen" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border shadow-lg z-50">
                <SelectItem value="all">Alle Kurse</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Versuche:</span>
            <Select value={attemptFilter} onValueChange={onAttemptFilterChange}>
              <SelectTrigger className="w-32 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border shadow-lg z-50">
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="latest">Neueste</SelectItem>
                <SelectItem value="first">Erste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};

export default AnalyticsHeader;