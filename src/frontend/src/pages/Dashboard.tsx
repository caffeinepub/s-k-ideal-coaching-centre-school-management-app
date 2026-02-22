import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LayoutDashboard, Users, UserCheck, DollarSign, Calendar, FileText } from 'lucide-react';
import DashboardOverview from '../components/DashboardOverview';
import StudentsSection from '../components/StudentsSection';
import TeachersSection from '../components/TeachersSection';
import FeesSection from '../components/FeesSection';
import AttendanceSection from '../components/AttendanceSection';
import ReportCardsSection from '../components/ReportCardsSection';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: userProfile } = useGetCallerUserProfile();

  const isAdmin = userProfile?.role === 'admin';
  const isTeacher = userProfile?.role === 'teacher';

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-effect border border-gray-200/50 dark:border-gray-800/50 p-1.5 h-auto flex-wrap justify-start gap-2">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="students" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Students
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger 
              value="teachers" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Teachers
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="fees" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Fees
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger 
              value="attendance" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Attendance
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="reportcards" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Report Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentsSection />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="teachers" className="space-y-6">
            <TeachersSection />
          </TabsContent>
        )}

        <TabsContent value="fees" className="space-y-6">
          <FeesSection />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="attendance" className="space-y-6">
            <AttendanceSection />
          </TabsContent>
        )}

        <TabsContent value="reportcards" className="space-y-6">
          <ReportCardsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
