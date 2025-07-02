
import React from 'react';
import { Heart } from 'lucide-react';

interface QuizProgressHeaderProps {
  lives: number;
  score: number;
  progress: number;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const QuizProgressHeader = ({ 
  lives, 
  score, 
  progress, 
  currentQuestionIndex, 
  totalQuestions 
}: QuizProgressHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Heart 
              key={i} 
              className={`h-6 w-6 ${i < lives ? 'text-red-500 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <div className="text-lg font-semibold text-blue-600">
          Score: {score}
        </div>
      </div>
      
      {/* Running Stickman Progress */}
      <div className="relative bg-gray-200 rounded-full h-16 overflow-hidden">
        {/* Track */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-20"></div>
        
        {/* Finish Line */}
        <div className="absolute right-2 top-0 h-full w-1 bg-red-500 flex items-center">
          <div className="text-xs font-bold text-red-600 -rotate-90 whitespace-nowrap origin-center">
            ZIEL
          </div>
        </div>
        
        {/* Running Stickman */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ left: `${Math.min(progress, 90)}%` }}
        >
          <div className="relative">
            {/* Stickman Body */}
            <svg width="32" height="32" viewBox="0 0 32 32" className="animate-bounce">
              {/* Head */}
              <circle cx="16" cy="6" r="4" fill="#333" />
              {/* Body */}
              <line x1="16" y1="10" x2="16" y2="20" stroke="#333" strokeWidth="2" />
              {/* Arms - animated running */}
              <line x1="16" y1="14" x2="12" y2="18" stroke="#333" strokeWidth="2" className="animate-pulse" />
              <line x1="16" y1="14" x2="20" y2="12" stroke="#333" strokeWidth="2" className="animate-pulse" />
              {/* Legs - animated running */}
              <line x1="16" y1="20" x2="12" y2="26" stroke="#333" strokeWidth="2" className="animate-pulse" />
              <line x1="16" y1="20" x2="20" y2="24" stroke="#333" strokeWidth="2" className="animate-pulse" />
            </svg>
            
            {/* Speed lines */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8">
              <div className="flex space-x-1">
                <div className="w-2 h-0.5 bg-blue-400 animate-pulse"></div>
                <div className="w-1 h-0.5 bg-blue-300 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-0.5 bg-blue-200 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Frage {currentQuestionIndex + 1} von {totalQuestions}
      </p>
    </div>
  );
};

export default QuizProgressHeader;
