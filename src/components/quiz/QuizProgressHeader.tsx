
import React from 'react';
import { Zap } from 'lucide-react';

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
      
      {/* Colorful Progress Bar Container */}
      <div className="relative bg-gradient-to-r from-primary/10 to-achievement/10 rounded-xl h-24 overflow-hidden border-2 border-primary/20 shadow-lg mb-4">
        {/* Gradient background for entire container */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-achievement/5"></div>
        
        {/* Colorful progress indication */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-300 to-gray-400 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 82)}%` }}
        ></div>
        
        {/* Colorful Finish Line */}
        <div className="absolute right-2 top-2 bottom-2 flex items-center z-20">
          {/* Main finish line with achievement colors */}
          <div className="w-3 h-full bg-gradient-to-b from-achievement via-success to-warning rounded-lg shadow-xl border-2 border-achievement"></div>
          
          {/* Checkered pattern overlay */}
          <div className="absolute inset-0 w-3 opacity-60">
            <div className="grid grid-cols-2 grid-rows-10 h-full">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`${
                    (Math.floor(i / 2) + i) % 2 === 0 ? 'bg-black' : 'bg-white'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Running Stickman - now starts at 0% */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-700 ease-out z-10"
          style={{ left: `${Math.min(progress * 0.82, 70)}%` }}
        >
          <div className="relative">
            {/* Enhanced Stickman */}
            <svg width="35" height="35" viewBox="0 0 35 35" className="animate-bounce">
              {/* Head */}
              <circle cx="17.5" cy="7" r="5" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
              {/* Body */}
              <line x1="17.5" y1="12" x2="17.5" y2="23" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" />
              {/* Arms - running motion */}
              <line x1="17.5" y1="16" x2="12" y2="19" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
              <line x1="17.5" y1="16" x2="23" y2="14" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
              {/* Legs - running motion */}
              <line x1="17.5" y1="23" x2="12" y2="28" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
              <line x1="17.5" y1="23" x2="23" y2="26" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
              {/* Feet */}
              <circle cx="12" cy="28" r="1.5" fill="#1e40af" />
              <circle cx="23" cy="26" r="1.5" fill="#1e40af" />
            </svg>
            
            {/* Enhanced Speed lines */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12">
              <div className="flex space-x-1">
                <div className="w-3 h-0.5 bg-blue-600 rounded animate-pulse"></div>
                <div className="w-2 h-0.5 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-0.5 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Colorful Start line */}
        <div className="absolute left-2 top-2 bottom-2 w-1 bg-success opacity-90 z-5 rounded shadow-lg"></div>
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
