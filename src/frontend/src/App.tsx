import { useEffect, Component, ReactNode } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { usePWAInstall } from './hooks/usePWAInstall';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Dashboard from './pages/Dashboard';
import { Toaster } from './components/ui/sonner';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './components/ui/button';

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-950 p-3 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full"
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError, refetch: refetchProfile } = useGetCallerUserProfile();
  const { showInstallPrompt, installPWA, dismissPrompt } = usePWAInstall();

  const isAuthenticated = !!identity;
  const isActorReady = !!actor && !actorFetching;
  const showProfileSetup = isAuthenticated && isActorReady && !profileLoading && isFetched && userProfile === null;

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Log authentication and actor status
  useEffect(() => {
    console.log('Auth status:', { isAuthenticated, isActorReady, actorFetching, profileLoading });
  }, [isAuthenticated, isActorReady, actorFetching, profileLoading]);

  // Log profile errors
  useEffect(() => {
    if (profileError) {
      console.error('Profile loading error:', profileError);
    }
  }, [profileError]);

  // Show initializing screen
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        {showInstallPrompt && (
          <PWAInstallPrompt onInstall={installPWA} onDismiss={dismissPrompt} />
        )}
      </>
    );
  }

  // Show connecting screen while actor is being initialized
  if (actorFetching || !isActorReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Wifi className="w-16 h-16 text-blue-600 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Connecting to backend...
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we establish a secure connection
          </p>
        </div>
      </div>
    );
  }

  // Handle profile loading error with retry option
  if (profileError) {
    const errorMessage = profileError instanceof Error 
      ? profileError.message 
      : 'Unable to load user profile. Please check your connection.';

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-premium p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 dark:bg-red-950 p-3 rounded-full">
                  <WifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Connection Error
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => refetchProfile()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Reload Application
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Loading your profile...
              </p>
              <p className="text-sm text-muted-foreground">
                This should only take a moment
              </p>
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  // Main application view
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Dashboard />
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
      {showInstallPrompt && (
        <PWAInstallPrompt onInstall={installPWA} onDismiss={dismissPrompt} />
      )}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
