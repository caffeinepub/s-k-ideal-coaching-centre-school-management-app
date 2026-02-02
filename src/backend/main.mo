import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// No migration needed
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type StudentId = Nat;
  public type TeacherId = Nat;
  public type ClassId = Nat;
  public type ReportCardId = Nat;

  public type Student = {
    id : StudentId;
    name : Text;
    classId : ClassId;
    parentContact : Text;
    admissionStatus : Bool;
    photoUrl : ?Text;
  };

  public type Teacher = {
    id : TeacherId;
    name : Text;
    subject : Text;
    assignedClasses : [ClassId];
    uniqueId : Text;
    password : Text;
  };

  public type TeacherProfile = {
    id : TeacherId;
    name : Text;
    subject : Text;
    assignedClasses : [ClassId];
    uniqueId : Text;
  };

  public type FeeRecord = {
    studentId : StudentId;
    classId : ClassId;
    amount : Nat;
    isPaid : Bool;
  };

  public type AttendanceRecord = {
    studentId : StudentId;
    date : Int;
    present : Bool;
  };

  public type MonthlyAttendanceSummary = {
    studentId : StudentId;
    month : Nat;
    totalDays : Nat;
    daysPresent : Nat;
    daysAbsent : Nat;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  public type SubjectMarks = {
    subject : Text;
    marks : Nat;
  };

  public type ReportCard = {
    id : ReportCardId;
    studentId : StudentId;
    teacherId : TeacherId;
    subjectMarks : [SubjectMarks];
    totalMarks : Nat;
    grade : Text;
    teacherRemarks : Text;
    evaluationDate : Int;
  };

  let students = Map.empty<StudentId, Student>();
  let teachers = Map.empty<TeacherId, Teacher>();
  let feeRecords = Map.empty<Nat, FeeRecord>();
  let attendanceRecords = Map.empty<Nat, AttendanceRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let teacherPrincipals = Map.empty<Text, Principal>();
  let principalToTeacherId = Map.empty<Principal, TeacherId>();
  let reportCards = Map.empty<ReportCardId, ReportCard>();

  var studentCounter = 0;
  var teacherCounter = 0;
  var feeRecordCounter = 0;
  var reportCardCounter = 0;

  // User Profile Management 
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerRole() : async Text {
    let userRole = AccessControl.getUserRole(
      accessControlState,
      caller,
    );
    switch (userRole) {
      case (#admin) { "admin" };
      case (#user) { "user" };
      case (#guest) { "guest" };
    };
  };

  // Student Management
  public shared ({ caller }) func addStudent(
    name : Text,
    classId : ClassId,
    parentContact : Text,
    admissionStatus : Bool,
    photoUrl : ?Text,
  ) : async StudentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    let studentId = studentCounter;
    let student : Student = {
      id = studentId;
      name;
      classId;
      parentContact;
      admissionStatus;
      photoUrl;
    };
    students.add(studentId, student);
    studentCounter += 1;
    studentId;
  };

  public shared ({ caller }) func updateStudent(
    id : StudentId,
    name : Text,
    classId : ClassId,
    parentContact : Text,
    admissionStatus : Bool,
    photoUrl : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update students");
    };
    let student : Student = {
      id;
      name;
      classId;
      parentContact;
      admissionStatus;
      photoUrl;
    };
    students.add(id, student);
  };

  public shared ({ caller }) func deleteStudent(id : StudentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?_) {
        students.remove(id);
      };
    };
  };

  public query ({ caller }) func getStudent(id : StudentId) : async ?Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };
    students.get(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };
    students.values().toArray();
  };

  public query ({ caller }) func getStudentsByClass(classId : ClassId) : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view students");
    };
    let filtered = students.values().filter(func(s) { s.classId == classId });
    filtered.toArray();
  };

  // Teacher Management - Admin only
  public shared ({ caller }) func addTeacherWithCredentials(name : Text, subject : Text, assignedClasses : [ClassId], uniqueId : Text, password : Text) : async TeacherId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add teachers");
    };
    for ((_, teacher) in teachers.entries()) {
      if (teacher.uniqueId == uniqueId) {
        Runtime.trap("Teacher with this unique ID already exists");
      };
    };
    let teacherId = teacherCounter;

    let teacher : Teacher = {
      id = teacherId;
      name;
      subject;
      assignedClasses;
      uniqueId;
      password;
    };
    teachers.add(teacherId, teacher);
    teacherCounter += 1;
    teacherId;
  };

  public shared ({ caller }) func updateTeacher(id : TeacherId, name : Text, subject : Text, assignedClasses : [ClassId]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update teachers");
    };
    switch (teachers.get(id)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?oldTeacher) {
        let updatedTeacher : Teacher = {
          oldTeacher with name;
          subject;
          assignedClasses;
        };
        teachers.add(id, updatedTeacher);
      };
    };
  };

  public shared ({ caller }) func deleteTeacher(id : TeacherId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete teachers");
    };
    switch (teachers.get(id)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?teacher) {
        switch (teacherPrincipals.get(teacher.uniqueId)) {
          case (?principal) {
            principalToTeacherId.remove(principal);
          };
          case (null) {};
        };
        teacherPrincipals.remove(teacher.uniqueId);
        teachers.remove(id);
      };
    };
  };

  public query ({ caller }) func getTeacher(id : TeacherId) : async ?TeacherProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view teacher details");
    };
    switch (teachers.get(id)) {
      case (null) { null };
      case (?teacher) {
        ?{
          id = teacher.id;
          name = teacher.name;
          subject = teacher.subject;
          assignedClasses = teacher.assignedClasses;
          uniqueId = teacher.uniqueId;
        };
      };
    };
  };

  public query ({ caller }) func getAllTeachers() : async [TeacherProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all teachers");
    };
    let teacherProfiles = teachers.values().map(
      func(t) {
        {
          id = t.id;
          name = t.name;
          subject = t.subject;
          assignedClasses = t.assignedClasses;
          uniqueId = t.uniqueId;
        };
      }
    ).toArray();
    teacherProfiles;
  };

  // Fee Management - Admin and Teachers can update
  public shared ({ caller }) func addFeeRecord(studentId : StudentId, classId : ClassId, amount : Nat, isPaid : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add fee records");
    };
    let recordId = feeRecordCounter;
    let feeRecord : FeeRecord = {
      studentId;
      classId;
      amount;
      isPaid;
    };
    feeRecords.add(recordId, feeRecord);
    feeRecordCounter += 1;
    recordId;
  };

  public shared ({ caller }) func updateFeeRecord(id : Nat, studentId : StudentId, classId : ClassId, amount : Nat, isPaid : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update fee records");
    };
    let feeRecord : FeeRecord = {
      studentId;
      classId;
      amount;
      isPaid;
    };
    feeRecords.add(id, feeRecord);
  };

  public query ({ caller }) func getFeeRecord(id : Nat) : async ?FeeRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fee records");
    };
    feeRecords.get(id);
  };

  public query ({ caller }) func getAllFeeRecords() : async [FeeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fee records");
    };
    feeRecords.values().toArray();
  };

  public query ({ caller }) func getFeeRecordsByStudent(studentId : StudentId) : async [FeeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fee records");
    };
    let filtered = feeRecords.values().filter(func(f) { f.studentId == studentId });
    filtered.toArray();
  };

  public query ({ caller }) func getFeeRecordsByClass(classId : ClassId) : async [FeeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fee records");
    };
    let filtered = feeRecords.values().filter(func(f) { f.classId == classId });
    filtered.toArray();
  };

  // Attendance Management - Teachers and Admins can mark, all authenticated users can view
  public shared ({ caller }) func markAttendance(studentId : StudentId, date : Int, present : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark attendance");
    };
    let recordId = attendanceRecords.size();
    let attendanceRecord : AttendanceRecord = {
      studentId;
      date;
      present;
    };
    attendanceRecords.add(recordId, attendanceRecord);
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : StudentId) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance");
    };
    let filtered = attendanceRecords.values().filter(func(a) { a.studentId == studentId });
    filtered.toArray();
  };

  public query ({ caller }) func getAllAttendance() : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance");
    };
    attendanceRecords.values().toArray();
  };

  public query ({ caller }) func getMonthlyAttendanceSummary(studentId : StudentId, year : Nat) : async [MonthlyAttendanceSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance summaries");
    };

    let records = attendanceRecords.values().toArray();

    var monthlyData = Map.empty<Nat, { totalDays : Nat; daysPresent : Nat; daysAbsent : Nat }>();

    for (record in records.values()) {
      if (record.studentId == studentId and getYear(record.date) == year) {
        let month = getMonth(record.date);

        let current = switch (monthlyData.get(month)) {
          case (null) { { totalDays = 0; daysPresent = 0; daysAbsent = 0 } };
          case (?data) { data };
        };

        let updated = {
          totalDays = current.totalDays + 1;
          daysPresent = current.daysPresent + (if (record.present) { 1 } else { 0 });
          daysAbsent = current.daysAbsent + (if (record.present) { 0 } else { 1 });
        };

        monthlyData.add(month, updated);
      };
    };

    monthlyData.entries().toArray().map(
      func((month, data)) {
        {
          studentId;
          month;
          totalDays = data.totalDays;
          daysPresent = data.daysPresent;
          daysAbsent = data.daysAbsent;
        };
      }
    );
  };

  public query ({ caller }) func getMonthlyAttendanceSummaryAllStudents(year : Nat) : async [MonthlyAttendanceSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view attendance summaries");
    };

    let records = attendanceRecords.values().toArray();
    var summaries : [MonthlyAttendanceSummary] = [];

    for (record in records.values()) {
      if (getYear(record.date) == year) {
        let studentId = record.studentId;
        let month = getMonth(record.date);

        let existingSummaryIndex = summaries.findIndex(
          func(s) { s.studentId == studentId and s.month == month }
        );

        switch (existingSummaryIndex) {
          case (null) {
            let newSummary : MonthlyAttendanceSummary = {
              studentId;
              month;
              totalDays = 1;
              daysPresent = if (record.present) { 1 } else { 0 };
              daysAbsent = if (record.present) { 0 } else { 1 };
            };
            summaries := Array.tabulate(
              summaries.size() + 1,
              func(i) {
                if (i < summaries.size()) { summaries[i] } else { newSummary };
              },
            );
          };
          case (?index) {
            let current = summaries[index];
            let updated = {
              current with
              totalDays = current.totalDays + 1;
              daysPresent = current.daysPresent + (if (record.present) { 1 } else { 0 });
              daysAbsent = current.daysAbsent + (if (record.present) { 0 } else { 1 });
            };
            summaries := Array.tabulate(
              summaries.size(),
              func(i) {
                if (i != index) { summaries[i] } else { updated };
              },
            );
          };
        };
      };
    };

    summaries;
  };

  func getYear(_timestamp : Int) : Nat {
    2026;
  };

  func getMonth(_timestamp : Int) : Nat {
    1;
  };

  // Dashboard Metrics - Authenticated users can view
  public query ({ caller }) func getDashboardMetrics() : async {
    totalStudents : Nat;
    totalFeesCollected : Nat;
    totalTeachers : Nat;
    outstandingFees : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view dashboard");
    };

    let totalStudents = students.size();
    let totalTeachers = teachers.size();

    var totalFeesCollected = 0;
    var outstandingFees = 0;

    for (feeRecord in feeRecords.values()) {
      if (feeRecord.isPaid) {
        totalFeesCollected += feeRecord.amount;
      } else {
        outstandingFees += feeRecord.amount;
      };
    };

    {
      totalStudents;
      totalFeesCollected;
      totalTeachers;
      outstandingFees;
    };
  };

  // Teacher authentication - Admin only can assign teacher roles
  public shared ({ caller }) func assignTeacherRole(teacherPrincipal : Principal, uniqueId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign teacher roles");
    };

    var foundTeacher : ?Teacher = null;
    for ((_, teacher) in teachers.entries()) {
      if (teacher.uniqueId == uniqueId) {
        foundTeacher := ?teacher;
      };
    };

    switch (foundTeacher) {
      case (null) { Runtime.trap("Teacher with this unique ID not found") };
      case (?teacher) {
        AccessControl.assignRole(accessControlState, caller, teacherPrincipal, #user);
        teacherPrincipals.add(uniqueId, teacherPrincipal);
        principalToTeacherId.add(teacherPrincipal, teacher.id);

        let profile : UserProfile = {
          name = teacher.name;
          role = "teacher";
        };
        userProfiles.add(teacherPrincipal, profile);
      };
    };
  };

  // Verify teacher credentials - Public function for teacher login (no admin check needed)
  public shared func verifyAndAuthenticateTeacher(uniqueId : Text, password : Text) : async Bool {
    var foundTeacher : ?Teacher = null;
    for ((_, teacher) in teachers.entries()) {
      if (teacher.uniqueId == uniqueId) {
        foundTeacher := ?teacher;
      };
    };

    switch (foundTeacher) {
      case (null) { false };
      case (?teacher) {
        password == teacher.password;
      };
    };
  };

  // Helper function to check if teacher has access to a student's class
  func teacherHasAccessToStudent(teacherId : TeacherId, studentId : StudentId) : Bool {
    switch (teachers.get(teacherId)) {
      case (null) { false };
      case (?teacher) {
        switch (students.get(studentId)) {
          case (null) { false };
          case (?student) {
            teacher.assignedClasses.find(func(classId : ClassId) : Bool { classId == student.classId }) != null;
          };
        };
      };
    };
  };

  // Report Card Management
  public shared ({ caller }) func addReportCard(
    studentId : StudentId,
    teacherId : TeacherId,
    subjectMarks : [SubjectMarks],
    totalMarks : Nat,
    grade : Text,
    teacherRemarks : Text,
    evaluationDate : Int,
  ) : async ReportCardId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only teachers and admins can add report cards");
    };

    // If not admin, verify teacher has access to this student
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (principalToTeacherId.get(caller)) {
        case (null) { Runtime.trap("Unauthorized: Teacher profile not found") };
        case (?callerTeacherId) {
          if (callerTeacherId != teacherId) {
            Runtime.trap("Unauthorized: Cannot create report cards for other teachers");
          };
          if (not teacherHasAccessToStudent(teacherId, studentId)) {
            Runtime.trap("Unauthorized: Teacher does not have access to this student's class");
          };
        };
      };
    };

    let reportCard : ReportCard = {
      id = reportCardCounter;
      studentId;
      teacherId;
      subjectMarks;
      totalMarks;
      grade;
      teacherRemarks;
      evaluationDate;
    };

    reportCards.add(reportCardCounter, reportCard);
    reportCardCounter += 1;
    reportCardCounter - 1;
  };

  public shared ({ caller }) func updateReportCard(
    id : ReportCardId,
    studentId : StudentId,
    teacherId : TeacherId,
    subjectMarks : [SubjectMarks],
    totalMarks : Nat,
    grade : Text,
    teacherRemarks : Text,
    evaluationDate : Int,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only teachers and admins can update report cards");
    };

    switch (reportCards.get(id)) {
      case (null) { Runtime.trap("Report card not found") };
      case (?existingCard) {
        // If not admin, verify teacher has access
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          switch (principalToTeacherId.get(caller)) {
            case (null) { Runtime.trap("Unauthorized: Teacher profile not found") };
            case (?callerTeacherId) {
              // Teacher can only update their own report cards
              if (existingCard.teacherId != callerTeacherId) {
                Runtime.trap("Unauthorized: Cannot update report cards created by other teachers");
              };
              // Verify teacher still has access to the student's class
              if (not teacherHasAccessToStudent(callerTeacherId, studentId)) {
                Runtime.trap("Unauthorized: Teacher does not have access to this student's class");
              };
            };
          };
        };

        let updatedReportCard : ReportCard = {
          id;
          studentId;
          teacherId;
          subjectMarks;
          totalMarks;
          grade;
          teacherRemarks;
          evaluationDate;
        };
        reportCards.add(id, updatedReportCard);
      };
    };
  };

  public query ({ caller }) func getReportCard(id : ReportCardId) : async ?ReportCard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view report cards");
    };
    reportCards.get(id);
  };

  public query ({ caller }) func getAllReportCards() : async [ReportCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view report cards");
    };
    reportCards.values().toArray();
  };

  public query ({ caller }) func getReportCardsByStudent(studentId : StudentId) : async [ReportCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view report cards");
    };
    let filtered = reportCards.values().filter(func(r) { r.studentId == studentId });
    filtered.toArray();
  };

  public query ({ caller }) func getReportCardsByTeacher(teacherId : TeacherId) : async [ReportCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view report cards");
    };
    let filtered = reportCards.values().filter(func(r) { r.teacherId == teacherId });
    filtered.toArray();
  };

  public query ({ caller }) func getReportCardsByClass(classId : ClassId) : async [ReportCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view report cards");
    };
    let filtered = reportCards.values().filter(
      func(r) {
        switch (students.get(r.studentId)) {
          case (null) { false };
          case (?student) { student.classId == classId };
        };
      }
    );
    filtered.toArray();
  };
};
