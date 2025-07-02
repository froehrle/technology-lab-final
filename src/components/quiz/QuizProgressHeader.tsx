
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
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Heart 
              key={i} 
              className={`h-7 w-7 ${i < lives ? 'text-red-500 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <div className="text-xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
          Score: {score}
        </div>
      </div>
      
      {/* Enhanced Running Stickman Progress */}
      <div className="relative bg-gradient-to-r from-green-100 to-blue-100 rounded-xl h-20 overflow-hidden border-2 border-gray-200 shadow-lg">
        {/* Progress Track */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-yellow-200 to-orange-200 opacity-50"></div>
        
        {/* Progress Fill */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500 opacity-30 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 90)}%` }}
        ></div>
        
        {/* Finish Line - Much More Visible */}
        <div className="absolute right-3 top-0 h-full flex items-center">
          <div className="w-3 h-full bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-sm shadow-lg border border-red-800"></div>
          <div className="absolute -top-2 -right-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            ZIEL
          </div>
        </div>
        
        {/* Checkered Pattern at Finish */}
        <div className="absolute right-0 top-0 h-full w-8 opacity-40">
          <div className="grid grid-cols-4 grid-rows-8 h-full">
            {[...Array(32)].map((_, i) => (
              <div
                key={i}
                className={`${
                  (Math.floor(i / 4) + i) % 2 === 0 ? 'bg-black' : 'bg-white'
                }`}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Running Stickman with enhanced animation */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-700 ease-out z-10"
          style={{ left: `${Math.min(progress, 87)}%` }}
        >
          <div className="relative">
            {/* Enhanced Stickman */}
            <svg width="36" height="36" viewBox="0 0 36 36" className="animate-bounce">
              {/* Head */}
              <circle cx="18" cy="7" r="5" fill="#2563eb" stroke="#1e40af" strokeWidth="1" />
              {/* Body */}
              <line x1="18" y1="12" x2="18" y2="24" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
              {/* Arms - running motion */}
              <line x1="18" y1="16" x2="13" y2="20" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
              <line x1="18" y1="16" x2="23" y2="14" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
              {/* Legs - running motion */}
              <line x1="18" y1="24" x2="13" y2="30" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
              <line x1="18" y1="24" x2="23" y2="28" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
              {/* Feet */}
              <circle cx="13" cy="30" r="1.5" fill="#2563eb" />
              <circle cx="23" cy="28" r="1.5" fill="#2563eb" />
            </svg>
            
            {/* Enhanced Speed lines */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12">
              <div className="flex space-x-1">
                <div className="w-3 h-1 bg-blue-500 rounded animate-pulse"></div>
                <div className="w-2 h-1 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-1 bg-blue-300 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            
            {/* Progress percentage bubble */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        
        {/* Mile markers */}
        {[25, 50, 75].map((marker) => (
          <div
            key={marker}
            className="absolute top-0 h-full w-0.5 bg-gray-400 opacity-60"
            style={{ left: `${marker}%` }}
          >
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
              {marker}%
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600 font-medium">
          Frage {currentQuestionIndex + 1} von {totalQuestions}
        </p>
        <p className="text-sm text-blue-600 font-medium">
          {Math.round((currentQuestionIndex / totalQuestions) * 100)}% abgeschlossen
        </p>
      </div>
    </div>
  );
};

export default QuizProgressHeader;
