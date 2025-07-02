
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, FileText, Brain, Play, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "Upload Your Content",
      description: "Teachers upload PDFs of study materials - textbooks, notes, handouts, anything!",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Brain,
      title: "AI Generates Questions",
      description: "Our AI creates multiple choice, fill-in-blank, and true/false questions automatically",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Play,
      title: "Students Learn & Play",
      description: "Students progress through lessons, earning XP and maintaining streaks",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Teachers see what's working with detailed analytics and insights",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            How CourseLingo Works
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Transform any subject into engaging, bite-sized lessons in just four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <div className={`bg-gradient-to-r ${step.color} p-4 rounded-2xl w-fit mx-auto mb-6`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-500 mb-2">STEP {index + 1}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow connector (hidden on mobile, visible on larger screens) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-white/70" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
