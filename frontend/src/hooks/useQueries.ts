import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Student,
  TeacherProfile,
  FeeRecord,
  AttendanceRecord,
  ReportCard,
  SubjectMarks,
  ActivityAuditLogEntry,
  UserProfile,
} from '../backend';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export function useGetDashboardMetrics(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardMetrics();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

// ─── Students ─────────────────────────────────────────────────────────────────

export function useGetAllStudents(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      classId: bigint;
      parentContact: string;
      admissionStatus: boolean;
      photoUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStudent(
        params.name,
        params.classId,
        params.parentContact,
        params.admissionStatus,
        params.photoUrl
      );
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
    mutationFn: async (params: {
      id: bigint;
      name: string;
      classId: bigint;
      parentContact: string;
      admissionStatus: boolean;
      photoUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStudent(
        params.id,
        params.name,
        params.classId,
        params.parentContact,
        params.admissionStatus,
        params.photoUrl
      );
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
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export function useGetAllTeachers(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<TeacherProfile[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeachers();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useAddTeacher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      subject: string;
      assignedClasses: bigint[];
      uniqueId: string;
      password: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTeacherWithCredentials(
        params.name,
        params.subject,
        params.assignedClasses,
        params.uniqueId,
        params.password
      );
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
    mutationFn: async (params: {
      id: bigint;
      name: string;
      subject: string;
      assignedClasses: bigint[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTeacher(
        params.id,
        params.name,
        params.subject,
        params.assignedClasses
      );
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
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTeacher(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

// ─── Teacher Auth ─────────────────────────────────────────────────────────────

export function useVerifyTeacher() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { uniqueId: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.verifyAndAuthenticateTeacher(
        params.uniqueId,
        params.password
      );
      if (!result) {
        throw new Error('Invalid credentials. Please check your Teacher ID and password.');
      }
      return result;
    },
  });
}

// ─── Fee Records ──────────────────────────────────────────────────────────────

export function useGetAllFeeRecords(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<FeeRecord[]>({
    queryKey: ['fees'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeeRecords();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useAddFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      classId: bigint;
      amount: bigint;
      isPaid: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFeeRecord(
        params.studentId,
        params.classId,
        params.amount,
        params.isPaid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

export function useUpdateFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      studentId: bigint;
      classId: bigint;
      amount: bigint;
      isPaid: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFeeRecord(
        params.id,
        params.studentId,
        params.classId,
        params.amount,
        params.isPaid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

export function useDeleteFeeRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteFeeRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

export function useToggleFeePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleFeePaymentStatus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useGetAllAttendance(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAttendance();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      date: bigint;
      present: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAttendance(params.studentId, params.date, params.present);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

// ─── Report Cards ─────────────────────────────────────────────────────────────

export function useGetAllReportCards(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<ReportCard[]>({
    queryKey: ['reportCards'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReportCards();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useAddReportCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      studentId: bigint;
      teacherId: bigint;
      subjectMarks: SubjectMarks[];
      totalMarks: bigint;
      grade: string;
      teacherRemarks: string;
      evaluationDate: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReportCard(
        params.studentId,
        params.teacherId,
        params.subjectMarks,
        params.totalMarks,
        params.grade,
        params.teacherRemarks,
        params.evaluationDate
      );
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
    mutationFn: async (params: {
      id: bigint;
      studentId: bigint;
      teacherId: bigint;
      subjectMarks: SubjectMarks[];
      totalMarks: bigint;
      grade: string;
      teacherRemarks: string;
      evaluationDate: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateReportCard(
        params.id,
        params.studentId,
        params.teacherId,
        params.subjectMarks,
        params.totalMarks,
        params.grade,
        params.teacherRemarks,
        params.evaluationDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportCards'] });
    },
  });
}

// ─── Activity Audit Logs ──────────────────────────────────────────────────────

export function useGetAllActivityLogs(enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityAuditLogEntry[]>({
    queryKey: ['activityLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivityAuditLogs();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}
