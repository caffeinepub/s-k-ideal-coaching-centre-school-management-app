import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useActor } from './hooks/useActor';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { Loader2, AlertCircle, Wifi } from 'lucide-react';
import { Button } from './components/ui/button';
import { useEffect } from 'react';

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, error: profileError } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isActorReady = !!actor && !actorFetching;
  const showProfileSetup = isAuthenticated && isActorReady && profileFetched && userProfile === null;

  // Comprehensive logging for debugging
  useEffect(() => {
    console.log('=== School Mitra App State ===');
    console.log('Authentication:', {
      isAuthenticated,
      identityPrincipal: identity?.getPrincipal().toString(),
      isInitializing,
    });
    console.log('Actor:', {
      isActorReady,
      actorExists: !!actor,
      actorFetching,
    });
    console.log('Profile:', {
      userProfile,
      profileLoading,
      profileFetched,
      profileError: profileError ? String(profileError) : null,
    });
    console.log('==============================');
  }, [isAuthenticated, identity, isInitializing, isActorReady, actor, actorFetching, userProfile, profileLoading, profileFetched, profileError]);

  // Show loading screen while initializing
  if (isInitializing) {
    console.log('[App] Showing initialization screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Initializing School Mitra...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    console.log('[App] Showing login screen - user not authenticated');
    return <LoginScreen />;
  }

  // Show loading while actor is initializing
  if (!isActorReady) {
    console.log('[App] Showing actor connection screen - actor not ready');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Wifi className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Connecting to School Mitra backend...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Show profile error with retry
  if (profileError) {
    console.error('[App] Profile loading error:', profileError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-effect rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-premium-lg text-center">
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-950/30 dark:to-orange-950/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Profile Load Error</h2>
          <p className="text-muted-foreground font-medium mb-6">
            Unable to load your School Mitra profile. Please try again.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg h-12 text-base font-semibold"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while profile is being fetched
  if (profileLoading) {
    console.log('[App] Loading user profile...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show profile setup modal if profile doesn't exist
  if (showProfileSetup) {
    console.log('[App] Showing profile setup - no profile found');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
        <ProfileSetupModal open={true} />
      </div>
    );
  }

  // Show dashboard if everything is ready
  console.log('[App] Rendering dashboard - all checks passed');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <OfflineIndicator />
      <Header />
      <main className="min-h-[calc(100vh-180px)]">
        <Dashboard />
      </main>
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
