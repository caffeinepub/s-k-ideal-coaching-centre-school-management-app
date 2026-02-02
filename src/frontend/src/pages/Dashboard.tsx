import { useState, Component, ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import DashboardOverview from '../components/DashboardOverview';
import StudentsSection from '../components/StudentsSection';
import TeachersSection from '../components/TeachersSection';
import FeesSection from '../components/FeesSection';
import AttendanceSection from '../components/AttendanceSection';
import ReportCardsSection from '../components/ReportCardsSection';
import { LayoutDashboard, Users, UserCheck, DollarSign, Calendar, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';

// Error Boundary for Dashboard
class DashboardErrorBoundary extends Component<
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
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="max-w-md w-full glass-effect rounded-2xl shadow-premium-lg p-8 text-center border border-gray-200 dark:border-gray-800">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Dashboard Error
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error?.message || 'An error occurred while loading the dashboard'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid glass-effect shadow-premium border border-gray-200/50 dark:border-gray-800/50 p-1.5">
          <TabsTrigger 
            value="overview" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="students" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger 
            value="teachers" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Teachers</span>
          </TabsTrigger>
          <TabsTrigger 
            value="fees" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Fees</span>
          </TabsTrigger>
          <TabsTrigger 
            value="attendance" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
          <TabsTrigger 
            value="reportcards" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <StudentsSection />
        </TabsContent>

        <TabsContent value="teachers" className="mt-6">
          <TeachersSection />
        </TabsContent>

        <TabsContent value="fees" className="mt-6">
          <FeesSection />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceSection />
        </TabsContent>

        <TabsContent value="reportcards" className="mt-6">
          <ReportCardsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}
