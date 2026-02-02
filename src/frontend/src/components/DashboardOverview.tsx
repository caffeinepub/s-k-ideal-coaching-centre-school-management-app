import { useGetDashboardMetrics, useGetAllStudents, useGetAllTeachers } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, UserCheck, DollarSign, AlertCircle, TrendingUp, TrendingDown, Sparkles, LayoutDashboard } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { formatINR } from '../lib/utils';
import { Button } from './ui/button';

export default function DashboardOverview() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useGetDashboardMetrics();
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useGetAllStudents();
  const { data: teachers = [], isLoading: teachersLoading, error: teachersError } = useGetAllTeachers();

  const isLoading = metricsLoading || studentsLoading || teachersLoading;
  const hasError = metricsError || studentsError || teachersError;

  // Log errors for debugging
  if (metricsError) console.error('Dashboard metrics error:', metricsError);
  if (studentsError) console.error('Students data error:', studentsError);
  if (teachersError) console.error('Teachers data error:', teachersError);

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full glass-effect rounded-2xl shadow-premium-lg p-8 text-center border border-gray-200 dark:border-gray-800">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Failed to Load Dashboard Data
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {metricsError instanceof Error
              ? metricsError.message
              : studentsError instanceof Error
              ? studentsError.message
              : teachersError instanceof Error
              ? teachersError.message
              : 'Unable to load dashboard information'}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            Reload Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-3" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-effect border-gray-200/50 dark:border-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Students',
      value: metrics?.totalStudents.toString() || '0',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
      description: 'Enrolled students',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Teachers',
      value: metrics?.totalTeachers.toString() || '0',
      icon: UserCheck,
      gradient: 'from-indigo-500 to-purple-600',
      bgGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30',
      description: 'Active teachers',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Fees Collected',
      value: formatINR(metrics?.totalFeesCollected || BigInt(0)),
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
      description: 'Total revenue',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Outstanding Fees',
      value: formatINR(metrics?.outstandingFees || BigInt(0)),
      icon: TrendingDown,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30',
      description: 'Pending payments',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="hero-banner overflow-hidden rounded-2xl shadow-premium-lg">
        <div 
          className="relative h-48 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/school-building.dim_800x400.jpg)' }}
        >
          <div className="hero-content absolute inset-0 flex items-center justify-center text-center p-6">
            <div className="animate-float">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                <h2 className="text-4xl font-bold text-white drop-shadow-lg">Dashboard Overview</h2>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/90 text-lg font-medium drop-shadow-md">
                Welcome back! Here's what's happening with your school.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className={`glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium card-hover overflow-hidden relative`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} rounded-full blur-3xl opacity-50 -mr-16 -mt-16`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                  <Icon className={`h-5 w-5 text-white`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground font-medium">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {metrics && Number(metrics.outstandingFees) > 0 && (
        <Card className="glass-effect border-orange-300/50 dark:border-orange-700/50 shadow-premium overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-900/30 dark:to-red-900/30 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              Outstanding Fees Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
              There are outstanding fees totaling <span className="font-bold">{formatINR(metrics.outstandingFees)}</span>. Please follow up with parents for payment collection.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50">
                <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mt-2 shadow-glow-blue"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">System Ready</p>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50">
                <div className="w-2 h-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{students.length} Students Enrolled</p>
                  <p className="text-xs text-muted-foreground">Active student records</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{teachers.length} Teachers Active</p>
                  <p className="text-xs text-muted-foreground">Teaching staff available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium mb-3">
                Use the tabs above to:
              </p>
              <ul className="text-sm space-y-3">
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                  <div className="w-1.5 h-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-glow-blue"></div>
                  <span className="font-medium">Add and manage student records</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors">
                  <div className="w-1.5 h-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-glow-indigo"></div>
                  <span className="font-medium">Manage teacher assignments</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                  <div className="w-1.5 h-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
                  <span className="font-medium">Track fee payments</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
                  <div className="w-1.5 h-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-glow-purple"></div>
                  <span className="font-medium">Mark daily attendance</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

