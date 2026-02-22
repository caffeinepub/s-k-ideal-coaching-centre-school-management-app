import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { GraduationCap, LogOut, Sparkles } from 'lucide-react';

export default function Header() {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="glass-effect border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow-blue animate-glow">
              <GraduationCap className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                School Mitra
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {userProfile && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile.name}</p>
                <p className="text-xs capitalize bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-medium">
                  {userProfile.role}
                </p>
              </div>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="border-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/20 dark:hover:to-pink-950/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
