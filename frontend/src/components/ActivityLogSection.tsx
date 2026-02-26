import React, { useState } from 'react';
import { useGetAllActivityLogs } from '../hooks/useQueries';
import { Activity, Search, Filter, Shield, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ActivityLogSectionProps {
  enabled?: boolean;
}

export default function ActivityLogSection({ enabled = true }: ActivityLogSectionProps) {
  const { data: logs = [], isLoading } = useGetAllActivityLogs(enabled);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const roles: string[] = ['all', ...Array.from(new Set(logs.map((l) => l.performerRole)))];
  const actions: string[] = ['all', ...Array.from(new Set(logs.map((l) => l.action)))];

  const filtered = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.performerRole.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.performerRole === roleFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesRole && matchesAction;
  });

  const formatTimestamp = (ts: bigint) => {
    const n = Number(ts);
    if (n === 0) return 'N/A';
    return new Date(n).toLocaleString();
  };

  const getRoleBadgeStyle = (role: string): React.CSSProperties => {
    if (role === 'admin') return { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none' };
    if (role === 'teacher') return { background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', color: 'white', border: 'none' };
    return { background: '#e5e7eb', color: '#374151', border: 'none' };
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Header */}
      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Activity Log</h2>
              <p className="text-slate-300 text-sm font-medium">Audit trail of all system actions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/20">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">{logs.length} entries</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
          >
            {roles.map((r: string) => (
              <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>
            ))}
          </select>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
          >
            {actions.map((a: string) => (
              <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-2">
              {search || roleFilter !== 'all' || actionFilter !== 'all'
                ? 'No logs match your filters'
                : 'No activity logs yet'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {search || roleFilter !== 'all' || actionFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Activity will appear here as users interact with the system.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs uppercase tracking-wide">Timestamp</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 font-bold text-white text-xs uppercase tracking-wide hidden md:table-cell">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors bg-white">
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap font-medium">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className="text-xs font-bold"
                        style={getRoleBadgeStyle(log.performerRole)}
                      >
                        {log.performerRole === 'admin' ? (
                          <><Shield className="w-3 h-3 mr-1" />{log.performerRole}</>
                        ) : (
                          <><User className="w-3 h-3 mr-1" />{log.performerRole}</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">{log.action}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
