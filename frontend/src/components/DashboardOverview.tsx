import React from 'react';
import { useGetDashboardMetrics } from '../hooks/useQueries';
import { Users, DollarSign, BookOpen, AlertCircle, TrendingUp, Award, RefreshCw, GraduationCap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatINR } from '../lib/utils';

interface DashboardOverviewProps {
  enabled?: boolean;
}

export default function DashboardOverview({ enabled = true }: DashboardOverviewProps) {
  const { data: metrics, isLoading, error, refetch } = useGetDashboardMetrics(enabled);

  const statCards = [
    {
      label: 'Total Students',
      value: metrics ? Number(metrics.totalStudents).toString() : '—',
      icon: Users,
      style: 'stat-card-navy',
      shadow: 'shadow-navy',
      iconBg: 'rgba(255,255,255,0.2)',
      trend: '+12% this month',
    },
    {
      label: 'Fees Collected',
      value: metrics ? formatINR(Number(metrics.totalFeesCollected)) : '—',
      icon: DollarSign,
      style: 'stat-card-emerald',
      shadow: 'shadow-emerald',
      iconBg: 'rgba(255,255,255,0.2)',
      trend: '+8% this month',
    },
    {
      label: 'Total Teachers',
      value: metrics ? Number(metrics.totalTeachers).toString() : '—',
      icon: BookOpen,
      style: 'stat-card-amber',
      shadow: 'shadow-amber',
      iconBg: 'rgba(0,0,0,0.1)',
      trend: 'Active staff',
    },
    {
      label: 'Outstanding Fees',
      value: metrics ? formatINR(Number(metrics.outstandingFees)) : '—',
      icon: AlertCircle,
      style: 'stat-card-crimson',
      shadow: 'shadow-premium',
      iconBg: 'rgba(255,255,255,0.2)',
      trend: 'Pending collection',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-premium-xl" style={{ minHeight: '180px' }}>
        <img
          src="/assets/generated/dashboard-hero-banner.dim_1200x300.png"
          alt="Dashboard Banner"
          className="w-full h-44 object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div
          className="absolute inset-0 flex flex-col justify-center px-8"
          style={{ background: 'linear-gradient(90deg, rgba(23,37,84,0.92) 0%, rgba(30,58,138,0.75) 60%, rgba(5,150,105,0.4) 100%)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-2xl sm:text-3xl leading-tight">
                Welcome to School Mitra
              </h2>
              <p className="text-blue-200 text-sm font-medium">Your complete school management dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground font-display font-bold text-xl">Overview</h3>
          {error && (
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 font-semibold">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Failed to load dashboard metrics. Please try again.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`${card.style} ${card.shadow} rounded-2xl p-5 relative overflow-hidden`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: card.iconBg }}>
                      {isLoading ? (
                        <div className="w-6 h-6 rounded bg-white/30" />
                      ) : (
                        <Icon className="w-6 h-6" style={{ color: 'currentColor' }} />
                      )}
                    </div>
                    <TrendingUp className="w-4 h-4 opacity-60" />
                  </div>

                  {isLoading ? (
                    <>
                      <div className="h-8 w-24 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.3)' }} />
                      <div className="h-4 w-20 rounded" style={{ background: 'rgba(255,255,255,0.2)' }} />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-display font-extrabold leading-tight mb-1">{card.value}</p>
                      <p className="text-sm font-semibold opacity-90">{card.label}</p>
                      <p className="text-xs opacity-70 mt-1">{card.trend}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b5fc0 100%)' }}>
              <Award className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-display font-bold text-foreground text-lg">School Performance</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground text-sm font-medium">Total Students</span>
              <span className="font-bold text-foreground">{isLoading ? '...' : Number(metrics?.totalStudents ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground text-sm font-medium">Teaching Staff</span>
              <span className="font-bold text-foreground">{isLoading ? '...' : Number(metrics?.totalTeachers ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground text-sm font-medium">Fees Collected</span>
              <span className="font-bold" style={{ color: '#059669' }}>{isLoading ? '...' : formatINR(Number(metrics?.totalFeesCollected ?? 0))}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground text-sm font-medium">Outstanding Fees</span>
              <span className="font-bold" style={{ color: '#dc2626' }}>{isLoading ? '...' : formatINR(Number(metrics?.outstandingFees ?? 0))}</span>
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-display font-bold text-foreground text-lg">Fee Collection Status</h4>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const total = Number(metrics?.totalFeesCollected ?? 0) + Number(metrics?.outstandingFees ?? 0);
                const paidPct = total > 0 ? Math.round((Number(metrics?.totalFeesCollected ?? 0) / total) * 100) : 0;
                const unpaidPct = 100 - paidPct;
                return (
                  <>
                    <div>
                      <div className="flex justify-between text-sm font-semibold mb-1">
                        <span className="text-foreground">Collected</span>
                        <span style={{ color: '#059669' }}>{paidPct}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${paidPct}%`, background: 'linear-gradient(90deg, #059669, #10b981)' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-semibold mb-1">
                        <span className="text-foreground">Outstanding</span>
                        <span style={{ color: '#dc2626' }}>{unpaidPct}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${unpaidPct}%`, background: 'linear-gradient(90deg, #dc2626, #ef4444)' }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground font-medium">Total Fee Pool: <span className="font-bold text-foreground">{formatINR(total)}</span></p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
