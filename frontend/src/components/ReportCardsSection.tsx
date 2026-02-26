import React, { useState } from 'react';
import {
  useGetAllReportCards,
  useGetAllStudents,
  useGetAllTeachers,
  useAddReportCard,
  useUpdateReportCard,
} from '../hooks/useQueries';
import type { ReportCard, SubjectMarks } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Loader2,
  AlertCircle,
  Award,
  Trash2,
  BookOpen,
} from 'lucide-react';

interface SubjectMarksForm {
  subject: string;
  marks: string;
}

interface ReportCardFormData {
  studentId: string;
  teacherId: string;
  subjectMarks: SubjectMarksForm[];
  grade: string;
  teacherRemarks: string;
  evaluationDate: string;
}

const defaultForm: ReportCardFormData = {
  studentId: '',
  teacherId: '',
  subjectMarks: [{ subject: '', marks: '' }],
  grade: 'A',
  teacherRemarks: '',
  evaluationDate: new Date().toISOString().split('T')[0],
};

const GRADE_OPTIONS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

interface ReportCardsSectionProps {
  enabled?: boolean;
}

const gradeStyleMap: Record<string, React.CSSProperties> = {
  'A+': { background: '#047857', color: 'white', border: 'none' },
  'A':  { background: '#059669', color: 'white', border: 'none' },
  'B+': { background: '#0369a1', color: 'white', border: 'none' },
  'B':  { background: '#1d4ed8', color: 'white', border: 'none' },
  'C+': { background: '#b45309', color: 'white', border: 'none' },
  'C':  { background: '#d97706', color: 'white', border: 'none' },
  'D':  { background: '#dc2626', color: 'white', border: 'none' },
  'F':  { background: '#b91c1c', color: 'white', border: 'none' },
};

const getGradeStyle = (grade: string): React.CSSProperties =>
  gradeStyleMap[grade] ?? { background: '#1e3a8a', color: 'white', border: 'none' };

