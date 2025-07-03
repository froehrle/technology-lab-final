import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CourseAnalytics from '@/components/CourseAnalytics';

const Analytics = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Detaillierte Einblicke in Ihre Kurse und Schülerleistungen</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <CourseAnalytics />
      </div>
    </div>
  );
};

export default Analytics;