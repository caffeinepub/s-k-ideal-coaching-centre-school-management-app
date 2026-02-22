import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Student, TeacherProfile, FeeRecord, AttendanceRecord, UserProfile, StudentId, TeacherId, ClassId, MonthlyAttendanceSummary, ReportCard, ReportCardId, SubjectMarks } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available. Please wait...');
      }
      try {
        const profile = await actor.getCallerUserProfile();
        return profile;
      } catch (error) {
        console.error('[useGetCallerUserProfile] Error:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
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
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to save your profile.');
      try {
        const result = await actor.saveCallerUserProfile(profile);
        return result;
      } catch (error) {
        console.error('[useSaveCallerUserProfile] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Teacher Authentication
export function useVerifyTeacher() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (credentials: { uniqueId: string; password: string }) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to sign in.');
      
      const isValid = await actor.verifyAndAuthenticateTeacher(credentials.uniqueId, credentials.password);
      
      if (!isValid) {
        throw new Error('Invalid credentials. Please check your username and password.');
      }
      
      return isValid;
    },
    onError: (error: Error) => {
      console.error('[useVerifyTeacher] Error:', error);
    },
  });
}

// Dashboard Metrics
export function useGetDashboardMetrics() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      if (!identity) {
        throw new Error('User not authenticated');
      }
      try {
        const metrics = await actor.getDashboardMetrics();
        return metrics;
      } catch (error) {
        console.error('[useGetDashboardMetrics] Error:', error);
        throw new Error('Failed to load dashboard metrics. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
  });
}

// Student Queries
export function useGetAllStudents() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      if (!identity) {
        throw new Error('User not authenticated');
      }
      try {
        const students = await actor.getAllStudents();
        return students;
      } catch (error) {
        console.error('[useGetAllStudents] Error:', error);
        throw new Error('Failed to load students. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGetStudent(id: StudentId) {
  const { actor } = useActor();

  return useQuery<Student | null>({
    queryKey: ['student', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getStudent(id);
    },
    enabled: !!actor && id !== undefined,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; classId: ClassId; parentContact: string; admissionStatus: boolean; photoUrl: string | null }) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to add students.');
      return actor.addStudent(data.name, data.classId, data.parentContact, data.admissionStatus, data.photoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Student added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add student: ${error.message}`);
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: StudentId; name: string; classId: ClassId; parentContact: string; admissionStatus: boolean; photoUrl: string | null }) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to update students.');
      return actor.updateStudent(data.id, data.name, data.classId, data.parentContact, data.admissionStatus, data.photoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Student updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update student: ${error.message}`);
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: StudentId) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to delete students.');
      return actor.deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete student: ${error.message}`);
    },
  });
}

// Teacher Queries
export function useGetAllTeachers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<TeacherProfile[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      if (!identity) {
        throw new Error('User not authenticated');
      }
      try {
        const teachers = await actor.getAllTeachers();
        return teachers;
      } catch (error) {
        console.error('[useGetAllTeachers] Error:', error);
        throw new Error('Failed to load teachers. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGetTeacher(id: TeacherId) {
  const { actor } = useActor();

  return useQuery<TeacherProfile | null>({
    queryKey: ['teacher', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getTeacher(id);
    },
    enabled: !!actor && id !== undefined,
  });
}

export function useAddTeacher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; subject: string; assignedClasses: ClassId[]; uniqueId: string; password: string }) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to add teachers.');
      return actor.addTeacherWithCredentials(data.name, data.subject, data.assignedClasses, data.uniqueId, data.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Teacher added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add teacher: ${error.message}`);
    },
  });
}

export function useUpdateTeacher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: TeacherId; name: string; subject: string; assignedClasses: ClassId[] }) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to update teachers.');
      return actor.updateTeacher(data.id, data.name, data.subject, data.assignedClasses);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update teacher: ${error.message}`);
    },
  });
}

export function useDeleteTeacher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: TeacherId) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to delete teachers.');
      return actor.deleteTeacher(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Teacher deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete teacher: ${error.message}`);
    },
  });
}

