import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap, LogIn, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginScreen() {
  const { login, isLoggingIn, isLoginError } = useInternetIdentity();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoginError(null);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to connect. Please try again.';
      setLoginError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="glass-effect rounded-3xl shadow-premium-lg p-8 border border-gray-200/50 dark:border-gray-800/50">
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-premium animate-glow">
              <GraduationCap className="w-14 h-14 text-white" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              S.K Ideal Coaching Centre
            </h1>
            <p className="text-muted-foreground font-medium">Login to continue your journey</p>
          </div>

          {/* Error message display */}
          {(loginError || isLoginError) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    Login Failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {loginError || 'Unable to connect to authentication service. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 glass-effect p-1.5 border border-gray-200/50 dark:border-gray-800/50">
              <TabsTrigger 
                value="admin"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Admin
              </TabsTrigger>
              <TabsTrigger 
                value="teacher"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Teacher
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="space-y-6">
              <div className="glass-effect border-2 border-blue-300/50 dark:border-blue-700/50 rounded-xl p-5 shadow-lg">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-glow-blue"></div>
                  Admin Portal
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Manage students, teachers, fees, and attendance all in one place.
                </p>
              </div>

              <Button 
                onClick={handleLogin} 
                disabled={isLoggingIn}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-premium hover:shadow-premium-lg transition-all duration-300"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Login with Internet Identity
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="teacher" className="space-y-6">
              <div className="glass-effect border-2 border-indigo-300/50 dark:border-indigo-700/50 rounded-xl p-5 shadow-lg">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-glow-indigo"></div>
                  Teacher Portal
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Access student records, mark attendance, and manage fees.
                </p>
              </div>

              <Button 
                onClick={handleLogin} 
                disabled={isLoggingIn}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-premium hover:shadow-premium-lg transition-all duration-300"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Login with Internet Identity
                  </>
                )}
              </Button>

              <div className="glass-effect border-2 border-yellow-300/50 dark:border-yellow-700/50 rounded-xl p-4 shadow-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                  <strong>Note:</strong> Teachers must be assigned access by an administrator after logging in with Internet Identity.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t-2 border-gray-200/50 dark:border-gray-800/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">∞</div>
                <div className="text-xs text-muted-foreground mt-1 font-semibold">Students</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">∞</div>
                <div className="text-xs text-muted-foreground mt-1 font-semibold">Teachers</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">∞</div>
                <div className="text-xs text-muted-foreground mt-1 font-semibold">Records</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
