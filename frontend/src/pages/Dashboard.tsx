import React, { useRef, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardOverview from '../components/DashboardOverview';
import StudentsSection from '../components/StudentsSection';
import TeachersSection from '../components/TeachersSection';
import FeesSection from '../components/FeesSection';
import AttendanceSection from '../components/AttendanceSection';
import ReportCardsSection from '../components/ReportCardsSection';
import ActivityLogSection from '../components/ActivityLogSection';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  ClipboardCheck,
  FileText,
  Activity,
} from 'lucide-react';

type TabId = 'overview' | 'students' | 'teachers' | 'fees' | 'attendance' | 'reports' | 'activity';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'teachers', label: 'Teachers', icon: BookOpen, adminOnly: true },
  { id: 'fees', label: 'Fees', icon: DollarSign, adminOnly: true },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity, adminOnly: true },
];

interface DashboardProps {
  actorLoading?: boolean;
}

export default function Dashboard({ actorLoading }: DashboardProps) {
  const { identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const visitedTabs = useRef<Set<TabId>>(new Set(['overview']));

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const isAdmin = userProfile?.role === 'admin';

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  const handleTabChange = (tabId: TabId) => {
    visitedTabs.current.add(tabId);
    setActiveTab(tabId);
  };

  const isEnabled = (tabId: TabId) => visitedTabs.current.has(tabId);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'oklch(0.97 0.008 240)' }}>
      <Header userProfile={userProfile} actorLoading={actorLoading} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-premium border border-border p-2">
            <nav className="flex flex-wrap gap-1" role="tablist">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-white shadow-navy'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' } : {}}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'overview' && (
            <DashboardOverview enabled={isEnabled('overview')} />
          )}
          {activeTab === 'students' && (
            <StudentsSection enabled={isEnabled('students')} />
          )}
          {activeTab === 'teachers' && isAdmin && (
            <TeachersSection enabled={isEnabled('teachers')} />
          )}
          {activeTab === 'fees' && isAdmin && (
            <FeesSection enabled={isEnabled('fees')} />
          )}
          {activeTab === 'attendance' && (
            <AttendanceSection enabled={isEnabled('attendance')} />
          )}
          {activeTab === 'reports' && (
            <ReportCardsSection enabled={isEnabled('reports')} />
          )}
          {activeTab === 'activity' && isAdmin && (
            <ActivityLogSection enabled={isEnabled('activity')} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
