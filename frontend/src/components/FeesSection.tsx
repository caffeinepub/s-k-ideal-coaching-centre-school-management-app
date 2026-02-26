import React, { useState } from 'react';
import {
  useGetAllFeeRecords,
  useGetAllStudents,
  useAddFeeRecord,
  useUpdateFeeRecord,
  useDeleteFeeRecord,
  useToggleFeePaymentStatus,
} from '../hooks/useQueries';
import type { FeeRecord } from '../backend';
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
import {
  DollarSign,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatINR } from '../lib/utils';

interface FeeFormData {
  studentId: string;
  classId: string;
  amount: string;
  isPaid: boolean;
}

const defaultForm: FeeFormData = {
  studentId: '',
  classId: '1',
  amount: '',
  isPaid: false,
};

interface FeesSectionProps {
  enabled?: boolean;
}

// We need to track fee record IDs since FeeRecord doesn't have an id field in the type
// We'll use index-based approach with the backend's counter
interface IndexedFeeRecord extends FeeRecord {
  _index: number;
}

export default function FeesSection({ enabled = true }: FeesSectionProps) {
  const { data: feeRecords = [], isLoading, error, refetch } = useGetAllFeeRecords(enabled);
  const { data: students = [] } = useGetAllStudents(enabled);
  const addFeeRecord = useAddFeeRecord();
  const updateFeeRecord = useUpdateFeeRecord();
  const deleteFeeRecord = useDeleteFeeRecord();
  const toggleFeePayment = useToggleFeePaymentStatus();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [form, setForm] = useState<FeeFormData>(defaultForm);
  const [formError, setFormError] = useState('');
  const [togglingIndex, setTogglingIndex] = useState<number | null>(null);

  const getStudentName = (studentId: bigint) => {
    const student = students.find(s => s.id === studentId);
    return student?.name ?? `Student #${studentId}`;
  };

  const filteredRecords = feeRecords
    .map((r, i) => ({ ...r, _index: i }))
    .filter(r => {
      const name = getStudentName(r.studentId).toLowerCase();
      return name.includes(search.toLowerCase()) || r.classId.toString().includes(search);
    });

  const totalCollected = feeRecords.filter(r => r.isPaid).reduce((sum, r) => sum + Number(r.amount), 0);
  const totalOutstanding = feeRecords.filter(r => !r.isPaid).reduce((sum, r) => sum + Number(r.amount), 0);
  const paidCount = feeRecords.filter(r => r.isPaid).length;
  const unpaidCount = feeRecords.filter(r => !r.isPaid).length;

  const openAdd = () => {
    setEditingIndex(null);
    setForm(defaultForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (record: FeeRecord, index: number) => {
    setEditingIndex(index);
    setForm({
      studentId: record.studentId.toString(),
      classId: record.classId.toString(),
      amount: record.amount.toString(),
      isPaid: record.isPaid,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.studentId.trim()) { setFormError('Student ID is required'); return; }
    if (!form.amount.trim() || isNaN(Number(form.amount))) { setFormError('Valid amount is required'); return; }

    try {
      if (editingIndex !== null) {
        await updateFeeRecord.mutateAsync({
          id: BigInt(editingIndex),
          studentId: BigInt(form.studentId),
          classId: BigInt(form.classId),
          amount: BigInt(form.amount),
          isPaid: form.isPaid,
        });
      } else {
        await addFeeRecord.mutateAsync({
          studentId: BigInt(form.studentId),
          classId: BigInt(form.classId),
          amount: BigInt(form.amount),
          isPaid: form.isPaid,
        });
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (deleteIndex === null) return;
    try {
      await deleteFeeRecord.mutateAsync(BigInt(deleteIndex));
      setDeleteIndex(null);
    } catch {
      setDeleteIndex(null);
    }
  };

  const handleTogglePayment = async (index: number) => {
    setTogglingIndex(index);
    try {
      await toggleFeePayment.mutateAsync(BigInt(index));
    } finally {
      setTogglingIndex(null);
    }
  };

  const isPending = addFeeRecord.isPending || updateFeeRecord.isPending;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Header */}
      <div className="rounded-2xl p-6 shadow-emerald" style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-2xl">Fees Management</h2>
              <p className="text-emerald-100 text-sm font-medium">{feeRecords.length} fee records</p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#1e3a8a', border: 'none' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fee Record
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-display font-extrabold" style={{ color: '#059669' }}>{formatINR(totalCollected)}</p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">Collected</p>
        </div>
        <div className="premium-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
            <XCircle className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-display font-extrabold" style={{ color: '#dc2626' }}>{formatINR(totalOutstanding)}</p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">Outstanding</p>
        </div>
        <div className="premium-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' }}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-display font-extrabold text-foreground">{paidCount}</p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">Paid Records</p>
        </div>
        <div className="premium-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-display font-extrabold text-foreground">{unpaidCount}</p>
          <p className="text-xs text-muted-foreground font-semibold mt-1">Unpaid Records</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name or class..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-white border-border font-medium"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Failed to load fee records.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">Retry</Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="premium-card p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredRecords.length === 0 && (
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}>
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-display font-bold text-foreground text-xl mb-2">
            {search ? 'No fee records found' : 'No fee records yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {search ? 'Try a different search term.' : 'Add your first fee record to get started.'}
          </p>
          {!search && (
            <Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)', color: 'white', border: 'none' }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Record
            </Button>
          )}
        </div>
      )}

      {/* Fee Records List */}
      {!isLoading && filteredRecords.length > 0 && (
        <div className="space-y-3">
          {filteredRecords.map(record => (
            <div key={record._index} className="premium-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: record.isPaid ? 'linear-gradient(135deg, #047857, #059669)' : 'linear-gradient(135deg, #b91c1c, #dc2626)' }}>
                {record.isPaid ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                  <XCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-foreground text-base">{getStudentName(record.studentId)}</h4>
                  <span className="text-muted-foreground text-sm">• Class {record.classId.toString()}</span>
                </div>
                <p className="text-lg font-extrabold mt-0.5" style={{ color: '#1e3a8a' }}>{formatINR(Number(record.amount))}</p>
              </div>

              {/* Paid/Unpaid Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleTogglePayment(record._index)}
                  disabled={togglingIndex === record._index}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 shadow-md ${
                    record.isPaid
                      ? 'text-white'
                      : 'text-white'
                  }`}
                  style={{
                    background: record.isPaid
                      ? 'linear-gradient(135deg, #047857, #059669)'
                      : 'linear-gradient(135deg, #b91c1c, #dc2626)',
                    minWidth: '100px',
                    justifyContent: 'center',
                  }}
                >
                  {togglingIndex === record._index ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : record.isPaid ? (
                    <><CheckCircle2 className="w-4 h-4" />Paid</>
                  ) : (
                    <><XCircle className="w-4 h-4" />Unpaid</>
                  )}
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(record, record._index)}
                  className="font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteIndex(record._index)}
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}>
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              {editingIndex !== null ? 'Edit Fee Record' : 'Add Fee Record'}
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
              <div className="space-y-1">
                <Label htmlFor="studentId" className="font-semibold text-foreground">Student ID *</Label>
                <Input
                  id="studentId"
                  type="number"
                  min="0"
                  value={form.studentId}
                  onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                  placeholder="Enter student ID"
                  className="bg-white border-gray-300 font-medium"
                  required
                />
                {students.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {students.map(s => `${s.name} (ID: ${s.id})`).join(', ')}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="feeClassId" className="font-semibold text-foreground">Class *</Label>
                <Input
                  id="feeClassId"
                  type="number"
                  min="1"
                  max="12"
                  value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  placeholder="Enter class number"
                  className="bg-white border-gray-300 font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="amount" className="font-semibold text-foreground">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Enter fee amount"
                  className="bg-white border-gray-300 font-medium"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={form.isPaid}
                  onChange={e => setForm(f => ({ ...f, isPaid: e.target.checked }))}
                  className="w-4 h-4 rounded accent-emerald-600"
                />
                <Label htmlFor="isPaid" className="font-semibold text-foreground cursor-pointer">
                  Mark as Paid
                </Label>
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
                style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)', color: 'white', border: 'none' }}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingIndex !== null ? 'Saving...' : 'Adding...'}</>
                ) : (
                  editingIndex !== null ? 'Save Changes' : 'Add Record'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={open => !open && setDeleteIndex(null)}>
        <AlertDialogContent className="bg-white border border-border shadow-premium-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold text-foreground">Delete Fee Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. The fee record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteFeeRecord.isPending}
              className="font-bold"
              style={{ background: '#dc2626', color: 'white', border: 'none' }}
            >
              {deleteFeeRecord.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
