import { useState } from 'react';
import { useGetAllFeeRecords, useGetAllStudents, useAddFeeRecord, useUpdateFeeRecord, useDeleteFeeRecord } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Search, DollarSign, CheckCircle, XCircle, Edit, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';
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

  // Calculate summary statistics
  const totalFees = feeRecords.reduce((sum, record) => sum + Number(record.amount), 0);
  const paidFees = feeRecords.filter(r => r.isPaid).reduce((sum, record) => sum + Number(record.amount), 0);
  const unpaidFees = totalFees - paidFees;
  const paidCount = feeRecords.filter(r => r.isPaid).length;
  const unpaidCount = feeRecords.filter(r => !r.isPaid).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Fee Management
          </h2>
          <p className="text-muted-foreground font-medium">Track and manage student fee payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-premium hover:shadow-premium-lg transition-all duration-300 font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md solid-modal-content border-2 border-green-200 dark:border-green-800 shadow-premium-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Add Fee Record
              </DialogTitle>
            </DialogHeader>
            <FeeForm students={students} onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Statistics Cards */}
      {!isLoading && feeRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="solid-modal-content border-2 border-green-200/70 dark:border-green-800/70 shadow-premium hover:shadow-premium-lg transition-all duration-300 card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total Fees</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatINR(BigInt(totalFees))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{feeRecords.length} records</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 p-4 rounded-2xl shadow-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="solid-modal-content border-2 border-emerald-200/70 dark:border-emerald-800/70 shadow-premium hover:shadow-premium-lg transition-all duration-300 card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Paid Fees</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatINR(BigInt(paidFees))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{paidCount} paid</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50 p-4 rounded-2xl shadow-lg">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="solid-modal-content border-2 border-orange-200/70 dark:border-orange-800/70 shadow-premium hover:shadow-premium-lg transition-all duration-300 card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Outstanding</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {formatINR(BigInt(unpaidFees))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{unpaidCount} unpaid</p>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 p-4 rounded-2xl shadow-lg">
                  <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fee Records Table */}
      <Card className="solid-modal-content border-2 border-gray-200 dark:border-gray-800 shadow-premium">
        <CardHeader className="border-b-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 border-2 focus:border-green-400 dark:focus:border-green-600 transition-colors bg-white dark:bg-gray-950 h-11 font-medium shadow-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px] border-2 bg-white dark:bg-gray-950 h-11 font-medium shadow-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="solid-modal-content border-2">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="unpaid">Unpaid Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-premium animate-float">
                <DollarSign className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No fee records found</p>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Add your first fee record to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border-2 border-gray-200 dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b-2 border-gray-200 dark:border-gray-800 hover:bg-gradient-to-r">
                    <TableHead className="font-bold text-gray-900 dark:text-white text-base">Student</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white text-base">Class</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white text-base">Amount</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white text-base">Status</TableHead>
                    <TableHead className="text-right font-bold text-gray-900 dark:text-white text-base">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-green-50/70 dark:hover:bg-green-950/20 transition-all duration-200 border-b border-gray-200 dark:border-gray-800"
                    >
                      <TableCell className="font-semibold text-gray-900 dark:text-white">
                        {getStudentName(record.studentId)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md font-semibold px-3 py-1">
                          Class {record.classId.toString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-lg text-green-600 dark:text-green-400">
                        {formatINR(record.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.isPaid ? 'default' : 'destructive'} 
                          className="gap-1.5 shadow-md font-semibold px-3 py-1.5"
                        >
                          {record.isPaid ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Paid
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Unpaid
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <EditFeeButton record={record} index={index} students={students} />
                          {!record.isPaid && <MarkPaidButton record={record} index={index} />}
                          <DeleteFeeButton record={record} index={index} studentName={getStudentName(record.studentId)} />
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
    <form onSubmit={handleSubmit} className="space-y-5 p-1">
      <div className="space-y-2">
        <Label htmlFor="student" className="font-semibold text-base text-gray-900 dark:text-white">
          Student <span className="text-red-500">*</span>
        </Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="border-2 h-11 bg-white dark:bg-gray-950 font-medium shadow-sm">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent className="solid-modal-content border-2">
            {students.map((student) => (
              <SelectItem key={student.id.toString()} value={student.id.toString()}>
                {student.name} (Class {student.classId.toString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount" className="font-semibold text-base text-gray-900 dark:text-white">
          Amount (INR) <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="pl-8 border-2 focus:border-green-400 dark:focus:border-green-600 h-11 bg-white dark:bg-gray-950 font-medium shadow-sm"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status" className="font-semibold text-base text-gray-900 dark:text-white">
          Payment Status
        </Label>
        <Select value={isPaid ? 'paid' : 'unpaid'} onValueChange={(v) => setIsPaid(v === 'paid')}>
          <SelectTrigger className="border-2 h-11 bg-white dark:bg-gray-950 font-medium shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="solid-modal-content border-2">
            <SelectItem value="paid">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Paid
              </div>
            </SelectItem>
            <SelectItem value="unpaid">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Unpaid
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-premium hover:shadow-premium-lg transition-all duration-300 h-12 text-base font-semibold" 
        disabled={addFeeRecord.isPending}
      >
        {addFeeRecord.isPending ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Adding...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Fee Record
          </span>
        )}
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
          className="hover:bg-green-100 dark:hover:bg-green-950/30 transition-all duration-200 border-2 font-semibold shadow-sm hover:shadow-md"
        >
          <Edit className="w-4 h-4 mr-1.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md solid-modal-content border-2 border-green-200 dark:border-green-800 shadow-premium-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Edit Fee Details
          </DialogTitle>
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
    <form onSubmit={handleSubmit} className="space-y-5 p-1">
      <div className="space-y-2">
        <Label htmlFor="edit-student" className="font-semibold text-base text-gray-900 dark:text-white">
          Student <span className="text-red-500">*</span>
        </Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="border-2 h-11 bg-white dark:bg-gray-950 font-medium shadow-sm">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent className="solid-modal-content border-2">
            {students.map((student) => (
              <SelectItem key={student.id.toString()} value={student.id.toString()}>
                {student.name} (Class {student.classId.toString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-amount" className="font-semibold text-base text-gray-900 dark:text-white">
          Amount (INR) <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
          <Input
            id="edit-amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="pl-8 border-2 focus:border-green-400 dark:focus:border-green-600 h-11 bg-white dark:bg-gray-950 font-medium shadow-sm"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-status" className="font-semibold text-base text-gray-900 dark:text-white">
          Payment Status
        </Label>
        <Select value={isPaid ? 'paid' : 'unpaid'} onValueChange={(v) => setIsPaid(v === 'paid')}>
          <SelectTrigger className="border-2 h-11 bg-white dark:bg-gray-950 font-medium shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="solid-modal-content border-2">
            <SelectItem value="paid">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Paid
              </div>
            </SelectItem>
            <SelectItem value="unpaid">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Unpaid
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-premium hover:shadow-premium-lg transition-all duration-300 h-12 text-base font-semibold" 
        disabled={updateFeeRecord.isPending}
      >
        {updateFeeRecord.isPending ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Updating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Update Fee Record
          </span>
        )}
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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkPaid}
      disabled={updateFeeRecord.isPending}
      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all duration-200 border-2 font-semibold shadow-sm hover:shadow-md"
    >
      {updateFeeRecord.isPending ? (
        <span className="flex items-center gap-1.5">
          <span className="animate-spin">⏳</span>
          Updating...
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Mark Paid
        </span>
      )}
    </Button>
  );
}

function DeleteFeeButton({ record, index, studentName }: { record: FeeRecord; index: number; studentName: string }) {
  const deleteFeeRecord = useDeleteFeeRecord();

  const handleDelete = async () => {
    try {
      await deleteFeeRecord.mutateAsync(BigInt(index));
      toast.success('Fee record deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete fee record');
      console.error(error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 border-2 border-red-200 dark:border-red-800 font-semibold shadow-sm hover:shadow-md"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="solid-modal-content border-2 border-red-200 dark:border-red-800 shadow-premium-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Delete Fee Record
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300 pt-2">
            Are you sure you want to delete this fee record for <span className="font-bold text-gray-900 dark:text-white">{studentName}</span>?
            <br />
            <span className="font-semibold text-red-600 dark:text-red-400">
              Amount: {formatINR(record.amount)} ({record.isPaid ? 'Paid' : 'Unpaid'})
            </span>
            <br />
            <br />
            This action cannot be undone and will permanently remove the fee record from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-2 font-semibold shadow-sm hover:shadow-md">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteFeeRecord.isPending}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-premium hover:shadow-premium-lg transition-all duration-300 font-semibold"
          >
            {deleteFeeRecord.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Deleting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Fee Record
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
