import { useState, useMemo } from 'react';
import { useGetAllActivityAuditLogs } from '../hooks/useQueries';
import { Card, CardContent, CardHeader } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { Activity, Filter, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import type { ActivityAuditLogEntry } from '../backend';

export default function ActivityLogSection() {
  const { data: activityLogs = [], isLoading, error, refetch } = useGetAllActivityAuditLogs();
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  // Extract unique roles and actions for filters
  const uniqueRoles = useMemo(() => {
    const roles = new Set(activityLogs.map(log => log.performerRole));
    return Array.from(roles).sort();
  }, [activityLogs]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(activityLogs.map(log => log.action));
    return Array.from(actions).sort();
  }, [activityLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchesRole = filterRole === 'all' || log.performerRole === filterRole;
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      return matchesRole && matchesAction;
    });
  }, [activityLogs, filterRole, filterAction]);

  // Sort by timestamp descending (most recent first)
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [filteredLogs]);

  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) {
      return new Date().toLocaleString();
    }
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0';
      case 'teacher':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-0';
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.toLowerCase().includes('add') || action.toLowerCase().includes('create')) {
      return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0';
    } else if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('remove')) {
      return 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-0';
    } else if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) {
      return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0';
    }
    return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-0';
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
              Activity Log
            </h2>
            <p className="text-muted-foreground font-medium">Track all system actions and changes</p>
          </div>
        </div>
        <Card className="solid-modal-content border-2 border-red-200 dark:border-red-800 shadow-premium">
          <CardContent className="p-12 text-center">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/30 dark:to-orange-950/30 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load activity logs</p>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            <Button 
              onClick={() => refetch()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-premium hover:shadow-premium-lg transition-all duration-300 font-semibold"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
            Activity Log
          </h2>
          <p className="text-muted-foreground font-medium">Track all system actions and changes</p>
        </div>
      </div>

      {/* Activity Log Table */}
      <Card className="solid-modal-content border-2 border-gray-200 dark:border-gray-800 shadow-premium">
        <CardHeader className="border-b-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Filters:</span>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[200px] border-2 bg-white dark:bg-gray-950 h-11 font-medium shadow-sm">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="solid-modal-content border-2">
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-[200px] border-2 bg-white dark:bg-gray-950 h-11 font-medium shadow-sm">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent className="solid-modal-content border-2">
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium animate-float">
                <Activity className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No activity logs found</p>
              <p className="text-muted-foreground">
                {filterRole !== 'all' || filterAction !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Activity logs will appear here as actions are performed'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border-2 border-gray-200 dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-2 border-gray-200 dark:border-gray-800 hover:bg-gradient-to-r">
                    <TableHead className="font-bold text-gray-900 dark:text-white text-base">Timestamp</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white text-base">Role</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white text-base">Action</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white text-base">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLogs.map((log, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-purple-50/70 dark:hover:bg-purple-950/20 transition-all duration-200 border-b border-gray-200 dark:border-gray-800"
                    >
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(log.performerRole)} shadow-md font-semibold px-3 py-1`}>
                          {log.performerRole.charAt(0).toUpperCase() + log.performerRole.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionBadgeColor(log.action)} shadow-md font-semibold px-3 py-1`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-white max-w-md">
                        {log.details || 'No additional details'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
