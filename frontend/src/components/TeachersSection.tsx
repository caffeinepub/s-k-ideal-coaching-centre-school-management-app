import React, { useState } from 'react';
import {
  useGetAllTeachers,
  useAddTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from '../hooks/useQueries';
import type { TeacherProfile } from '../backend';
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
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  User,
  Key,
  Hash,
  GraduationCap,
} from 'lucide-react';

interface TeacherFormData {
  name: string;
  subject: string;
  assignedClasses: string;
  uniqueId: string;
  password: string;
}

const defaultForm: TeacherFormData = {
  name: '',
  subject: '',
  assignedClasses: '',
  uniqueId: '',
  password: '',
};

interface TeachersSectionProps {
  enabled?: boolean;
}

export default function TeachersSection({ enabled = true }: TeachersSectionProps) {
  const { data: teachers = [], isLoading, error, refetch } = useGetAllTeachers(enabled);
  const addTeacher = useAddTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [form, setForm] = useState<TeacherFormData>(defaultForm);
  const [formError, setFormError] = useState('');

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.uniqueId.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingTeacher(null);
    setForm(defaultForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (teacher: TeacherProfile) => {
    setEditingTeacher(teacher);
    setForm({
      name: teacher.name,
      subject: teacher.subject,
      assignedClasses: teacher.assignedClasses.map(c => c.toString()).join(', '),
      uniqueId: teacher.uniqueId,
      password: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const parseClasses = (str: string): bigint[] => {
    return str.split(',').map(s => s.trim()).filter(Boolean).map(s => BigInt(s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.subject.trim()) { setFormError('Subject is required'); return; }
    if (!editingTeacher && !form.uniqueId.trim()) { setFormError('Unique ID is required'); return; }
    if (!editingTeacher && !form.password.trim()) { setFormError('Password is required'); return; }

    try {
      if (editingTeacher) {
        await updateTeacher.mutateAsync({
          id: editingTeacher.id,
          name: form.name.trim(),
          subject: form.subject.trim(),
          assignedClasses: parseClasses(form.assignedClasses),
        });
      } else {
        await addTeacher.mutateAsync({
          name: form.name.trim(),
          subject: form.subject.trim(),
          assignedClasses: parseClasses(form.assignedClasses),
          uniqueId: form.uniqueId.trim(),
          password: form.password.trim(),
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
      await deleteTeacher.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      setDeleteId(null);
    }
  };

  const isPending = addTeacher.isPending || updateTeacher.isPending;

  const subjectColors: Record<string, string> = {
    math: '#1e3a8a',
    science: '#047857',
    english: '#7c3aed',
    history: '#b45309',
    geography: '#0369a1',
    physics: '#1e3a8a',
    chemistry: '#047857',
    biology: '#15803d',
  };

  const getSubjectColor = (subject: string) => {
    const key = subject.toLowerCase();
    for (const [k, v] of Object.entries(subjectColors)) {
      if (key.includes(k)) return v;
    }
    return '#1e3a8a';
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Header */}
      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Teacher Management</h2>
              <p className="text-purple-200 text-sm font-medium">{teachers.length} teachers on staff</p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#1e3a8a', border: 'none' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers by name, subject, or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-white border-border font-medium"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Failed to load teachers.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="premium-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-display font-bold text-foreground text-xl mb-2">
            {search ? 'No teachers found' : 'No teachers yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {search ? 'Try a different search term.' : 'Add your first teacher to get started.'}
          </p>
          {!search && (
            <Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', border: 'none' }}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Teacher
            </Button>
          )}
        </div>
      )}

      {/* Teacher Cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(teacher => (
            <div key={teacher.id.toString()} className="premium-card p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: `linear-gradient(135deg, ${getSubjectColor(teacher.subject)}, ${getSubjectColor(teacher.subject)}cc)` }}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground text-base truncate">{teacher.name}</h4>
                  <Badge
                    className="text-xs font-bold mt-1"
                    style={{ background: getSubjectColor(teacher.subject), color: 'white', border: 'none' }}
                  >
                    {teacher.subject}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-medium">ID:</span>
                  <span className="font-bold text-foreground font-mono">{teacher.uniqueId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-medium">Classes:</span>
                  <span className="font-bold text-foreground">
                    {teacher.assignedClasses.length > 0
                      ? teacher.assignedClasses.map(c => `Class ${c}`).join(', ')
                      : 'None assigned'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(teacher)}
                  className="flex-1 font-semibold border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(teacher.id)}
                  className="flex-1 font-semibold border-red-200 text-red-600 hover:bg-red-50"
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: '#7c3aed' }} />
                Teacher Information
              </h3>
              <div className="space-y-1">
                <Label htmlFor="teacherName" className="font-semibold text-foreground">Full Name *</Label>
                <Input
                  id="teacherName"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter teacher's full name"
                  className="bg-white border-gray-300 font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="subject" className="font-semibold text-foreground">Subject *</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g., Mathematics, Science"
                  className="bg-white border-gray-300 font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="assignedClasses" className="font-semibold text-foreground">Assigned Classes</Label>
                <Input
                  id="assignedClasses"
                  value={form.assignedClasses}
                  onChange={e => setForm(f => ({ ...f, assignedClasses: e.target.value }))}
                  placeholder="e.g., 1, 2, 3 (comma separated)"
                  className="bg-white border-gray-300 font-medium"
                />
              </div>
            </div>

            {!editingTeacher && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                  <Key className="w-4 h-4" style={{ color: '#059669' }} />
                  Login Credentials
                </h3>
                <div className="space-y-1">
                  <Label htmlFor="uniqueId" className="font-semibold text-foreground">Unique ID *</Label>
                  <Input
                    id="uniqueId"
                    value={form.uniqueId}
                    onChange={e => setForm(f => ({ ...f, uniqueId: e.target.value }))}
                    placeholder="e.g., TCH001"
                    className="bg-white border-gray-300 font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="font-semibold text-foreground">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter secure password"
                    className="bg-white border-gray-300 font-medium"
                    required
                  />
                </div>
              </div>
            )}

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
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', border: 'none' }}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingTeacher ? 'Saving...' : 'Adding...'}</>
                ) : (
                  editingTeacher ? 'Save Changes' : 'Add Teacher'
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
            <AlertDialogTitle className="font-display font-bold text-foreground">Delete Teacher?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. The teacher record and their credentials will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteTeacher.isPending}
              className="font-bold"
              style={{ background: '#dc2626', color: 'white', border: 'none' }}
            >
              {deleteTeacher.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
