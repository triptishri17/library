'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { finesService } from '../../../services';
import { useAppSelector } from '../../../hooks/useRedux';
import { Fine } from '../../../types';
import { format } from 'date-fns';

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  waived: 'bg-gray-100 text-gray-600',
};

export default function FinesPage() {
  const { user } = useAppSelector((s) => s.auth);
  const qc = useQueryClient();
  const isAdmin = user?.role === 'admin' || user?.role === 'librarian';

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: allFines, isLoading } = useQuery({
    queryKey: ['fines', statusFilter, page],
    queryFn: () => finesService.getAll({ status: statusFilter || undefined, page, limit: 10 }),
    enabled: isAdmin,
  });

  const { data: myFines } = useQuery({
    queryKey: ['my-fines'],
    queryFn: () => finesService.getMyFines(),
    enabled: user?.role === 'student',
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => finesService.pay(id),
    onSuccess: () => {
      toast.success('Fine paid successfully!');
      qc.invalidateQueries({ queryKey: ['fines'] });
      qc.invalidateQueries({ queryKey: ['my-fines'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Payment failed'),
  });

  const waiveMutation = useMutation({
    mutationFn: (id: string) => finesService.waive(id),
    onSuccess: () => {
      toast.success('Fine waived');
      qc.invalidateQueries({ queryKey: ['fines'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Waive failed'),
  });

  if (user?.role === 'student') {
    const fines = myFines?.data?.data?.fines || [];
    const total = myFines?.data?.data?.totalPending || 0;
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Fines</h1>
        {total > 0 && (
          <div className="card bg-red-50 border border-red-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-800">Total Pending: ₹{total}</p>
                <p className="text-sm text-red-600">Please clear your fines to continue borrowing books</p>
              </div>
            </div>
          </div>
        )}
        <div className="card p-0">
          <div className="table-container">
            <table>
              <thead><tr><th>Book</th><th>Reason</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {fines.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">No fines 🎉</td></tr>
                ) : fines.map((f: Fine) => (
                  <tr key={f._id}>
                    <td>{(f.borrowRecordId as any)?.bookId?.title || '—'}</td>
                    <td className="text-xs text-gray-500 max-w-xs">{f.reason}</td>
                    <td><span className="font-bold text-red-600">₹{f.amount}</span></td>
                    <td><span className={`badge ${statusColor[f.status]}`}>{f.status}</span></td>
                    <td>
                      {f.status === 'pending' && (
                        <button onClick={() => { if (confirm(`Pay ₹${f.amount}?`)) payMutation.mutate(f._id); }}
                          disabled={payMutation.isPending} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const fines: Fine[] = allFines?.data?.data || [];
  const meta = allFines?.data?.meta;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fines Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{meta?.total || 0} total fines</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'paid', 'waived'].map((s) => (
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
              <thead><tr><th>User</th><th>Book</th><th>Reason</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {fines.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No fines found</td></tr>
                ) : fines.map((f) => (
                  <tr key={f._id}>
                    <td>
                      <p className="font-medium text-gray-900">{f.userId?.name}</p>
                      <p className="text-xs text-gray-400">{f.userId?.membershipId}</p>
                    </td>
                    <td className="text-xs text-gray-600">{(f.borrowRecordId as any)?.bookId?.title || '—'}</td>
                    <td className="text-xs text-gray-500 max-w-xs">{f.reason}</td>
                    <td><span className="font-bold text-red-600">₹{f.amount}</span></td>
                    <td><span className={`badge ${statusColor[f.status]}`}>{f.status}</span></td>
                    <td className="text-xs text-gray-400">
                      {format(new Date(f.createdAt), 'dd MMM yyyy')}
                      {f.paidAt && <p>Paid: {format(new Date(f.paidAt), 'dd MMM')}</p>}
                    </td>
                    <td>
                      {f.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => { if (confirm('Mark as paid?')) payMutation.mutate(f._id); }}
                            disabled={payMutation.isPending}
                            className="px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors">
                            Pay
                          </button>
                          <button onClick={() => { if (confirm('Waive this fine?')) waiveMutation.mutate(f._id); }}
                            disabled={waiveMutation.isPending}
                            className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                            Waive
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
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
