import { useState, useMemo } from 'react';
import { useGetAllReportCards, useGetAllStudents, useGetAllTeachers, useAddReportCard, useUpdateReportCard } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Plus, Edit, FileText, Award, Sparkles, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ReportCard, StudentId, TeacherId, ClassId, SubjectMarks } from '../backend';

export default function ReportCardsSection() {
  const { data: reportCards = [], isLoading: cardsLoading } = useGetAllReportCards();
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const { data: teachers = [], isLoading: teachersLoading } = useGetAllTeachers();
  const addReportCard = useAddReportCard();
  const updateReportCard = useUpdateReportCard();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ReportCard | null>(null);
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [filterClassId, setFilterClassId] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    subjects: [{ subject: '', marks: '' }],
    grade: '',
    teacherRemarks: '',
  });

  const isLoading = cardsLoading || studentsLoading || teachersLoading;

  // Get unique classes
  const classes = useMemo(() => {
    const classSet = new Set(students.map(s => s.classId.toString()));
    return Array.from(classSet).sort();
  }, [students]);

  // Filter report cards
  const filteredReportCards = useMemo(() => {
    return reportCards.filter(card => {
      const student = students.find(s => s.id === card.studentId);
      if (filterStudentId !== 'all' && card.studentId.toString() !== filterStudentId) return false;
      if (filterClassId !== 'all' && student?.classId.toString() !== filterClassId) return false;
      return true;
    });
  }, [reportCards, students, filterStudentId, filterClassId]);

  const resetForm = () => {
    setFormData({
      studentId: '',
      teacherId: '',
      subjects: [{ subject: '', marks: '' }],
      grade: '',
      teacherRemarks: '',
    });
  };

  const handleAddSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { subject: '', marks: '' }],
    }));
  };

  const handleRemoveSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };

  const handleSubjectChange = (index: number, field: 'subject' | 'marks', value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((sub, i) => 
        i === index ? { ...sub, [field]: value } : sub
      ),
    }));
  };

  const calculateTotalMarks = () => {
    return formData.subjects.reduce((sum, sub) => sum + (parseInt(sub.marks) || 0), 0);
  };

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.teacherId || !formData.grade || formData.subjects.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const subjectMarks: SubjectMarks[] = formData.subjects
      .filter(sub => sub.subject && sub.marks)
      .map(sub => ({
        subject: sub.subject,
        marks: BigInt(parseInt(sub.marks)),
      }));

    if (subjectMarks.length === 0) {
      toast.error('Please add at least one subject with marks');
      return;
    }

    const totalMarks = BigInt(calculateTotalMarks());
    const evaluationDate = BigInt(Date.now() * 1000000); // Convert to nanoseconds

    try {
      if (editingCard) {
        await updateReportCard.mutateAsync({
          id: editingCard.id,
          studentId: BigInt(formData.studentId),
          teacherId: BigInt(formData.teacherId),
          subjectMarks,
          totalMarks,
          grade: formData.grade,
          teacherRemarks: formData.teacherRemarks,
          evaluationDate,
        });
        toast.success('Report card updated successfully');
        setIsEditModalOpen(false);
      } else {
        await addReportCard.mutateAsync({
          studentId: BigInt(formData.studentId),
          teacherId: BigInt(formData.teacherId),
          subjectMarks,
          totalMarks,
          grade: formData.grade,
          teacherRemarks: formData.teacherRemarks,
          evaluationDate,
        });
        toast.success('Report card created successfully');
        setIsAddModalOpen(false);
      }
      resetForm();
      setEditingCard(null);
    } catch (error) {
      console.error('Error saving report card:', error);
      toast.error('Failed to save report card');
    }
  };

  const handleEdit = (card: ReportCard) => {
    setEditingCard(card);
    setFormData({
      studentId: card.studentId.toString(),
      teacherId: card.teacherId.toString(),
      subjects: card.subjectMarks.map(sm => ({
        subject: sm.subject,
        marks: sm.marks.toString(),
      })),
      grade: card.grade,
      teacherRemarks: card.teacherRemarks,
    });
    setIsEditModalOpen(true);
  };

  const getGradeBadgeColor = (grade: string) => {
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper === 'A+' || gradeUpper === 'A') return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
    if (gradeUpper === 'B+' || gradeUpper === 'B') return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
    if (gradeUpper === 'C+' || gradeUpper === 'C') return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white';
    return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="hero-banner overflow-hidden rounded-2xl shadow-premium-lg">
        <div 
          className="relative h-48 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/report-card-template.dim_400x300.png)' }}
        >
          <div className="hero-content absolute inset-0 flex items-center justify-center text-center p-6">
            <div className="animate-float">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Award className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h2 className="text-4xl font-bold text-white drop-shadow-lg">Report Cards</h2>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/90 text-lg font-medium drop-shadow-md">
                Create and manage student report cards with grades and remarks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Report Card
        </Button>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStudentId} onValueChange={setFilterStudentId}>
              <SelectTrigger className="w-[180px] glass-effect border-2">
                <SelectValue placeholder="Filter by Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id.toString()} value={student.id.toString()}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={filterClassId} onValueChange={setFilterClassId}>
            <SelectTrigger className="w-[180px] glass-effect border-2">
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(classId => (
                <SelectItem key={classId} value={classId}>
                  Class {classId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterStudentId !== 'all' || filterClassId !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterStudentId('all');
                setFilterClassId('all');
              }}
              className="glass-effect border-2"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Report Cards Grid */}
      {filteredReportCards.length === 0 ? (
        <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg mb-4">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Report Cards Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {filterStudentId !== 'all' || filterClassId !== 'all'
                ? 'No report cards match your filters. Try adjusting your search criteria.'
                : 'Start by creating your first report card for a student.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReportCards.map(card => {
            const student = students.find(s => s.id === card.studentId);
            const teacher = teachers.find(t => t.id === card.teacherId);
            
            return (
              <Card key={card.id.toString()} className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium card-hover overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {student?.name || 'Unknown Student'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Class {student?.classId.toString() || 'N/A'}
                      </p>
                    </div>
                    <Badge className={`${getGradeBadgeColor(card.grade)} shadow-lg`}>
                      Grade: {card.grade}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      Subject Marks
                    </h4>
                    <div className="space-y-1">
                      {card.subjectMarks.map((sm, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sm.subject}</span>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{sm.marks.toString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Total Marks</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">{card.totalMarks.toString()}</span>
                    </div>
                  </div>

                  {card.teacherRemarks && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Teacher's Remarks</h4>
                      <p className="text-sm text-muted-foreground italic p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                        "{card.teacherRemarks}"
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-muted-foreground">
                      Teacher: <span className="font-medium">{teacher?.name || 'Unknown'}</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => handleEdit(card)}
                    variant="outline"
                    className="w-full glass-effect hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 border-2"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Report Card
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingCard(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto solid-modal-content border-2 border-blue-200/50 dark:border-blue-800/50 shadow-premium-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              {editingCard ? 'Edit Report Card' : 'Add New Report Card'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {editingCard ? 'Update the report card details below' : 'Fill in the details to create a new report card'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student" className="font-semibold">Student *</Label>
                <Select value={formData.studentId} onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: value }))}>
                  <SelectTrigger id="student" className="glass-effect border-2">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id.toString()} value={student.id.toString()}>
                        {student.name} (Class {student.classId.toString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher" className="font-semibold">Teacher *</Label>
                <Select value={formData.teacherId} onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value }))}>
                  <SelectTrigger id="teacher" className="glass-effect border-2">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id.toString()} value={teacher.id.toString()}>
                        {teacher.name} ({teacher.subject})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Subject Marks *</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSubject}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subject
                </Button>
              </div>

              {formData.subjects.map((subject, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Subject name"
                      value={subject.subject}
                      onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                      className="glass-effect border-2"
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Input
                      type="number"
                      placeholder="Marks"
                      value={subject.marks}
                      onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                      className="glass-effect border-2"
                    />
                  </div>
                  {formData.subjects.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveSubject(index)}
                      className="glass-effect border-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Total Marks: <span className="text-blue-600 dark:text-blue-400">{calculateTotalMarks()}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="font-semibold">Grade *</Label>
              <Input
                id="grade"
                placeholder="e.g., A+, A, B+, B, C"
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="glass-effect border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="font-semibold">Teacher's Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter remarks about student's performance..."
                value={formData.teacherRemarks}
                onChange={(e) => setFormData(prev => ({ ...prev, teacherRemarks: e.target.value }))}
                rows={4}
                className="glass-effect border-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingCard(null);
                resetForm();
              }}
              className="glass-effect border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addReportCard.isPending || updateReportCard.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              {addReportCard.isPending || updateReportCard.isPending ? 'Saving...' : editingCard ? 'Update Report Card' : 'Create Report Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
