import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    role: string;
}
export interface ReportCard {
    id: ReportCardId;
    subjectMarks: Array<SubjectMarks>;
    teacherRemarks: string;
    totalMarks: bigint;
    studentId: StudentId;
    grade: string;
    teacherId: TeacherId;
    evaluationDate: bigint;
}
export type StudentId = bigint;
export type TeacherId = bigint;
export interface MonthlyAttendanceSummary {
    month: bigint;
    studentId: StudentId;
    totalDays: bigint;
    daysAbsent: bigint;
    daysPresent: bigint;
}
export interface TeacherProfile {
    id: TeacherId;
    subject: string;
    name: string;
    uniqueId: string;
    assignedClasses: Array<ClassId>;
}
export interface SubjectMarks {
    marks: bigint;
    subject: string;
}
export interface FeeRecord {
    studentId: StudentId;
    isPaid: boolean;
    classId: ClassId;
    amount: bigint;
}
export interface ActivityAuditLogEntry {
    action: string;
    performerRole: string;
    performerPrincipal: Principal;
    timestamp: bigint;
    details: string;
}
export type ClassId = bigint;
export interface AttendanceRecord {
    studentId: StudentId;
    present: boolean;
    date: bigint;
}
export type ReportCardId = bigint;
export interface Student {
    id: StudentId;
    parentContact: string;
    name: string;
    photoUrl?: string;
    classId: ClassId;
    admissionStatus: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFeeRecord(studentId: StudentId, classId: ClassId, amount: bigint, isPaid: boolean): Promise<bigint>;
    addReportCard(studentId: StudentId, teacherId: TeacherId, subjectMarks: Array<SubjectMarks>, totalMarks: bigint, grade: string, teacherRemarks: string, evaluationDate: bigint): Promise<ReportCardId>;
    addStudent(name: string, classId: ClassId, parentContact: string, admissionStatus: boolean, photoUrl: string | null): Promise<StudentId>;
    addTeacherWithCredentials(name: string, subject: string, assignedClasses: Array<ClassId>, uniqueId: string, password: string): Promise<TeacherId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignTeacherRole(teacherPrincipal: Principal, uniqueId: string): Promise<void>;
    createActivityLogEntry(performerRole: string, action: string, details: string): Promise<void>;
    deleteFeeRecord(id: bigint): Promise<void>;
    deleteStudent(id: StudentId): Promise<void>;
    deleteTeacher(id: TeacherId): Promise<void>;
    getActivityAuditLogsByRole(role: string): Promise<Array<ActivityAuditLogEntry>>;
    getAllActivityAuditLogs(): Promise<Array<ActivityAuditLogEntry>>;
    getAllAttendance(): Promise<Array<AttendanceRecord>>;
    getAllFeeRecords(): Promise<Array<FeeRecord>>;
    getAllReportCards(): Promise<Array<ReportCard>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<TeacherProfile>>;
    getAttendanceByStudent(studentId: StudentId): Promise<Array<AttendanceRecord>>;
    getCallerRole(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardMetrics(): Promise<{
        totalFeesCollected: bigint;
        totalStudents: bigint;
        outstandingFees: bigint;
        totalTeachers: bigint;
    }>;
    getFeeRecord(id: bigint): Promise<FeeRecord | null>;
    getFeeRecordsByClass(classId: ClassId): Promise<Array<FeeRecord>>;
    getFeeRecordsByStudent(studentId: StudentId): Promise<Array<FeeRecord>>;
    getMonthlyAttendanceSummary(studentId: StudentId, year: bigint): Promise<Array<MonthlyAttendanceSummary>>;
    getMonthlyAttendanceSummaryAllStudents(year: bigint): Promise<Array<MonthlyAttendanceSummary>>;
    getReportCard(id: ReportCardId): Promise<ReportCard | null>;
    getReportCardsByClass(classId: ClassId): Promise<Array<ReportCard>>;
    getReportCardsByStudent(studentId: StudentId): Promise<Array<ReportCard>>;
    getReportCardsByTeacher(teacherId: TeacherId): Promise<Array<ReportCard>>;
    getStudent(id: StudentId): Promise<Student | null>;
    getStudentActivityHistory(studentId: StudentId): Promise<Array<ActivityAuditLogEntry>>;
    getStudentsByClass(classId: ClassId): Promise<Array<Student>>;
    getTeacher(id: TeacherId): Promise<TeacherProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAttendance(studentId: StudentId, date: bigint, present: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleFeePaymentStatus(id: bigint): Promise<boolean>;
    updateFeeRecord(id: bigint, studentId: StudentId, classId: ClassId, amount: bigint, isPaid: boolean): Promise<void>;
    updateReportCard(id: ReportCardId, studentId: StudentId, teacherId: TeacherId, subjectMarks: Array<SubjectMarks>, totalMarks: bigint, grade: string, teacherRemarks: string, evaluationDate: bigint): Promise<void>;
    updateStudent(id: StudentId, name: string, classId: ClassId, parentContact: string, admissionStatus: boolean, photoUrl: string | null): Promise<void>;
    updateTeacher(id: TeacherId, name: string, subject: string, assignedClasses: Array<ClassId>): Promise<void>;
    verifyAndAuthenticateTeacher(uniqueId: string, password: string): Promise<boolean>;
}
