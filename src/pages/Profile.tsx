import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/profile/ImageUpload';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, updating, updateProfile, uploadAvatar } = useProfile();
  const [displayName, setDisplayName] = useState('');

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ display_name: displayName });
  };

  const handleAvatarUpload = async (file: File) => {
    return await uploadAvatar(file);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const fallbackText = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profil bearbeiten</h1>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie Ihre Profilinformationen und Einstellungen
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profilbild</CardTitle>
            <CardDescription>
              Laden Sie ein Profilbild hoch, das in der App angezeigt wird
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImageUrl={profile?.avatar_url}
              onUpload={handleAvatarUpload}
              fallbackText={fallbackText}
              uploading={updating}
            />
          </CardContent>
        </Card>

        {/* Profile Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profilinformationen</CardTitle>
            <CardDescription>
              Aktualisieren Sie Ihre persönlichen Informationen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  E-Mail-Adresse kann nicht geändert werden
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Anzeigename</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ihr Anzeigename"
                />
                <p className="text-xs text-muted-foreground">
                  Dieser Name wird anderen Benutzern angezeigt
                </p>
              </div>

              <div className="space-y-2">
                <Label>Rolle</Label>
                <Input
                  value={user?.user_metadata?.role === 'teacher' ? 'Lehrer' : 'Student'}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Rolle kann nicht geändert werden
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDisplayName(profile?.display_name || '')}
                  disabled={updating}
                >
                  Zurücksetzen
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Speichern
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;