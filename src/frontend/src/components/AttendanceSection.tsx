import { useState } from 'react';
import { useGetAllStudents, useMarkAttendance, useGetAllAttendance, useGetMonthlyAttendanceSummaryAllStudents, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar, CheckCircle, XCircle, TrendingUp, Lock } from 'lucide-react';
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
  const { data: userProfile } = useGetCallerUserProfile();
  const isAdmin = userProfile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-premium">
            <Lock className="w-12 h-12 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Admin Access Only</h3>
          <p className="text-muted-foreground font-medium">Only administrators can manage attendance records.</p>
        </div>
      </div>
    );
  }

  return <AttendanceContent />;
}

function AttendanceContent() {
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const markAttendance = useMarkAttendance();
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, boolean>>(new Map());

  const handleAttendanceToggle = (studentId: bigint, present: boolean) => {
    setAttendanceMap(new Map(attendanceMap.set(studentId.toString(), present)));
  };

  const handleSubmitAttendance = async () => {
    if (attendanceMap.size === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    const timestamp = BigInt(new Date(selectedDate).getTime());

    try {
      const promises = Array.from(attendanceMap.entries()).map(([studentId, present]) =>
        markAttendance.mutateAsync({
          studentId: BigInt(studentId),
          date: timestamp,
          present,
        })
      );

      await Promise.all(promises);
      toast.success('Attendance marked successfully!');
      setAttendanceMap(new Map());
    } catch (error) {
      toast.error('Failed to mark attendance');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="glass-effect border border-gray-200/50 dark:border-gray-800/50 p-1.5">
          <TabsTrigger 
            value="mark"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger 
            value="summary"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            Monthly Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-6">
          <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5" />
                Mark Daily Attendance
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Date: {selectedDate}</p>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground font-medium">No students found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {students.map((student) => {
                      const isPresent = attendanceMap.get(student.id.toString());
                      return (
                        <div
                          key={student.id.toString()}
                          className="flex items-center justify-between p-4 border-2 rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-sm text-muted-foreground">Class {student.classId.toString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={isPresent === true ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceToggle(student.id, true)}
                              className={isPresent === true ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg' : 'border-2'}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Present
                            </Button>
                            <Button
                              variant={isPresent === false ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceToggle(student.id, false)}
                              className={isPresent === false ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg' : 'border-2'}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    onClick={handleSubmitAttendance}
                    disabled={markAttendance.isPending || attendanceMap.size === 0}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-premium h-12 text-base font-semibold"
                  >
                    {markAttendance.isPending ? 'Submitting...' : `Submit Attendance (${attendanceMap.size} students)`}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <MonthlySummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MonthlySummary() {
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const { data: students = [] } = useGetAllStudents();
  const { data: summaries = [], isLoading } = useGetMonthlyAttendanceSummaryAllStudents(BigInt(2026));

  const filteredSummaries = summaries.filter((summary) => {
    const matchesMonth = Number(summary.month) === selectedMonth;
    const matchesStudent = selectedStudentId === 'all' || summary.studentId.toString() === selectedStudentId;
    return matchesMonth && matchesStudent;
  });

  return (
    <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="w-5 h-5" />
          Monthly Attendance Summary (2026)
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Select student" />
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-medium">No attendance records found for this selection</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="font-bold">Student</TableHead>
                  <TableHead className="font-bold">Total Days</TableHead>
                  <TableHead className="font-bold">Present</TableHead>
                  <TableHead className="font-bold">Absent</TableHead>
                  <TableHead className="font-bold">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummaries.map((summary) => {
                  const student = students.find((s) => s.id.toString() === summary.studentId.toString());
                  const attendancePercentage = summary.totalDays > 0
                    ? ((Number(summary.daysPresent) / Number(summary.totalDays)) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <TableRow key={`${summary.studentId}-${summary.month}`} className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors">
                      <TableCell className="font-semibold">{student?.name || 'Unknown'}</TableCell>
                      <TableCell>{summary.totalDays.toString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                          {summary.daysPresent.toString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-md">
                          {summary.daysAbsent.toString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            Number(attendancePercentage) >= 75
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                              : Number(attendancePercentage) >= 50
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                              : 'bg-gradient-to-r from-red-500 to-pink-600'
                          } text-white border-0 shadow-md`}
                        >
                          {attendancePercentage}%
                        </Badge>
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
  );
}
