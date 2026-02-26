import React, { useState } from 'react';
import {
  useGetAllStudents,
  useAddStudent,
  useUpdateStudent,
  useDeleteStudent,
} from '../hooks/useQueries';
import type { Student } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Phone,
  BookOpen,
  User,
} from 'lucide-react';

interface StudentFormData {
  name: string;
  classId: string;
  parentContact: string;
  admissionStatus: boolean;
  photoUrl: string | null;
}

const defaultForm: StudentFormData = {
  name: '',
  classId: '1',
  parentContact: '',
  admissionStatus: true,
  photoUrl: null,
};

interface StudentsSectionProps {
  enabled?: boolean;
}

export default function StudentsSection({ enabled = true }: StudentsSectionProps) {
  const { data: students = [], isLoading, error, refetch } = useGetAllStudents(enabled);
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [form, setForm] = useState<StudentFormData>(defaultForm);
  const [formError, setFormError] = useState('');

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.classId.toString().includes(search)
  );

  const openAdd = () => {
    setEditingStudent(null);
    setForm(defaultForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      classId: student.classId.toString(),
      parentContact: student.parentContact,
      admissionStatus: student.admissionStatus,
      photoUrl: student.photoUrl ?? null,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.classId.trim()) { setFormError('Class is required'); return; }

    try {
      if (editingStudent) {
        await updateStudent.mutateAsync({
          id: editingStudent.id,
          name: form.name.trim(),
          classId: BigInt(form.classId),
          parentContact: form.parentContact.trim(),
          admissionStatus: form.admissionStatus,
          photoUrl: form.photoUrl,
        });
      } else {
        await addStudent.mutateAsync({
          name: form.name.trim(),
          classId: BigInt(form.classId),
          parentContact: form.parentContact.trim(),
          admissionStatus: form.admissionStatus,
          photoUrl: form.photoUrl,
        });
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteStudent.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      setDeleteId(null);
    }
  };

  const isPending = addStudent.isPending || updateStudent.isPending;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Header */}
      <div className="rounded-2xl p-6 shadow-navy" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Student Management</h2>
              <p className="text-blue-200 text-sm font-medium">{students.length} students enrolled</p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#1e3a8a', border: 'none' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name or class..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-white border-border font-medium"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Failed to load students.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="premium-card p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}>
            <Users className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-display font-bold text-foreground text-xl mb-2">
            {search ? 'No students found' : 'No students yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {search ? 'Try a different search term.' : 'Add your first student to get started.'}
          </p>
          {!search && (
            <Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', color: 'white', border: 'none' }}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Student
            </Button>
          )}
        </div>
      )}

      {/* Student List */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(student => (
            <div key={student.id.toString()} className="premium-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b5fc0 100%)' }}>
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-foreground text-base truncate">{student.name}</h4>
                  <Badge
                    className="text-xs font-bold shrink-0"
                    style={student.admissionStatus
                      ? { background: '#059669', color: 'white', border: 'none' }
                      : { background: '#dc2626', color: 'white', border: 'none' }
                    }
                  >
                    {student.admissionStatus ? (
                      <><UserCheck className="w-3 h-3 mr-1" />Admitted</>
                    ) : (
                      <><UserX className="w-3 h-3 mr-1" />Inactive</>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Class {student.classId.toString()}
                  </span>
                  {student.parentContact && (
                    <span className="text-muted-foreground text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {student.parentContact}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(student)}
                  className="font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(student.id)}
                  className="font-semibold border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg bg-white border border-border shadow-premium-xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}>
                <Users className="w-4 h-4 text-white" />
              </div>
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: '#1e3a8a' }} />
                Student Information
              </h3>
              <div className="space-y-1">
                <Label htmlFor="name" className="font-semibold text-foreground">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter student's full name"
                  className="bg-white border-gray-300 font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="classId" className="font-semibold text-foreground">Class *</Label>
                <Input
                  id="classId"
                  type="number"
                  min="1"
                  max="12"
                  value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  placeholder="Enter class number (1-12)"
                  className="bg-white border-gray-300 font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="photoUrl" className="font-semibold text-foreground">Photo URL (optional)</Label>
                <Input
                  id="photoUrl"
                  value={form.photoUrl ?? ''}
                  onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value || null }))}
                  placeholder="https://example.com/photo.jpg"
                  className="bg-white border-gray-300 font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="admissionStatus"
                  checked={form.admissionStatus}
                  onChange={e => setForm(f => ({ ...f, admissionStatus: e.target.checked }))}
                  className="w-4 h-4 rounded accent-blue-700"
                />
                <Label htmlFor="admissionStatus" className="font-semibold text-foreground cursor-pointer">
                  Active / Admitted
                </Label>
              </div>
            </div>

            {/* Parent Details - Solid background, fully opaque */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: '#059669' }} />
                Parent / Guardian Details
              </h3>
              <div className="space-y-1">
                <Label htmlFor="parentContact" className="font-semibold text-foreground">Parent Contact Number</Label>
                <Input
                  id="parentContact"
                  value={form.parentContact}
                  onChange={e => setForm(f => ({ ...f, parentContact: e.target.value }))}
                  placeholder="Enter parent's phone number"
                  className="bg-white border-gray-300 font-medium"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
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
                style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', color: 'white', border: 'none' }}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingStudent ? 'Saving...' : 'Adding...'}</>
                ) : (
                  editingStudent ? 'Save Changes' : 'Add Student'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white border border-border shadow-premium-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold text-foreground">Delete Student?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. The student record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteStudent.isPending}
              className="font-bold"
              style={{ background: '#dc2626', color: 'white', border: 'none' }}
            >
              {deleteStudent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
