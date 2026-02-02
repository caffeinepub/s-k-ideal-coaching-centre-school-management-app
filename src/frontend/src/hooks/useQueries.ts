import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Student, TeacherProfile, FeeRecord, AttendanceRecord, UserProfile, StudentId, TeacherId, ClassId, MonthlyAttendanceSummary, ReportCard, ReportCardId, SubjectMarks } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        console.warn('Actor not available for profile fetch');
        throw new Error('Backend connection not available. Please wait...');
      }
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('Profile fetched successfully:', profile);
        return profile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Dashboard Queries
export function useGetDashboardMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getDashboardMetrics();
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

// Student Queries
export function useGetAllStudents() {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllStudents();
      } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useGetStudentsByClass(classId: ClassId) {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['students', 'class', classId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getStudentsByClass(classId);
      } catch (error) {
        console.error('Error fetching students by class:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; classId: ClassId; parentContact: string; admissionStatus: boolean; photoUrl: string | null }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.addStudent(data.name, data.classId, data.parentContact, data.admissionStatus, data.photoUrl);
      } catch (error) {
        console.error('Error adding student:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: StudentId; name: string; classId: ClassId; parentContact: string; admissionStatus: boolean; photoUrl: string | null }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.updateStudent(data.id, data.name, data.classId, data.parentContact, data.admissionStatus, data.photoUrl);
      } catch (error) {
        console.error('Error updating student:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: StudentId) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.deleteStudent(id);
      } catch (error) {
        console.error('Error deleting student:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
    },
  });
}

// Teacher Queries
export function useGetAllTeachers() {
  const { actor, isFetching } = useActor();

  return useQuery<TeacherProfile[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllTeachers();
      } catch (error) {
        console.error('Error fetching teachers:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useAddTeacherWithCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; subject: string; assignedClasses: ClassId[]; uniqueId: string; password: string }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.addTeacherWithCredentials(data.name, data.subject, data.assignedClasses, data.uniqueId, data.password);
      } catch (error) {
        console.error('Error adding teacher:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

export function useUpdateTeacher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: TeacherId; name: string; subject: string; assignedClasses: ClassId[] }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.updateTeacher(data.id, data.name, data.subject, data.assignedClasses);
      } catch (error) {
        console.error('Error updating teacher:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}

export function useDeleteTeacher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: TeacherId) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.deleteTeacher(id);
      } catch (error) {
        console.error('Error deleting teacher:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

// Fee Queries
export function useGetAllFeeRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<FeeRecord[]>({
    queryKey: ['feeRecords'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllFeeRecords();
      } catch (error) {
        console.error('Error fetching fee records:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useGetFeeRecordsByStudent(studentId: StudentId) {
  const { actor, isFetching } = useActor();

  return useQuery<FeeRecord[]>({
    queryKey: ['feeRecords', 'student', studentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFeeRecordsByStudent(studentId);
      } catch (error) {
        console.error('Error fetching fee records by student:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useAddFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: StudentId; classId: ClassId; amount: bigint; isPaid: boolean }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.addFeeRecord(data.studentId, data.classId, data.amount, data.isPaid);
      } catch (error) {
        console.error('Error adding fee record:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

export function useUpdateFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; studentId: StudentId; classId: ClassId; amount: bigint; isPaid: boolean }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.updateFeeRecord(data.id, data.studentId, data.classId, data.amount, data.isPaid);
      } catch (error) {
        console.error('Error updating fee record:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

// Attendance Queries
export function useGetAllAttendance() {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAttendance();
      } catch (error) {
        console.error('Error fetching attendance:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useGetAttendanceByStudent(studentId: StudentId) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', 'student', studentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAttendanceByStudent(studentId);
      } catch (error) {
        console.error('Error fetching attendance by student:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: StudentId; date: bigint; present: boolean }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.markAttendance(data.studentId, data.date, data.present);
      } catch (error) {
        console.error('Error marking attendance:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyAttendance'] });
    },
  });
}

export function useGetMonthlyAttendanceSummary(studentId: StudentId, year: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<MonthlyAttendanceSummary[]>({
    queryKey: ['monthlyAttendance', 'student', studentId.toString(), year.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMonthlyAttendanceSummary(studentId, year);
      } catch (error) {
        console.error('Error fetching monthly attendance summary:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useGetMonthlyAttendanceSummaryAllStudents(year: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<MonthlyAttendanceSummary[]>({
    queryKey: ['monthlyAttendance', 'all', year.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMonthlyAttendanceSummaryAllStudents(year);
      } catch (error) {
        console.error('Error fetching monthly attendance summary for all students:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

// Report Card Queries
export function useGetAllReportCards() {
  const { actor, isFetching } = useActor();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllReportCards();
      } catch (error) {
        console.error('Error fetching report cards:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useGetReportCardsByStudent(studentId: StudentId) {
  const { actor, isFetching } = useActor();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards', 'student', studentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getReportCardsByStudent(studentId);
      } catch (error) {
        console.error('Error fetching report cards by student:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useGetReportCardsByClass(classId: ClassId) {
  const { actor, isFetching } = useActor();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards', 'class', classId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getReportCardsByClass(classId);
      } catch (error) {
        console.error('Error fetching report cards by class:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
  });
}

export function useAddReportCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: StudentId;
      teacherId: TeacherId;
      subjectMarks: SubjectMarks[];
      totalMarks: bigint;
      grade: string;
      teacherRemarks: string;
      evaluationDate: bigint;
    }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.addReportCard(
          data.studentId,
          data.teacherId,
          data.subjectMarks,
          data.totalMarks,
          data.grade,
          data.teacherRemarks,
          data.evaluationDate
        );
      } catch (error) {
        console.error('Error adding report card:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportCards'] });
    },
  });
}

export function useUpdateReportCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: ReportCardId;
      studentId: StudentId;
      teacherId: TeacherId;
      subjectMarks: SubjectMarks[];
      totalMarks: bigint;
      grade: string;
      teacherRemarks: string;
      evaluationDate: bigint;
    }) => {
      if (!actor) throw new Error('Backend connection not available');
      try {
        return await actor.updateReportCard(
          data.id,
          data.studentId,
          data.teacherId,
          data.subjectMarks,
          data.totalMarks,
          data.grade,
          data.teacherRemarks,
          data.evaluationDate
        );
      } catch (error) {
        console.error('Error updating report card:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportCards'] });
    },
  });
}
