import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface StudentAnalyticsProps {
  studentAnalytics: {
    topStudents: any[];
    bottomStudents: any[];
    averages: any;
  };
}

const StudentAnalytics = ({ studentAnalytics }: StudentAnalyticsProps) => {
  const { topStudents, bottomStudents, averages } = studentAnalytics;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Studenten Analytics</h3>
        <Badge variant="outline">{averages.totalStudents || 0} Studenten</Badge>
      </div>
      
      {/* Averages Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-3 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Ø Fortschritt</p>
          <p className="text-xl font-bold text-blue-600">{averages.avgProgress || 0}%</p>
        </div>
        <div className="p-3 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Ø Abschlussrate</p>
          <p className="text-xl font-bold text-green-600">{averages.avgCompletionRate || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h4 className="font-medium">Top 3 Performer</h4>
          </div>
          
          {topStudents.length > 0 ? (
            <div className="space-y-2">
              {topStudents.map((student: any, index: number) => (
                <div 
                  key={student.anonymizedName} 
                  className="p-3 border rounded-lg animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{student.anonymizedName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{student.avgProgress}%</p>
                      <p className="text-xs text-muted-foreground">{student.totalXP} XP</p>
                    </div>
                  </div>
                  <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                    <span>Abschlüsse: {student.coursesCompleted}/{student.coursesEnrolled}</span>
                    <span>Rate: {student.completionRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Noch keine Daten verfügbar.</p>
          )}
        </div>

        {/* Bottom Performers */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <h4 className="font-medium">Bottom 3 (Unterstützung benötigt)</h4>
          </div>
          
          {bottomStudents.length > 0 ? (
            <div className="space-y-2">
              {bottomStudents.map((student: any, index: number) => (
                <div 
                  key={student.anonymizedName} 
                  className="p-3 border rounded-lg animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {student.anonymizedName}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">{student.avgProgress}%</p>
                      <p className="text-xs text-muted-foreground">{student.totalXP} XP</p>
                    </div>
                  </div>
                  <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                    <span>Abschlüsse: {student.coursesCompleted}/{student.coursesEnrolled}</span>
                    <span>Rate: {student.completionRate}%</span>
                  </div>
                  {student.strugglingCourses.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Schwierigkeiten in:</p>
                      <div className="flex flex-wrap gap-1">
                        {student.strugglingCourses.map((course: string, courseIndex: number) => (
                          <Badge key={courseIndex} variant="outline" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Noch keine Daten verfügbar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;