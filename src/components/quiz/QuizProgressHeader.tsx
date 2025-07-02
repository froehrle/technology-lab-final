
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
      
      {/* Enhanced Progress Bar with Better Visibility */}
      <div className="relative bg-gradient-to-r from-blue-50 to-green-50 rounded-xl h-24 overflow-hidden border-3 border-blue-200 shadow-lg">
        {/* Background Track */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100"></div>
        
        {/* Progress Fill */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-40 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 85)}%` }}
        ></div>
        
        {/* Ultra Visible Finish Line */}
        <div className="absolute right-4 top-0 h-full flex items-center z-20">
          {/* Main finish line */}
          <div className="w-4 h-full bg-gradient-to-b from-red-600 via-red-700 to-red-800 rounded-lg shadow-xl border-2 border-red-900"></div>
          
          {/* Finish flag */}
          <div className="absolute -top-3 -right-2 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
            🏁 ZIEL
          </div>
          
          {/* Checkered pattern overlay */}
          <div className="absolute inset-0 w-4 opacity-60">
            <div className="grid grid-cols-2 grid-rows-12 h-full">
              {[...Array(24)].map((_, i) => (
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
        
        {/* Running Stickman */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-700 ease-out z-10"
          style={{ left: `${Math.min(progress, 82)}%` }}
        >
          <div className="relative">
            {/* Enhanced Stickman */}
            <svg width="40" height="40" viewBox="0 0 40 40" className="animate-bounce">
              {/* Head */}
              <circle cx="20" cy="8" r="6" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
              {/* Body */}
              <line x1="20" y1="14" x2="20" y2="26" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />
              {/* Arms - running motion */}
              <line x1="20" y1="18" x2="14" y2="22" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              <line x1="20" y1="18" x2="26" y2="16" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              {/* Legs - running motion */}
              <line x1="20" y1="26" x2="14" y2="32" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              <line x1="20" y1="26" x2="26" y2="30" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              {/* Feet */}
              <circle cx="14" cy="32" r="2" fill="#1e40af" />
              <circle cx="26" cy="30" r="2" fill="#1e40af" />
            </svg>
            
            {/* Enhanced Speed lines */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16">
              <div className="flex space-x-1">
                <div className="w-4 h-1 bg-blue-600 rounded animate-pulse"></div>
                <div className="w-3 h-1 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-1 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            
            {/* Progress percentage bubble */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        
        {/* Quarter markers with better visibility */}
        {[25, 50, 75].map((marker) => (
          <div
            key={marker}
            className="absolute top-0 h-full w-1 bg-gray-500 opacity-80 z-5"
            style={{ left: `${marker}%` }}
          >
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 font-semibold bg-white px-2 py-1 rounded shadow">
              {marker}%
            </div>
          </div>
        ))}
        
        {/* Start line */}
        <div className="absolute left-2 top-0 h-full w-1 bg-green-600 opacity-80 z-5">
          <div className="absolute -top-3 -left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            START
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <p className="text-base text-gray-700 font-semibold bg-gray-50 px-3 py-2 rounded-lg">
          Frage {currentQuestionIndex + 1} von {totalQuestions}
        </p>
        <p className="text-base text-blue-700 font-semibold bg-blue-50 px-3 py-2 rounded-lg">
          {Math.round((currentQuestionIndex / totalQuestions) * 100)}% abgeschlossen
        </p>
      </div>
    </div>
  );
};

export default QuizProgressHeader;