export default function ReportCardsSection({ enabled = true }: ReportCardsSectionProps) {
  const { data: reportCards = [], isLoading, error, refetch } = useGetAllReportCards(enabled);
  const { data: students = [] } = useGetAllStudents(enabled);
  const { data: teachers = [] } = useGetAllTeachers(enabled);
  const addReportCard = useAddReportCard();
  const updateReportCard = useUpdateReportCard();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<ReportCard | null>(null);
  const [form, setForm] = useState<ReportCardFormData>(defaultForm);
  const [formError, setFormError] = useState('');

  const getStudentName = (id: bigint) => students.find(s => s.id === id)?.name ?? `Student #${id}`;
  const getTeacherName = (id: bigint) => teachers.find(t => t.id === id)?.name ?? `Teacher #${id}`;

  const filtered = reportCards.filter(rc => {
    const sName = getStudentName(rc.studentId).toLowerCase();
    const tName = getTeacherName(rc.teacherId).toLowerCase();
    return (
      sName.includes(search.toLowerCase()) ||
      tName.includes(search.toLowerCase()) ||
      rc.grade.toLowerCase().includes(search.toLowerCase())
    );
  });

  const openAdd = () => {
    setEditingCard(null);
    setForm(defaultForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (card: ReportCard) => {
    setEditingCard(card);
    setForm({
      studentId: card.studentId.toString(),
      teacherId: card.teacherId.toString(),
      subjectMarks: card.subjectMarks.map(sm => ({
        subject: sm.subject,
        marks: sm.marks.toString(),
      })),
      grade: card.grade,
      teacherRemarks: card.teacherRemarks,
      evaluationDate: new Date(Number(card.evaluationDate)).toISOString().split('T')[0],
    });
    setFormError('');
    setShowModal(true);
  };

  const addSubjectRow = () => {
    setForm(f => ({ ...f, subjectMarks: [...f.subjectMarks, { subject: '', marks: '' }] }));
  };

  const removeSubjectRow = (index: number) => {
    setForm(f => ({ ...f, subjectMarks: f.subjectMarks.filter((_, i) => i !== index) }));
  };

  const updateSubjectRow = (index: number, field: 'subject' | 'marks', value: string) => {
    setForm(f => ({
      ...f,
      subjectMarks: f.subjectMarks.map((sm, i) => i === index ? { ...sm, [field]: value } : sm),
    }));
  };

  const computedTotalMarks = form.subjectMarks.reduce(
    (sum, sm) => sum + (parseInt(sm.marks) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.studentId.trim()) { setFormError('Student ID is required'); return; }
    if (!form.teacherId.trim()) { setFormError('Teacher ID is required'); return; }
    if (form.subjectMarks.some(sm => !sm.subject.trim())) {
      setFormError('All subject names are required');
      return;
    }

    const marks: SubjectMarks[] = form.subjectMarks.map(sm => ({
      subject: sm.subject,
      marks: BigInt(parseInt(sm.marks) || 0),
    }));

    try {
      if (editingCard) {
        await updateReportCard.mutateAsync({
          id: editingCard.id,
          studentId: BigInt(form.studentId),
          teacherId: BigInt(form.teacherId),
          subjectMarks: marks,
          totalMarks: BigInt(computedTotalMarks),
          grade: form.grade,
          teacherRemarks: form.teacherRemarks,
          evaluationDate: BigInt(new Date(form.evaluationDate).getTime()),
        });
      } else {
        await addReportCard.mutateAsync({
          studentId: BigInt(form.studentId),
          teacherId: BigInt(form.teacherId),
          subjectMarks: marks,
          totalMarks: BigInt(computedTotalMarks),
          grade: form.grade,
          teacherRemarks: form.teacherRemarks,
          evaluationDate: BigInt(new Date(form.evaluationDate).getTime()),
        });
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.message || 'An error occurred');
    }
  };

  const isPending = addReportCard.isPending || updateReportCard.isPending;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Header */}
      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Report Cards</h2>
              <p className="text-blue-100 text-sm font-medium">{reportCards.length} report cards</p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#1e3a8a', border: 'none' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Report Card
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by student, teacher, or grade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-white border-border font-medium"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Failed to load report cards.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' }}>
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-display font-bold text-foreground text-xl mb-2">
            {search ? 'No report cards found' : 'No report cards yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {search ? 'Try a different search term.' : 'Add your first report card to get started.'}
          </p>
          {!search && (
            <Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)', color: 'white', border: 'none' }}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Report Card
            </Button>
          )}
        </div>
      )}

      {/* Report Cards Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(rc => (
            <div key={rc.id.toString()} className="premium-card p-5 flex flex-col gap-4">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #0369a1, #0284c7)' }}>
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{getStudentName(rc.studentId)}</p>
                    <p className="text-xs text-muted-foreground font-medium">by {getTeacherName(rc.teacherId)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-sm font-extrabold px-3 py-1" style={getGradeStyle(rc.grade)}>
                    {rc.grade}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(rc)}
                    className="p-1.5 h-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Subject Marks */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5">
                {rc.subjectMarks.slice(0, 4).map((sm, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">{sm.subject}</span>
                    <span className="font-bold text-foreground">{sm.marks.toString()}</span>
                  </div>
                ))}
                {rc.subjectMarks.length > 4 && (
                  <p className="text-xs text-muted-foreground font-medium">+{rc.subjectMarks.length - 4} more subjects</p>
                )}
              </div>

              {/* Total & Remarks */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Marks</span>
                <span className="text-lg font-extrabold" style={{ color: '#0369a1' }}>{rc.totalMarks.toString()}</span>
              </div>

              {rc.teacherRemarks && (
                <p className="text-xs text-muted-foreground italic line-clamp-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                  "{rc.teacherRemarks}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg bg-white border border-border shadow-premium-xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' }}>
                <FileText className="w-4 h-4 text-white" />
              </div>
              {editingCard ? 'Edit Report Card' : 'Add Report Card'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <form onSubmit={handleSubmit} className="space-y-5 p-1">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">Basic Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="rcStudentId" className="font-semibold text-foreground text-xs">Student ID *</Label>
                    <Input
                      id="rcStudentId"
                      type="number"
                      min="0"
                      value={form.studentId}
                      onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                      placeholder="Student ID"
                      className="bg-white border-gray-300 font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rcTeacherId" className="font-semibold text-foreground text-xs">Teacher ID *</Label>
                    <Input
                      id="rcTeacherId"
                      type="number"
                      min="0"
                      value={form.teacherId}
                      onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                      placeholder="Teacher ID"
                      className="bg-white border-gray-300 font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="rcGrade" className="font-semibold text-foreground text-xs">Grade *</Label>
                    <select
                      id="rcGrade"
                      value={form.grade}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {GRADE_OPTIONS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rcDate" className="font-semibold text-foreground text-xs">Evaluation Date</Label>
                    <Input
                      id="rcDate"
                      type="date"
                      value={form.evaluationDate}
                      onChange={e => setForm(f => ({ ...f, evaluationDate: e.target.value }))}
                      className="bg-white border-gray-300 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Subject Marks */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                    <BookOpen className="w-4 h-4" style={{ color: '#0369a1' }} />
                    Subject Marks
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubjectRow}
                    className="text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Subject
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.subjectMarks.map((sm, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={sm.subject}
                        onChange={e => updateSubjectRow(i, 'subject', e.target.value)}
                        placeholder="Subject name"
                        className="flex-1 bg-white border-gray-300 font-medium text-sm"
                        required
                      />
                      <Input
                        type="number"
                        min="0"
                        value={sm.marks}
                        onChange={e => updateSubjectRow(i, 'marks', e.target.value)}
                        placeholder="Marks"
                        className="w-20 bg-white border-gray-300 font-medium text-sm"
                        required
                      />
                      {form.subjectMarks.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubjectRow(i)}
                          className="p-1.5 h-auto border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-xs text-muted-foreground font-semibold">Computed Total</span>
                  <span className="font-extrabold text-foreground">{computedTotalMarks}</span>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
                <Label htmlFor="rcRemarks" className="font-bold text-foreground text-sm uppercase tracking-wide">Teacher Remarks</Label>
                <textarea
                  id="rcRemarks"
                  value={form.teacherRemarks}
                  onChange={e => setForm(f => ({ ...f, teacherRemarks: e.target.value }))}
                  rows={3}
                  placeholder="Enter teacher remarks..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isPending}
                  className="font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="font-bold"
                  style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)', color: 'white', border: 'none' }}
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingCard ? 'Saving...' : 'Adding...'}</>
                  ) : (
                    editingCard ? 'Save Changes' : 'Add Report Card'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
