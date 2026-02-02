import { useState } from 'react';
import { useGetAllTeachers, useAddTeacherWithCredentials, useUpdateTeacher, useDeleteTeacher, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Edit, Search, UserCheck, Trash2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { TeacherProfile } from '../backend';
import { Skeleton } from './ui/skeleton';
import { Checkbox } from './ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

export default function TeachersSection() {
  const { data: teachers = [], isLoading } = useGetAllTeachers();
  const { data: userProfile } = useGetCallerUserProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);

  const isAdmin = userProfile?.role === 'admin';

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-premium">
            <UserCheck className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Access Restricted</h3>
          <p className="text-muted-foreground font-medium">Only administrators can manage teacher accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="hero-banner overflow-hidden rounded-2xl shadow-premium-lg">
        <div 
          className="relative h-40 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/teacher-avatar.dim_100x100.jpg)' }}
        >
          <div className="hero-content absolute inset-0 flex items-center justify-between p-6">
            <div className="animate-float">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Teacher Management</h2>
              </div>
              <p className="text-white/90 font-medium drop-shadow-md">Manage teacher profiles, credentials, and class assignments</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-indigo-600 hover:bg-white/90 shadow-premium animate-float">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Add New Teacher</DialogTitle>
                </DialogHeader>
                <TeacherForm onSuccess={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, subject, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 focus:border-indigo-400 dark:focus:border-indigo-600 transition-colors"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <UserCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-muted-foreground font-medium">No teachers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Username</TableHead>
                    <TableHead className="font-bold">Subject</TableHead>
                    <TableHead className="font-bold">Assigned Classes</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id.toString()} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors">
                      <TableCell className="font-semibold">{teacher.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 px-3 py-1.5 rounded-lg font-mono font-semibold border border-indigo-200 dark:border-indigo-800">
                          {teacher.uniqueId || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">{teacher.subject}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.assignedClasses.length === 0 ? (
                            <span className="text-sm text-muted-foreground">No classes</span>
                          ) : (
                            teacher.assignedClasses.map((classId) => (
                              <Badge 
                                key={classId.toString()} 
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md"
                              >
                                Class {classId.toString()}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setEditingTeacher(teacher)}
                                className="hover:bg-indigo-100 dark:hover:bg-indigo-950/30 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium-lg">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Edit Teacher</DialogTitle>
                              </DialogHeader>
                              <TeacherForm teacher={editingTeacher} onSuccess={() => setEditingTeacher(null)} />
                            </DialogContent>
                          </Dialog>
                          <DeleteTeacherButton teacher={teacher} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteTeacherButton({ teacher }: { teacher: TeacherProfile }) {
  const deleteTeacher = useDeleteTeacher();

  const handleDelete = async () => {
    try {
      await deleteTeacher.mutateAsync(teacher.id);
      toast.success('Teacher deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete teacher');
      console.error(error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Delete Teacher Account</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete <strong>{teacher.name}</strong>? This will remove their account and they will no longer be able to log in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg"
            disabled={deleteTeacher.isPending}
          >
            {deleteTeacher.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TeacherForm({ teacher, onSuccess }: { teacher?: TeacherProfile | null; onSuccess: () => void }) {
  const [name, setName] = useState(teacher?.name || '');
  const [subject, setSubject] = useState(teacher?.subject || '');
  const [uniqueId, setUniqueId] = useState(teacher?.uniqueId || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<Set<number>>(
    new Set(teacher?.assignedClasses.map(c => Number(c)) || [])
  );

  const addTeacher = useAddTeacherWithCredentials();
  const updateTeacher = useUpdateTeacher();

  const handleClassToggle = (classId: number) => {
    const newSelected = new Set(selectedClasses);
    if (newSelected.has(classId)) {
      newSelected.delete(classId);
    } else {
      newSelected.add(classId);
    }
    setSelectedClasses(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !subject.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!teacher && (!uniqueId.trim() || !password.trim())) {
      toast.error('Username and password are required for new teachers');
      return;
    }

    const assignedClasses = Array.from(selectedClasses).map(c => BigInt(c));

    try {
      if (teacher) {
        await updateTeacher.mutateAsync({
          id: teacher.id,
          name: name.trim(),
          subject: subject.trim(),
          assignedClasses,
        });
        toast.success('Teacher updated successfully!');
      } else {
        await addTeacher.mutateAsync({
          name: name.trim(),
          subject: subject.trim(),
          assignedClasses,
          uniqueId: uniqueId.trim(),
          password: password.trim(),
        });
        toast.success('Teacher account created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        toast.error('A teacher with this username already exists');
      } else {
        toast.error('Failed to save teacher');
      }
      console.error(error);
    }
  };

  const isPending = addTeacher.isPending || updateTeacher.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="font-semibold">Teacher Name *</Label>
        <Input
          id="name"
          placeholder="Enter teacher name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-2 focus:border-indigo-400 dark:focus:border-indigo-600"
        />
      </div>
      
      {!teacher && (
        <>
          <div className="space-y-2">
            <Label htmlFor="uniqueId" className="font-semibold">Username *</Label>
            <Input
              id="uniqueId"
              placeholder="e.g., teacher123"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              required
              className="border-2 focus:border-indigo-400 dark:focus:border-indigo-600"
            />
            <p className="text-xs text-muted-foreground font-medium">This will be used for login</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 focus:border-indigo-400 dark:focus:border-indigo-600 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Minimum 6 characters recommended</p>
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="subject" className="font-semibold">Subject *</Label>
        <Input
          id="subject"
          placeholder="e.g., Mathematics, Science"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="border-2 focus:border-indigo-400 dark:focus:border-indigo-600"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="font-semibold">Assigned Classes</Label>
        <div className="grid grid-cols-4 gap-3 p-4 border-2 rounded-xl max-h-48 overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((classId) => (
            <div key={classId} className="flex items-center space-x-2">
              <Checkbox
                id={`class-${classId}`}
                checked={selectedClasses.has(classId)}
                onCheckedChange={() => handleClassToggle(classId)}
                className="border-2"
              />
              <label
                htmlFor={`class-${classId}`}
                className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {classId}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg h-12 text-base font-semibold" 
        disabled={isPending}
      >
        {isPending ? 'Saving...' : teacher ? 'Update Teacher' : 'Create Teacher Account'}
      </Button>
    </form>
  );
}

