import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRedirectPath, UserRole } from '@/utils/roleValidation';

interface NoPermissionProps {
  userRole: UserRole | null;
  attemptedPath: string;
  allowedRoles: UserRole[];
}

const NoPermission: React.FC<NoPermissionProps> = ({ userRole, attemptedPath, allowedRoles }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    const redirectPath = getRedirectPath(userRole);
    navigate(redirectPath);
  };

  const getRoleDisplayName = (role: UserRole) => {
    return role === 'teacher' ? 'Lehrer' : 'Schüler';
  };

  const getAreaDisplayName = (path: string) => {
    if (path.includes('teacher')) return 'Lehrer-Bereich';
    if (path.includes('dashboard') && !path.includes('teacher')) return 'Schüler-Dashboard';
    if (path.includes('courses')) return 'Kurse';
    if (path.includes('quiz')) return 'Quiz';
    if (path.includes('leaderboard')) return 'Rangliste';
    if (path.includes('avatar-store')) return 'Shop';
    if (path.includes('farm')) return 'Farm';
    return 'diesen Bereich';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-warning/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Kein Zugriff
          </CardTitle>
          <CardDescription className="text-center">
            Sie haben keine Berechtigung für diesen Bereich
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Als <span className="font-medium text-foreground">
                {userRole ? getRoleDisplayName(userRole) : 'Unbekannter Benutzer'}
              </span> können Sie nicht auf {getAreaDisplayName(attemptedPath)} zugreifen.
            </p>
            
            {allowedRoles.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Dieser Bereich ist nur für: {allowedRoles.map(getRoleDisplayName).join(', ')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Zur Startseite
            </Button>
            
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </div>

          {user && (
            <div className="pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Angemeldet als: {user.user_metadata?.display_name || user.email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoPermission;