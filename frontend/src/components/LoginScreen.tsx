import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useVerifyTeacher } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, UserCircle, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const verifyTeacher = useVerifyTeacher();
  const [teacherCredentials, setTeacherCredentials] = useState({ uniqueId: '', password: '' });
  const [teacherError, setTeacherError] = useState('');

  const handleAdminLogin = async () => {
    console.log('[LoginScreen] Admin login initiated');
    try {
      await login();
      console.log('[LoginScreen] Admin login successful');
    } catch (error: any) {
      console.error('[LoginScreen] Admin login error:', error);
      if (error.message === 'User is already authenticated') {
        toast.error('Already logged in. Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginScreen] Teacher login initiated for:', teacherCredentials.uniqueId);
    setTeacherError('');

    if (!teacherCredentials.uniqueId.trim() || !teacherCredentials.password.trim()) {
      setTeacherError('Please enter both username and password');
      return;
    }

    try {
      await verifyTeacher.mutateAsync(teacherCredentials);
      console.log('[LoginScreen] Teacher login successful');
    } catch (error: any) {
      console.error('[LoginScreen] Teacher login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setTeacherError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isLoading = loginStatus === 'logging-in' || verifyTeacher.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-premium mb-4 animate-glow">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            School Mitra
          </h1>
          <p className="text-muted-foreground font-medium">
            Comprehensive School Management System
          </p>
        </div>

        <Card className="glass-effect border-2 border-gray-200/50 dark:border-gray-800/50 shadow-premium-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to access School Mitra dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="teacher" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Teacher
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Secure Admin Access
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sign in with your Google or Email account for secure authentication
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAdminLogin}
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-premium hover:shadow-premium-lg transition-all duration-300"
                  >
                    {loginStatus === 'logging-in' ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Sign in as Admin
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="teacher" className="space-y-4">
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  {teacherError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-800 dark:text-red-200">{teacherError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="uniqueId" className="text-sm font-semibold">
                      Teacher ID / Username
                    </Label>
                    <Input
                      id="uniqueId"
                      type="text"
                      placeholder="Enter your teacher ID"
                      value={teacherCredentials.uniqueId}
                      onChange={(e) => {
                        setTeacherCredentials({ ...teacherCredentials, uniqueId: e.target.value });
                        setTeacherError('');
                      }}
                      className="h-11 border-2 focus:border-indigo-400 dark:focus:border-indigo-600"
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={teacherCredentials.password}
                      onChange={(e) => {
                        setTeacherCredentials({ ...teacherCredentials, password: e.target.value });
                        setTeacherError('');
                      }}
                      className="h-11 border-2 focus:border-indigo-400 dark:focus:border-indigo-600"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-premium hover:shadow-premium-lg transition-all duration-300"
                  >
                    {verifyTeacher.isPending ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Sign in as Teacher
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Powered by School Mitra © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
