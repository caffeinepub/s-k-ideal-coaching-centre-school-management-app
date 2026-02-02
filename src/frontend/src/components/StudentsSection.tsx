import { useState } from 'react';
import { useGetAllStudents, useAddStudent, useUpdateStudent, useDeleteStudent } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Edit, Search, Users, Trash2, Upload, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Student } from '../backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function StudentsSection() {
  const { data: students = [], isLoading } = useGetAllStudents();
  const deleteStudent = useDeleteStudent();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentContact.includes(searchTerm);
    const matchesClass = filterClass === 'all' || student.classId.toString() === filterClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = Array.from(new Set(students.map(s => s.classId.toString()))).sort();

  const handleDeleteStudent = async (student: Student) => {
    try {
      await deleteStudent.mutateAsync(student.id);
      toast.success(`Student "${student.name}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete student');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="hero-banner overflow-hidden rounded-2xl shadow-premium-lg">
        <div 
          className="relative h-40 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/student-avatar.dim_100x100.jpg)' }}
        >
          <div className="hero-content absolute inset-0 flex items-center justify-between p-6">
            <div className="animate-float">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Student Management</h2>
              </div>
              <p className="text-white/90 font-medium drop-shadow-md">Add, edit, and view student profiles</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-premium animate-float">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto solid-modal-content border-2 border-blue-200/50 dark:border-blue-800/50 shadow-premium-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Add New Student</DialogTitle>
                </DialogHeader>
                <StudentForm onSuccess={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-full sm:w-[180px] border-2">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((classId) => (
                  <SelectItem key={classId} value={classId}>
                    Class {classId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-muted-foreground font-medium">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">Photo</TableHead>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Class</TableHead>
                    <TableHead className="font-bold">Parent Contact</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id.toString()} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                      <TableCell>
                        <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800 shadow-md">
                          <AvatarImage src={student.photoUrl || undefined} alt={student.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                            {student.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-semibold">{student.name}</TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
                          Class {student.classId.toString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{student.parentContact}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={student.admissionStatus ? 'default' : 'secondary'}
                          className={student.admissionStatus ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md' : ''}
                        >
                          {student.admissionStatus ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setEditingStudent(student)}
                                className="hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto solid-modal-content border-2 border-blue-200/50 dark:border-blue-800/50 shadow-premium-lg">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Edit Student</DialogTitle>
                              </DialogHeader>
                              <StudentForm student={editingStudent} onSuccess={() => setEditingStudent(null)} />
                            </DialogContent>
                          </Dialog>
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
                            <AlertDialogContent className="solid-modal-content border-2 border-red-200/50 dark:border-red-800/50 shadow-premium-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Delete Student</AlertDialogTitle>
                                <AlertDialogDescription className="text-base">
                                  Are you sure you want to delete <strong>{student.name}</strong>? This action cannot be undone and will remove all associated records including attendance and fee records.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStudent(student)}
                                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg"
                                  disabled={deleteStudent.isPending}
                                >
                                  {deleteStudent.isPending ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

function StudentForm({ student, onSuccess }: { student?: Student | null; onSuccess: () => void }) {
  const [name, setName] = useState(student?.name || '');
  const [classId, setClassId] = useState(student?.classId.toString() || '1');
  const [parentContact, setParentContact] = useState(student?.parentContact || '');
  const [admissionStatus, setAdmissionStatus] = useState(student?.admissionStatus ?? true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(student?.photoUrl || null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(student?.photoUrl || null);
    setUploadProgress(0);
  };

  const uploadImageToBlob = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !parentContact.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsUploading(true);
      let photoUrl: string | null = student?.photoUrl || null;

      if (photoFile) {
        setUploadProgress(30);
        photoUrl = await uploadImageToBlob(photoFile);
        setUploadProgress(100);
      }

      if (student) {
        await updateStudent.mutateAsync({
          id: student.id,
          name: name.trim(),
          classId: BigInt(classId),
          parentContact: parentContact.trim(),
          admissionStatus,
          photoUrl,
        });
        toast.success('Student updated successfully!');
      } else {
        await addStudent.mutateAsync({
          name: name.trim(),
          classId: BigInt(classId),
          parentContact: parentContact.trim(),
          admissionStatus,
          photoUrl,
        });
        toast.success('Student added successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save student');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isPending = addStudent.isPending || updateStudent.isPending || isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="photo" className="font-semibold">Student Photo</Label>
        <div className="flex flex-col items-center gap-4">
          {photoPreview ? (
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-blue-200 dark:border-blue-800 shadow-premium">
                <AvatarImage src={photoPreview} alt="Student photo preview" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl font-bold">
                  {name.charAt(0).toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg"
                onClick={removePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-32 h-32 border-4 border-dashed border-blue-300 dark:border-blue-700 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-inner">
              <Upload className="w-10 h-10 text-blue-400" />
            </div>
          )}
          <div className="w-full">
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="cursor-pointer border-2 focus:border-blue-400 dark:focus:border-blue-600"
            />
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Upload a photo (max 5MB, JPG, PNG, or GIF)
            </p>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-muted-foreground mb-2 font-semibold">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300 shimmer"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name" className="font-semibold">Student Name *</Label>
        <Input
          id="name"
          placeholder="Enter student name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-2 focus:border-blue-400 dark:focus:border-blue-600"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="classId" className="font-semibold">Class *</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="border-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
              <SelectItem key={c} value={c.toString()}>
                Class {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="parentContact" className="font-semibold">Parent Contact *</Label>
        <Input
          id="parentContact"
          placeholder="Phone or email"
          value={parentContact}
          onChange={(e) => setParentContact(e.target.value)}
          required
          className="border-2 focus:border-blue-400 dark:focus:border-blue-600"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status" className="font-semibold">Admission Status</Label>
        <Select value={admissionStatus ? 'active' : 'inactive'} onValueChange={(v) => setAdmissionStatus(v === 'active')}>
          <SelectTrigger className="border-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg h-12 text-base font-semibold" 
        disabled={isPending}
      >
        {isPending ? (isUploading ? `Uploading... ${uploadProgress}%` : 'Saving...') : student ? 'Update Student' : 'Add Student'}
      </Button>
    </form>
  );
}
