import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CourseDifficultyRankingProps {
  courseDifficultyRanking: any[];
}

const CourseDifficultyRanking = ({ courseDifficultyRanking }: CourseDifficultyRankingProps) => {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const getDifficultyBadge = (score: number) => {
    if (score >= 60) return { variant: "destructive" as const, label: "Sehr schwer" };
    if (score >= 40) return { variant: "secondary" as const, label: "Schwer" };
    if (score >= 20) return { variant: "outline" as const, label: "Mittel" };
    return { variant: "default" as const, label: "Einfach" };
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Kurs-Schwierigkeitsranking (Multi-Faktor)</h3>
      {courseDifficultyRanking.length > 0 ? (
        <div className="space-y-3">
          {courseDifficultyRanking.map((course: any, index: number) => {
            const difficultyBadge = getDifficultyBadge(course.difficultyScore);
            const isExpanded = expandedCourse === course.courseId;
            
            return (
              <Card key={course.courseId} className="animate-fade-in">
                <Collapsible
                  open={isExpanded}
                  onOpenChange={(open) => setExpandedCourse(open ? course.courseId : null)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={index === 0 ? "destructive" : index === courseDifficultyRanking.length - 1 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <div>
                            <CardTitle className="text-base">{course.title}</CardTitle>
                            <CardDescription>
                              {course.totalEnrollments} Einschreibungen • {course.completions} Abschlüsse
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Badge variant={difficultyBadge.variant}>
                                {difficultyBadge.label}
                              </Badge>
                              <span className="font-bold text-lg">{course.difficultyScore}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Schwierigkeits-Score
                            </p>
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">Abschlussrate</p>
                            <p className="text-lg">{course.completionRate}%</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Perfekte Abschlüsse</p>
                            <p className="text-lg">{course.perfectCompletionRate}%</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Ø Versuche/Frage</p>
                            <p className="text-lg">{course.avgAttemptsPerQuestion}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Falsche Antworten</p>
                            <p className="text-lg">{course.wrongAnswerRate}%</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Abbruchrate</p>
                            <p className="text-lg">{course.dropoutRate}%</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Schwierigkeitsfaktoren (Beitrag zum Score):</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Abschlussrate (25%)</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={(course.factors.completion / course.difficultyScore) * 100} className="w-16" />
                                <span className="w-8 text-right">{course.factors.completion}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Perfekte Abschlüsse (20%)</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={(course.factors.perfectCompletion / course.difficultyScore) * 100} className="w-16" />
                                <span className="w-8 text-right">{course.factors.perfectCompletion}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Versuche pro Frage (25%)</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={(course.factors.attempts / course.difficultyScore) * 100} className="w-16" />
                                <span className="w-8 text-right">{course.factors.attempts}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Falsche Antworten (20%)</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={(course.factors.wrongAnswers / course.difficultyScore) * 100} className="w-16" />
                                <span className="w-8 text-right">{course.factors.wrongAnswers}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Abbrüche (10%)</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={(course.factors.dropouts / course.difficultyScore) * 100} className="w-16" />
                                <span className="w-8 text-right">{course.factors.dropouts}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">Noch keine Daten verfügbar.</p>
      )}
    </div>
  );
};

export default CourseDifficultyRanking;