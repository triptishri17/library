'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { borrowService, booksService,usersService } from '../../../services';
// import { useAppSelector } from '../../../../hooks/useRedux';
import { useAppSelector } from '../../../hooks/useRedux';
// import { BorrowRecord } from '../../../../types';
import { BorrowRecord } from '../../../types';
import { format, isAfter } from 'date-fns';

const statusColor: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-700',
  renewed: 'bg-indigo-100 text-indigo-700',
  returned: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

function IssueModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<{ bookId: string; userId: string; dueDate?: string }>();
  const { data: booksData } = useQuery({ queryKey: ['books-available'], queryFn: () => booksService.getAll({ available: 'true', limit: 100 }) });
  const { data: usersData } = useQuery({ queryKey: ['users-all'], queryFn: () => usersService.getAll({ limit: 100, role: 'student' }) });

  const mutation = useMutation({
    mutationFn: (d: any) => borrowService.issue(d),
    onSuccess: () => {
      toast.success('Book issued successfully!');
      qc.invalidateQueries({ queryKey: ['borrows'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Issue failed'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Issue Book</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book *</label>
            <select {...register('bookId', { required: 'Select a book' })} className="input-field">
              <option value="">Select available book</option>
              {booksData?.data?.data?.map((b: any) => (
                <option key={b._id} value={b._id}>{b.title} — {b.author} ({b.availableCopies} left)</option>
              ))}
            </select>
            {errors.bookId && <p className="text-red-500 text-xs mt-1">{errors.bookId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
            <select {...register('userId', { required: 'Select a user' })} className="input-field">
              <option value="">Select student</option>
              {usersData?.data?.data?.map((u: any) => (
                <option key={u._id} value={u._id}>{u.name} — {u.membershipId || u.email}</option>
              ))}
            </select>
            {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional, default 14 days)</label>
            <input {...register('dueDate')} type="date" className="input-field"
              min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? 'Issuing…' : 'Issue Book'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BorrowPage() {
  const { user } = useAppSelector((s) => s.auth);
  const qc = useQueryClient();
  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const queryParams: any = { page, limit: 10 };
  if (statusFilter) queryParams.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['borrows', statusFilter, page],
    queryFn: () => borrowService.getHistory(queryParams),
  });

  const returnMutation = useMutation({
    mutationFn: (id: string) => borrowService.return(id),
    onSuccess: (data) => {
      const msg = data.data?.data?.fine ? `Returned with fine ₹${data.data.data.fine.amount}` : 'Book returned!';
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ['borrows'] });
      qc.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Return failed'),
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => borrowService.renew(id),
    onSuccess: () => { toast.success('Book renewed!'); qc.invalidateQueries({ queryKey: ['borrows'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Renewal failed'),
  });

  const records: BorrowRecord[] = data?.data?.data || [];
  const meta = data?.data?.meta;

  return (
    <div>
      {showIssueModal && <IssueModal onClose={() => setShowIssueModal(false)} />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrow Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{meta?.total || 0} total records</p>
        </div>
        {canManage && (
          <button onClick={() => setShowIssueModal(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Issue Book
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex gap-2 flex-wrap">
          {['', 'issued', 'renewed', 'overdue', 'returned'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="card p-0">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Book</th><th>User</th><th>Issued</th><th>Due Date</th><th>Status</th>{canManage && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No records found</td></tr>
                ) : records.map((r) => {
                  const isOverdue = isAfter(new Date(), new Date(r.dueDate)) && r.status !== 'returned';
                  const isActive = r.status === 'issued' || r.status === 'renewed' || r.status === 'overdue';
                  return (
                    <tr key={r._id}>
                      <td>
                        <p className="font-medium text-gray-900">{r.bookId?.title}</p>
                        <p className="text-xs text-gray-400">{r.bookId?.author}</p>
                      </td>
                      <td>
                        <p className="text-sm text-gray-900">{r.userId?.name}</p>
                        <p className="text-xs text-gray-400">{r.userId?.membershipId}</p>
                      </td>
                      <td className="text-xs text-gray-500">{format(new Date(r.issuedDate), 'dd MMM yyyy')}</td>
                      <td>
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                          {format(new Date(r.dueDate), 'dd MMM yyyy')}
                        </span>
                        {r.returnDate && <p className="text-xs text-gray-400">Returned: {format(new Date(r.returnDate), 'dd MMM yyyy')}</p>}
                      </td>
                      <td><span className={`badge ${statusColor[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span></td>
                      {canManage && (
                        <td>
                          {isActive && (
                            <div className="flex gap-1">
                              <button onClick={() => { if (confirm('Return this book?')) returnMutation.mutate(r._id); }}
                                disabled={returnMutation.isPending}
                                className="px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors">
                                Return
                              </button>
                              {r.renewCount < 2 && (
                                <button onClick={() => { if (confirm('Renew for 14 more days?')) renewMutation.mutate(r._id); }}
                                  disabled={renewMutation.isPending}
                                  className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors">
                                  Renew
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {page} of {meta.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-xs disabled:opacity-40">Prev</button>
                <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn-secondary px-3 py-1 text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
