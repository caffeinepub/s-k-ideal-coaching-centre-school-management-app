import { useState } from 'react';
import { useGetAllFeeRecords, useGetAllStudents, useAddFeeRecord, useUpdateFeeRecord } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Search, DollarSign, CheckCircle, XCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { FeeRecord } from '../backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { formatINR } from '../lib/utils';

export default function FeesSection() {
  const { data: feeRecords = [], isLoading: feesLoading } = useGetAllFeeRecords();
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const isLoading = feesLoading || studentsLoading;

  const getStudentName = (studentId: bigint) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || `Student ${studentId}`;
  };

  const filteredRecords = feeRecords.filter((record) => {
    const studentName = getStudentName(record.studentId);
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'paid' && record.isPaid) ||
                         (filterStatus === 'unpaid' && !record.isPaid);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fee Management</h2>
          <p className="text-muted-foreground">Track and manage student fee payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md solid-modal-content border-2 border-green-200/50 dark:border-green-800/50 shadow-premium-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Add Fee Record</DialogTitle>
            </DialogHeader>
            <FeeForm students={students} onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-effect border-gray-200/50 dark:border-gray-800/50 shadow-premium">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-green-400 dark:focus:border-green-600 transition-colors"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] border-2">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <DollarSign className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-muted-foreground font-medium">No fee records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">Student</TableHead>
                    <TableHead className="font-bold">Class</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, index) => (
                    <TableRow key={index} className="hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors">
                      <TableCell className="font-semibold">{getStudentName(record.studentId)}</TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                          Class {record.classId.toString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-green-600 dark:text-green-400">{formatINR(record.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={record.isPaid ? 'default' : 'destructive'} className="gap-1 shadow-md">
                          {record.isPaid ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Paid
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Unpaid
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <EditFeeButton record={record} index={index} students={students} />
                          <MarkPaidButton record={record} index={index} />
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

function FeeForm({ students, onSuccess }: { students: any[]; onSuccess: () => void }) {
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const addFeeRecord = useAddFeeRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const student = students.find(s => s.id.toString() === studentId);
    if (!student) {
      toast.error('Student not found');
      return;
    }

    try {
      await addFeeRecord.mutateAsync({
        studentId: BigInt(studentId),
        classId: student.classId,
        amount: BigInt(Math.round(parseFloat(amount) * 100)),
        isPaid,
      });
      toast.success('Fee record added successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add fee record');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student" className="font-semibold">Student *</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="border-2">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id.toString()} value={student.id.toString()}>
                {student.name} (Class {student.classId.toString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount" className="font-semibold">Amount (INR) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="border-2 focus:border-green-400 dark:focus:border-green-600"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status" className="font-semibold">Payment Status</Label>
        <Select value={isPaid ? 'paid' : 'unpaid'} onValueChange={(v) => setIsPaid(v === 'paid')}>
          <SelectTrigger className="border-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg h-12 text-base font-semibold" 
        disabled={addFeeRecord.isPending}
      >
        {addFeeRecord.isPending ? 'Adding...' : 'Add Fee Record'}
      </Button>
    </form>
  );
}

function EditFeeButton({ record, index, students }: { record: FeeRecord; index: number; students: any[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md solid-modal-content border-2 border-green-200/50 dark:border-green-800/50 shadow-premium-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Edit Fee Details</DialogTitle>
        </DialogHeader>
        <EditFeeForm 
          record={record} 
          recordId={index} 
          students={students} 
          onSuccess={() => setIsEditDialogOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}

function EditFeeForm({ 
  record, 
  recordId, 
  students, 
  onSuccess 
}: { 
  record: FeeRecord; 
  recordId: number; 
  students: any[]; 
  onSuccess: () => void 
}) {
  const [studentId, setStudentId] = useState(record.studentId.toString());
  const [amount, setAmount] = useState((Number(record.amount) / 100).toFixed(2));
  const [isPaid, setIsPaid] = useState(record.isPaid);

  const updateFeeRecord = useUpdateFeeRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const student = students.find(s => s.id.toString() === studentId);
    if (!student) {
      toast.error('Student not found');
      return;
    }

    try {
      await updateFeeRecord.mutateAsync({
        id: BigInt(recordId),
        studentId: BigInt(studentId),
        classId: student.classId,
        amount: BigInt(Math.round(parseFloat(amount) * 100)),
        isPaid,
      });
      toast.success('Fee record updated successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update fee record');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-student" className="font-semibold">Student *</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="border-2">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id.toString()} value={student.id.toString()}>
                {student.name} (Class {student.classId.toString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-amount" className="font-semibold">Amount (INR) *</Label>
        <Input
          id="edit-amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="border-2 focus:border-green-400 dark:focus:border-green-600"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-status" className="font-semibold">Payment Status</Label>
        <Select value={isPaid ? 'paid' : 'unpaid'} onValueChange={(v) => setIsPaid(v === 'paid')}>
          <SelectTrigger className="border-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg h-12 text-base font-semibold" 
        disabled={updateFeeRecord.isPending}
      >
        {updateFeeRecord.isPending ? 'Updating...' : 'Update Fee Record'}
      </Button>
    </form>
  );
}

function MarkPaidButton({ record, index }: { record: FeeRecord; index: number }) {
  const updateFeeRecord = useUpdateFeeRecord();

  const handleMarkPaid = async () => {
    try {
      await updateFeeRecord.mutateAsync({
        id: BigInt(index),
        studentId: record.studentId,
        classId: record.classId,
        amount: record.amount,
        isPaid: true,
      });
      toast.success('Fee marked as paid!');
    } catch (error) {
      toast.error('Failed to update fee status');
      console.error(error);
    }
  };

  if (record.isPaid) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkPaid}
      disabled={updateFeeRecord.isPending}
      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
    >
      {updateFeeRecord.isPending ? 'Updating...' : 'Mark Paid'}
    </Button>
  );
}
