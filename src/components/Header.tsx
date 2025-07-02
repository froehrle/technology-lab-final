import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, GraduationCap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import CustomAvatar from '@/components/avatar/CustomAvatar';
import CoinBalance from '@/components/store/CoinBalance';
import DuolingoHomeIcon from '@/components/icons/DuolingoHomeIcon';
import DuolingoLearnIcon from '@/components/icons/DuolingoLearnIcon';
import DuolingoLeaderboardIcon from '@/components/icons/DuolingoLeaderboardIcon';
import DuolingoShopIcon from '@/components/icons/DuolingoShopIcon';
import DuolingoProfileIcon from '@/components/icons/DuolingoProfileIcon';
const Header = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile
  } = useProfile();
  const location = useLocation();
  const handleSignOut = async () => {
    await signOut();
  };

  // Don't show header on auth page
  if (location.pathname === '/auth') {
    return null;
  }
  const isTeacher = user?.user_metadata?.role === 'teacher';
  const isStudent = user?.user_metadata?.role === 'student';
  return <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? isTeacher ? "/teacher-dashboard" : "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DuoQuanto</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? <>
                {/* Navigation for authenticated users */}
                <nav className="hidden md:flex items-center space-x-4">
                  {isTeacher && <Link to="/teacher-dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                      <GraduationCap className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>}
                  {isStudent && <>
                      <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                        <DuolingoHomeIcon size={20} />
                        <span>Startseite</span>
                      </Link>
                      <Link to="/courses" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                        <DuolingoLearnIcon size={20} />
                        <span>Kurse</span>
                      </Link>
                      <Link to="/leaderboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                        <DuolingoLeaderboardIcon size={20} />
                        <span>Rangliste</span>
                      </Link>
                      <Link to="/avatar-store" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                        <DuolingoShopIcon size={20} />
                        <span>Shop</span>
                      </Link>
                      <Link to="/profile" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                        <DuolingoProfileIcon size={20} />
                        <span>Profil</span>
                      </Link>
                    </>}
                </nav>

                {/* Coin Balance for students */}
                {isStudent && <CoinBalance className="hidden md:flex" />}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <CustomAvatar src={profile?.avatar_url} fallback={user?.email?.charAt(0).toUpperCase() || 'U'} className="h-8 w-8" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex flex-col items-start">
                      <div className="font-medium">{user.user_metadata?.display_name || user.email}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <DuolingoProfileIcon size={16} className="mr-2" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Abmelden
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </> : <Link to="/auth">
                <Button>Anmelden</Button>
              </Link>}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;