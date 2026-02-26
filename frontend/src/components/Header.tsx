import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, User, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userProfile?: { name: string; role: string } | null;
  actorLoading?: boolean;
}

export default function Header({ userProfile, actorLoading }: HeaderProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await clear();
      queryClient.clear();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="w-full bg-navy-DEFAULT shadow-navy" style={{ background: 'linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #1d4ed8 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
              <img
                src="/assets/generated/school-logo-icon.dim_256x256.png"
                alt="School Mitra"
                className="w-8 h-8 object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
                }}
              />
            </div>
            <div>
              <h1 className="text-white font-display font-bold text-xl leading-tight tracking-tight">
                School Mitra
              </h1>
              <p className="text-blue-200 text-xs font-medium">School Management System</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {actorLoading && (
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Connecting...</span>
              </div>
            )}

            {identity && userProfile && (
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/20">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-sm font-semibold leading-tight">{userProfile.name}</p>
                  <p className="text-blue-200 text-xs capitalize">{userProfile.role}</p>
                </div>
              </div>
            )}

            {identity && (
              <Button
                onClick={handleLogout}
                disabled={loggingOut}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/20 hover:text-white bg-transparent font-semibold"
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
