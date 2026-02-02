import { useState } from 'react';
import { useGetAllStudents, useMarkAttendance, useGetAllAttendance, useGetMonthlyAttendanceSummaryAllStudents } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export default function AttendanceSection() {
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useGetAllAttendance();
  const { data: monthlySummaries = [], isLoading: summariesLoading } = useGetMonthlyAttendanceSummaryAllStudents(BigInt(2026));
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const markAttendance = useMarkAttendance();

  const isLoading = studentsLoading || attendanceLoading;

  const filteredStudents = selectedClass === 'all' 
    ? students 
    : students.filter(s => s.classId.toString() === selectedClass);

  const uniqueClasses = Array.from(new Set(students.map(s => s.classId.toString()))).sort();

  const getTodayAttendance = (studentId: bigint) => {
    const today = new Date().setHours(0, 0, 0, 0);
    return attendanceRecords.find(
      record => record.studentId === studentId && 
                new Date(Number(record.date) / 1000000).setHours(0, 0, 0, 0) === today
    );
  };

  const handleMarkAttendance = async (studentId: bigint, present: boolean) => {
    try {
      const dateTimestamp = BigInt(new Date().getTime() * 1000000);
      await markAttendance.mutateAsync({
        studentId,
        date: dateTimestamp,
        present,
      });
      toast.success(`Attendance marked as ${present ? 'present' : 'absent'}`);
    } catch (error) {
      toast.error('Failed to mark attendance');
      console.error(error);
    }
  };

  const getAttendanceStats = (studentId: bigint) => {
    const records = attendanceRecords.filter(r => r.studentId === studentId);
    const present = records.filter(r => r.present).length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, total, percentage };
  };

  // Filter monthly summaries
  const filteredMonthlySummaries = monthlySummaries.filter((summary) => {
    const matchesStudent = selectedStudent === 'all' || summary.studentId.toString() === selectedStudent;
    const matchesMonth = selectedMonth === 'all' || summary.month.toString() === selectedMonth;
    return matchesStudent && matchesMonth;
  });

  // Group summaries by student
  const summariesByStudent = filteredMonthlySummaries.reduce((acc, summary) => {
    const studentId = summary.studentId.toString();
    if (!acc[studentId]) {
      acc[studentId] = [];
    }
    acc[studentId].push(summary);
    return acc;
  }, {} as Record<string, typeof monthlySummaries>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance Management</h2>
        <p className="text-muted-foreground">Mark and track student attendance</p>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 glass-effect border-2">
          <TabsTrigger value="daily" className="font-semibold">Daily Attendance</TabsTrigger>
          <TabsTrigger value="monthly" className="font-semibold">Monthly Summary (2026)</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Attendance - {new Date().toLocaleDateString()}
                </CardTitle>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full sm:w-[180px] border-2">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {uniqueClasses.map((classId) => (
                      <SelectItem key={classId} value={classId}>
                        Class {classId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-muted-foreground font-medium">No students found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="font-bold">Student Name</TableHead>
                        <TableHead className="font-bold">Class</TableHead>
                        <TableHead className="font-bold">Attendance Stats</TableHead>
                        <TableHead className="font-bold">Today's Status</TableHead>
                        <TableHead className="text-right font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const todayRecord = getTodayAttendance(student.id);
                        const stats = getAttendanceStats(student.id);
                        
                        return (
                          <TableRow key={student.id.toString()} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                            <TableCell className="font-semibold">{student.name}</TableCell>
                            <TableCell>
                              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
                                Class {student.classId.toString()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground font-medium">
                                  {stats.present}/{stats.total} days
                                </span>
                                <Badge variant={stats.percentage >= 75 ? 'default' : 'destructive'} className="shadow-md">
                                  {stats.percentage}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {todayRecord ? (
                                <Badge variant={todayRecord.present ? 'default' : 'destructive'} className="gap-1 shadow-md">
                                  {todayRecord.present ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Present
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      Absent
                                    </>
                                  )}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Marked</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {!todayRecord && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(student.id, true)}
                                    disabled={markAttendance.isPending}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Present
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(student.id, false)}
                                    disabled={markAttendance.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Absent
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Attendance Summary - 2026
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-full sm:w-[180px] border-2">
                      <SelectValue placeholder="Filter by student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id.toString()} value={student.id.toString()}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full sm:w-[180px] border-2">
                      <SelectValue placeholder="Filter by month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {summariesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredMonthlySummaries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-muted-foreground font-medium">No attendance data available for 2026</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(summariesByStudent).map(([studentId, summaries]) => {
                    const student = students.find(s => s.id.toString() === studentId);
                    if (!student) return null;

                    // Sort summaries by month
                    const sortedSummaries = [...summaries].sort((a, b) => Number(a.month) - Number(b.month));

                    return (
                      <div key={studentId} className="border-2 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{student.name}</h3>
                            <p className="text-sm text-muted-foreground font-medium">Class {student.classId.toString()}</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b-2">
                                <TableHead className="font-bold">Month</TableHead>
                                <TableHead className="font-bold">Total Days</TableHead>
                                <TableHead className="font-bold">Days Present</TableHead>
                                <TableHead className="font-bold">Days Absent</TableHead>
                                <TableHead className="font-bold">Attendance %</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortedSummaries.map((summary) => {
                                const monthName = MONTHS.find(m => m.value === Number(summary.month))?.label || 'Unknown';
                                const percentage = Number(summary.totalDays) > 0 
                                  ? Math.round((Number(summary.daysPresent) / Number(summary.totalDays)) * 100)
                                  : 0;

                                return (
                                  <TableRow key={summary.month.toString()} className="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                                    <TableCell className="font-semibold">{monthName}</TableCell>
                                    <TableCell className="font-medium">{summary.totalDays.toString()}</TableCell>
                                    <TableCell>
                                      <span className="text-green-600 dark:text-green-400 font-bold">
                                        {summary.daysPresent.toString()}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-red-600 dark:text-red-400 font-bold">
                                        {summary.daysAbsent.toString()}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={percentage >= 75 ? 'default' : 'destructive'} className="shadow-md">
                                        {percentage}%
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
