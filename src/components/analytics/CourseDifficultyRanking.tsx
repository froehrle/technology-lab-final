import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CourseDifficultyRankingProps {
  courseDifficultyRanking: any[];
}

const CourseDifficultyRanking = ({ courseDifficultyRanking }: CourseDifficultyRankingProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Kurs-Schwierigkeitsranking</h3>
      {courseDifficultyRanking.length > 0 ? (
        <div className="space-y-2">
          {courseDifficultyRanking.map((course: any, index: number) => (
            <div key={course.courseId} className="flex items-center justify-between p-3 border rounded-lg animate-fade-in">
              <div className="flex items-center space-x-3">
                <Badge variant={index === 0 ? "destructive" : index === courseDifficultyRanking.length - 1 ? "default" : "secondary"}>
                  #{index + 1}
                </Badge>
                <span className="font-medium">{course.title}</span>
              </div>
              <div className="text-right">
                <p className="font-bold">{course.completionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {course.completions}/{course.totalEnrollments} abgeschlossen
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Noch keine Daten verfügbar.</p>
      )}
    </div>
  );
};

export default CourseDifficultyRanking;