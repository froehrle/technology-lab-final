
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Users, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await signUp(email, password, selectedRole, displayName || email);
        if (error) throw error;
        toast({
          title: "Erfolgreich!",
          description: "Überprüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Willkommen zurück!' : 'Bei CourseLingo anmelden'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Melden Sie sich an, um weiterzulernen' : 'Erstellen Sie Ihr Konto, um zu beginnen'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? 'login' : 'signup'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" onClick={() => setIsLogin(true)}>
                  Anmelden
                </TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>
                  Registrieren
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Passwort</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Anmeldung läuft...' : 'Anmelden'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Ich bin ein...</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Card 
                        className={`cursor-pointer border-2 transition-colors ${
                          selectedRole === 'student' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedRole('student')}
                      >
                        <CardContent className="p-4 text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <div className="font-medium text-sm">Schüler</div>
                          <div className="text-xs text-gray-500">Mit Kursen lernen</div>
                        </CardContent>
                      </Card>
                      <Card 
                        className={`cursor-pointer border-2 transition-colors ${
                          selectedRole === 'teacher' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedRole('teacher')}
                      >
                        <CardContent className="p-4 text-center">
                          <GraduationCap className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <div className="font-medium text-sm">Lehrer</div>
                          <div className="text-xs text-gray-500">Kurse erstellen</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Anzeigename (Optional)</Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Wie sollen wir Sie nennen?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Passwort</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Konto wird erstellt...' : `Als ${selectedRole === 'teacher' ? 'Lehrer' : 'Schüler'} registrieren`}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
