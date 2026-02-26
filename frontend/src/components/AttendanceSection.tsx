import React, { useState } from 'react';
import { useGetAllStudents, useGetAllAttendance, useMarkAttendance } from '../hooks/useQueries';
import { CalendarCheck, Loader2, CheckCircle, XCircle, Users, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AttendanceSectionProps {
  enabled?: boolean;
}

const CLASS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function AttendanceSection({ enabled = true }: AttendanceSectionProps) {
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents(enabled);
  const { data: attendance = [], isLoading: attendanceLoading } = useGetAllAttendance(enabled);
  const markAttendance = useMarkAttendance();

  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'mark' | 'summary'>('mark');
  const [markingId, setMarkingId] = useState<bigint | null>(null);

  const isLoading = studentsLoading || attendanceLoading;

  const classStudents = students.filter(s => Number(s.classId) === selectedClass);

  const getAttendanceForDate = (studentId: bigint, date: string): boolean | null => {
    const dateTs = BigInt(new Date(date).getTime());
    const record = attendance.find(
      a => a.studentId === studentId && a.date === dateTs
    );
    return record ? record.present : null;
  };

  const handleMark = async (studentId: bigint, present: boolean) => {
    setMarkingId(studentId);
    try {
      await markAttendance.mutateAsync({
        studentId,
        date: BigInt(new Date(selectedDate).getTime()),
        present,
      });
    } finally {
      setMarkingId(null);
    }
  };

  const getSummary = (studentId: bigint) => {
    const records = attendance.filter(a => a.studentId === studentId);
    const present = records.filter(a => a.present).length;
    const absent = records.filter(a => !a.present).length;
    return { total: records.length, present, absent };
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Header */}
      <div className="rounded-2xl p-6 shadow-amber" style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <CalendarCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Attendance</h2>
              <p className="text-amber-100 text-sm font-medium">Mark and track student attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/20">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">{students.length} students</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="premium-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* View Toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => setView('mark')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                view === 'mark'
                  ? 'text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              style={view === 'mark' ? { background: 'linear-gradient(135deg, #b45309, #d97706)' } : {}}
            >
              <CalendarCheck className="w-4 h-4" />
              Mark Attendance
            </button>
            <button
              onClick={() => setView('summary')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                view === 'summary'
                  ? 'text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              style={view === 'summary' ? { background: 'linear-gradient(135deg, #b45309, #d97706)' } : {}}
            >
              <BarChart3 className="w-4 h-4" />
              Summary
            </button>
          </div>

          {/* Class Selector */}
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {CLASS_OPTIONS.map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>

          {/* Date Picker */}
          {view === 'mark' && (
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : classStudents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg mb-2">No students in Class {selectedClass}</h3>
            <p className="text-muted-foreground text-sm">Add students to this class to mark attendance.</p>
          </div>
        ) : view === 'mark' ? (
          <div>
            {/* Table Header */}
            <div className="px-4 py-3 border-b border-border" style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-sm uppercase tracking-wide">Student</span>
                <span className="text-white font-bold text-sm uppercase tracking-wide">Mark Attendance</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {classStudents.map(student => {
                const status = getAttendanceForDate(student.id, selectedDate);
                const isMarking = markingId === student.id;
                return (
                  <div key={student.id.toString()} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>
                        <span className="text-white font-bold text-sm">{student.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">Class {student.classId.toString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {status !== null && (
                        <Badge
                          className="text-xs font-bold"
                          style={status
                            ? { background: '#059669', color: 'white', border: 'none' }
                            : { background: '#dc2626', color: 'white', border: 'none' }
                          }
                        >
                          {status ? 'Present' : 'Absent'}
                        </Badge>
                      )}
                      <button
                        onClick={() => handleMark(student.id, true)}
                        disabled={isMarking}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white transition-all duration-200 disabled:opacity-50 shadow-md"
                        style={{ background: 'linear-gradient(135deg, #047857, #059669)' }}
                        title="Mark Present"
                      >
                        {isMarking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><CheckCircle className="w-4 h-4" />Present</>
                        )}
                      </button>
                      <button
                        onClick={() => handleMark(student.id, false)}
                        disabled={isMarking}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white transition-all duration-200 disabled:opacity-50 shadow-md"
                        style={{ background: 'linear-gradient(135deg, #b91c1c, #dc2626)' }}
                        title="Mark Absent"
                      >
                        {isMarking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><XCircle className="w-4 h-4" />Absent</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {/* Summary Table Header */}
            <div className="px-4 py-3 border-b border-border" style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>
              <div className="grid grid-cols-4 gap-4">
                <span className="text-white font-bold text-sm uppercase tracking-wide">Student</span>
                <span className="text-white font-bold text-sm uppercase tracking-wide text-center">Total</span>
                <span className="text-white font-bold text-sm uppercase tracking-wide text-center">Present</span>
                <span className="text-white font-bold text-sm uppercase tracking-wide text-center">Absent</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {classStudents.map(student => {
                const summary = getSummary(student.id);
                const pct = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;
                return (
                  <div key={student.id.toString()} className="px-4 py-4 hover:bg-gray-50 transition-colors bg-white">
                    <div className="grid grid-cols-4 gap-4 items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}>
                          <span className="text-white font-bold text-xs">{student.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-bold text-foreground text-sm truncate">{student.name}</span>
                      </div>
                      <span className="text-center font-bold text-foreground">{summary.total}</span>
                      <span className="text-center font-bold" style={{ color: '#059669' }}>{summary.present}</span>
                      <span className="text-center font-bold" style={{ color: '#dc2626' }}>{summary.absent}</span>
                    </div>
                    {summary.total > 0 && (
                      <div className="ml-10">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-muted-foreground">Attendance Rate</span>
                          <span style={{ color: pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626' }}>{pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: pct >= 75
                                ? 'linear-gradient(90deg, #047857, #059669)'
                                : pct >= 50
                                ? 'linear-gradient(90deg, #b45309, #d97706)'
                                : 'linear-gradient(90deg, #b91c1c, #dc2626)',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
