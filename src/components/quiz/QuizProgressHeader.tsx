
import React from 'react';
import { Zap, FlagTriangleRight } from 'lucide-react';
import RaceCarIcon from '../icons/race_car.svg';

interface QuizProgressHeaderProps {
  focusPoints: number;
  progress: number;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const QuizProgressHeader = ({ 
  focusPoints, 
  progress, 
  currentQuestionIndex, 
  totalQuestions 
}: QuizProgressHeaderProps) => {
  // Calculate focus bar color based on points using design system
  const getFocusBarColor = () => {
    if (focusPoints >= 70) return 'bg-success';
    if (focusPoints >= 40) return 'bg-warning';
    return 'bg-error';
  };

  const getFocusBarBgColor = () => {
    if (focusPoints >= 70) return 'bg-success/20';
    if (focusPoints >= 40) return 'bg-warning/20';
    return 'bg-error/20';
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        {/* Fokus-Balken */}
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-xp animate-pulse" />
          <div className="flex flex-col">
            <div className={`w-32 h-3 ${getFocusBarBgColor()} rounded-full overflow-hidden border border-white/30 shadow-inner`}>
              <div 
                className={`h-full ${getFocusBarColor()} transition-all duration-300 rounded-full`}
                style={{ width: `${Math.max(0, focusPoints)}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium mt-1 text-foreground/80">{focusPoints}/100 Fokus</span>
          </div>
          {focusPoints <= 10 && (
            <div className="text-xs text-error font-bold bg-error/10 px-2 py-1 rounded-full animate-pulse">
              ⚠️ Pause empfohlen
            </div>
          )}
        </div>
      </div>
      
      {/* Racing Street Progress Bar Container */}
      <div className="relative bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-xl h-24 overflow-hidden border-2 border-gray-600 shadow-lg mb-4">
        {/* Street texture background - covers entire bar */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-700/50"></div>
        
        {/* Road lane divider - dashed white line in the middle - covers full width */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2 z-5">
          <div className="flex w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex-1 h-full bg-white opacity-70 mr-2 last:mr-0"></div>
            ))}
          </div>
        </div>
        
        {/* Road shoulders */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400 opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 opacity-60"></div>
        
        {/* Racing Finish Line - full width like start */}
        <div className="absolute right-2 top-2 bottom-2 flex items-center z-20">
          <div className="w-2 h-full bg-gradient-to-b from-red-400 to-red-600 rounded shadow-lg"></div>
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-xs font-bold text-red-600 rotate-90 whitespace-nowrap">
            FINISH
          </div>
        </div>
        
        {/* Racing Car */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-700 ease-out z-10"
          style={{ left: `${Math.min(progress * 0.82, 70)}%` }}
        >
          <div className="relative">
            {/* Racing Car */}
            <img src={RaceCarIcon} alt="Race Car" className="h-12 w-12 animate-bounce" />
            
            {/* Speed lines/exhaust */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8">
              <div className="flex space-x-1">
                <div className="w-3 h-0.5 bg-gray-400 rounded animate-pulse"></div>
                <div className="w-2 h-0.5 bg-gray-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-0.5 bg-gray-600 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Racing Start Line */}
        <div className="absolute left-2 top-2 bottom-2 flex items-center z-20">
          <div className="w-2 h-full bg-gradient-to-b from-green-400 to-green-600 rounded shadow-lg"></div>
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-xs font-bold text-green-600 rotate-90 whitespace-nowrap">
            START
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <p className="text-base font-bold bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full shadow-md">
          Frage {currentQuestionIndex + 1} von {totalQuestions}
        </p>
        <p className="text-base font-bold bg-gradient-to-r from-achievement/20 to-achievement/10 text-achievement px-4 py-2 rounded-full shadow-md">
          {Math.round((currentQuestionIndex / totalQuestions) * 100)}% abgeschlossen
        </p>
      </div>
    </div>
  );
};

export default QuizProgressHeader;
