
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Users, Star } from 'lucide-react';

const StudentCourses = () => {
  const availableCourses = [
    {
      id: 1,
      title: 'Spanish Basics',
      description: 'Learn fundamental Spanish vocabulary and grammar',
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      difficulty: 'Beginner',
      rating: 4.8,
      students: 1234,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Math Fundamentals',
      description: 'Master basic mathematical concepts and operations',
      progress: 80,
      totalLessons: 18,
      completedLessons: 14,
      difficulty: 'Beginner',
      rating: 4.9,
      students: 2156,
      color: 'green'
    },
    {
      id: 3,
      title: 'Science Explorer',
      description: 'Discover the wonders of science through interactive lessons',
      progress: 45,
      totalLessons: 30,
      completedLessons: 13,
      difficulty: 'Intermediate',
      rating: 4.7,
      students: 987,
      color: 'purple'
    },
    {
      id: 4,
      title: 'History Adventures',
      description: 'Journey through time and explore historical events',
      progress: 0,
      totalLessons: 22,
      completedLessons: 0,
      difficulty: 'Beginner',
      rating: 4.6,
      students: 543,
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">Continue your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(course.color)}`}>
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{course.rating}</span>
                </div>
              </div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.progress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {course.difficulty}
                  </span>
                  <Button size="sm" className="ml-auto">
                    {course.progress > 0 ? 'Continue' : 'Start Course'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;
