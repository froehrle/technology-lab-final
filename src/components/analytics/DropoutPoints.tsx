import React from 'react';

interface DropoutPointsProps {
  dropoutPoints: any[];
}

const DropoutPoints = ({ dropoutPoints }: DropoutPointsProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Abbruchpunkte</h3>
      {dropoutPoints.length > 0 ? (
        <div className="space-y-2">
          {dropoutPoints.map((point: any, index: number) => (
            <div 
              key={`${point.courseTitle}-${point.questionIndex}`} 
              className="flex items-center justify-between p-3 border rounded-lg animate-fade-in hover-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div>
                <p className="font-medium">{point.courseTitle}</p>
                <p className="text-sm text-muted-foreground">
                  Frage {point.questionIndex + 1}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">{point.dropoutCount}</p>
                <p className="text-xs text-muted-foreground">Abbrüche</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Keine Abbruchpunkte gefunden.</p>
      )}
    </div>
  );
};

export default DropoutPoints;