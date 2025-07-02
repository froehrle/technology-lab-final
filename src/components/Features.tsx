
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Zap, BarChart3, MessageSquare, Target, Award } from 'lucide-react';

const Features = () => {
  const teacherFeatures = [
    {
      icon: Upload,
      title: "PDF Upload & Auto-Generation",
      description: "Upload any PDF and get AI-generated questions instantly. No manual work required."
    },
    {
      icon: MessageSquare,
      title: "Question Wizard Chatbot",
      description: "Refine questions through conversation. Ask for more difficulty, hints, or regenerate specific items."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "View anonymized stats: completion rates, difficult questions, and student progress insights."
    }
  ];

  const studentFeatures = [
    {
      icon: Target,
      title: "Adaptive Learning Path",
      description: "Unlock lessons progressively. Personalized difficulty based on your performance."
    },
    {
      icon: Award,
      title: "Streaks & XP System",
      description: "Earn points, maintain daily streaks, and track mastery across all topics."
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get immediate explanations for every answer. Learn from mistakes in real-time."
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Transform Learning</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're teaching or learning, CourseLingo provides the tools for engaging, effective education.
          </p>
        </div>

        {/* Teacher Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              👩‍🏫 For Teachers
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Create Courses in Minutes</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teacherFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Student Features */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              🎓 For Students
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Learn Like Never Before</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {studentFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
