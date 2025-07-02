
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Star, Trophy, CheckCircle } from 'lucide-react';

const Demo = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Experience the 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> CourseLingo Magic</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how students learn with our gamified, bite-sized lessons
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Demo Interface */}
            <div className="order-2 lg:order-1">
              <Card className="border-0 shadow-2xl bg-white overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Biology 101</h3>
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-300" />
                      <span className="font-bold">7</span>
                    </div>
                  </div>
                  <Progress value={65} className="bg-white/20" />
                  <div className="text-sm mt-2 opacity-90">Lesson 3 of 12 • Cell Structure</div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-6">
                    <Badge variant="secondary" className="mb-4">Question 2 of 5</Badge>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Which organelle is responsible for cellular respiration?
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Nucleus",
                      "Mitochondria",
                      "Ribosome",
                      "Golgi Apparatus"
                    ].map((answer, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                          selectedAnswer === index
                            ? index === 1
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                        disabled={showResult}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{answer}</span>
                          {showResult && selectedAnswer === index && (
                            <CheckCircle className={`h-5 w-5 ${index === 1 ? 'text-green-500' : 'text-red-500'}`} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">+10 XP</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Correct! Mitochondria are the powerhouses of the cell, responsible for cellular respiration and ATP production.
                      </p>
                    </div>
                  )}

                  <Button 
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={!showResult}
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Stats Panel */}
            <div className="order-1 lg:order-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Learning</h3>
                <p className="text-gray-600 mb-6">
                  Students get instant feedback, earn XP, and build streaks while mastering your content.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl w-fit mx-auto mb-3">
                      <Flame className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">7</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl w-fit mx-auto mb-3">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">1,250</div>
                    <div className="text-sm text-gray-600">Total XP</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Course Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cell Structure</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Photosynthesis</span>
                        <span>40%</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>DNA & RNA</span>
                        <span>20%</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