// Fee Record Queries
export function useGetAllFeeRecords() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<FeeRecord[]>({
    queryKey: ['feeRecords'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      if (!identity) {
        throw new Error('User not authenticated');
      }
      try {
        const records = await actor.getAllFeeRecords();
        return records;
      } catch (error) {
        console.error('[useGetAllFeeRecords] Error:', error);
        throw new Error('Failed to load fee records. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAddFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: StudentId; classId: ClassId; amount: bigint; isPaid: boolean }) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to add fee records.');
      return actor.addFeeRecord(data.studentId, data.classId, data.amount, data.isPaid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Fee record added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add fee record: ${error.message}`);
    },
  });
}

export function useUpdateFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; studentId: StudentId; classId: ClassId; amount: bigint; isPaid: boolean }) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to update fee records.');
      return actor.updateFeeRecord(data.id, data.studentId, data.classId, data.amount, data.isPaid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Fee record updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update fee record: ${error.message}`);
    },
  });
}

export function useDeleteFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to delete fee records.');
      return actor.deleteFeeRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      toast.success('Fee record deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete fee record: ${error.message}`);
    },
  });
}

// Attendance Queries
export function useGetAllAttendance() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      if (!identity) {
        throw new Error('User not authenticated');
      }
      try {
        const records = await actor.getAllAttendance();
        return records;
      } catch (error) {
        console.error('[useGetAllAttendance] Error:', error);
        throw new Error('Failed to load attendance records. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGetAttendanceByStudent(studentId: StudentId) {
  const { actor } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', studentId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getAttendanceByStudent(studentId);
    },
    enabled: !!actor && studentId !== undefined,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: StudentId; date: bigint; present: boolean }) => {
      if (!actor) throw new Error('Backend connection not available');
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to mark attendance.');
      return actor.markAttendance(data.studentId, data.date, data.present);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyAttendanceSummary'] });
      toast.success('Attendance marked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });
}

export function useGetMonthlyAttendanceSummary(studentId: StudentId, year: bigint) {
  const { actor } = useActor();

  return useQuery<MonthlyAttendanceSummary[]>({
    queryKey: ['monthlyAttendanceSummary', studentId.toString(), year.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getMonthlyAttendanceSummary(studentId, year);
    },
    enabled: !!actor && studentId !== undefined && year !== undefined,
  });
}

export function useGetMonthlyAttendanceSummaryAllStudents(year: bigint) {
  const { actor } = useActor();

  return useQuery<MonthlyAttendanceSummary[]>({
    queryKey: ['monthlyAttendanceSummaryAllStudents', year.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getMonthlyAttendanceSummaryAllStudents(year);
    },
    enabled: !!actor && year !== undefined,
  });
}

// Report Card Queries
export function useGetAllReportCards() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      if (!identity) {
        throw new Error('User not authenticated');
      }
      try {
        const cards = await actor.getAllReportCards();
        return cards;
      } catch (error) {
        console.error('[useGetAllReportCards] Error:', error);
        throw new Error('Failed to load report cards. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGetReportCardsByStudent(studentId: StudentId) {
  const { actor } = useActor();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards', 'student', studentId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getReportCardsByStudent(studentId);
    },
    enabled: !!actor && studentId !== undefined,
  });
}

export function useGetReportCardsByClass(classId: ClassId) {
  const { actor } = useActor();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards', 'class', classId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Backend connection not available');
      return actor.getReportCardsByClass(classId);
    },
    enabled: !!actor && classId !== undefined,
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
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to add report cards.');
      return actor.addReportCard(
        data.studentId,
        data.teacherId,
        data.subjectMarks,
        data.totalMarks,
        data.grade,
        data.teacherRemarks,
        data.evaluationDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportCards'] });
      toast.success('Report card added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add report card: ${error.message}`);
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
      if (!navigator.onLine) throw new Error('You are offline. Please connect to the internet to update report cards.');
      return actor.updateReportCard(
        data.id,
        data.studentId,
        data.teacherId,
        data.subjectMarks,
        data.totalMarks,
        data.grade,
        data.teacherRemarks,
        data.evaluationDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportCards'] });
      toast.success('Report card updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update report card: ${error.message}`);
    },
  });
}
