import React, { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import OfflineIndicator from './components/OfflineIndicator';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';

export default function App() {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Actor initialization timeout/retry state
  const [actorTimedOut, setActorTimedOut] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actorReadyRef = useRef(false);

  useEffect(() => {
    if (actor) {
      actorReadyRef.current = true;
      setActorTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    if (isAuthenticated && actorFetching && !actorReadyRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (!actorReadyRef.current) {
          setActorTimedOut(true);
        }
      }, 10000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [actor, isAuthenticated, actorFetching, retryKey]);

  const handleRetry = () => {
    setActorTimedOut(false);
    actorReadyRef.current = false;
    setRetryKey(k => k + 1);
    queryClient.clear();
    window.location.reload();
  };

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Show full-screen loading only during initial identity check
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <img
              src="/assets/generated/school-mitra-icon.dim_192x192.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → show login
  if (!isAuthenticated && !isLoggingIn) {
    return (
      <>
        <LoginScreen />
        <OfflineIndicator />
        <PWAInstallPrompt />
      </>
    );
  }

  // Authenticated but actor timed out
  if (isAuthenticated && actorTimedOut) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header userProfile={userProfile ?? null} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm space-y-4">
            <WifiOff className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Connection taking too long</h2>
            <p className="text-sm text-muted-foreground">
              The backend is taking longer than expected to respond. Please check your connection and try again.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const actorLoading = isAuthenticated && actorFetching && !actor;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OfflineIndicator />
      <PWAInstallPrompt />

      {/* ProfileSetupModal handles its own save logic internally */}
      {showProfileSetup && <ProfileSetupModal open={true} />}

      <main className="flex-1">
        {actorLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Connecting to backend…</p>
            </div>
          </div>
        ) : (
          <Dashboard actorLoading={actorLoading} />
        )}
      </main>
    </div>
  );
}
