'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService } from '../../../services';
// import { User } from '../../../../types';
import { User } from '../../../types';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  librarian: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, role, page],
    queryFn: () => usersService.getAll({ search, role, page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const users: User[] = data?.data?.data || [];
  const meta = data?.data?.meta;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{meta?.total || 0} registered users</p>
        </div>
        <Link href="/users/add" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </Link>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, membership ID…" className="input-field" />
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="librarian">Librarian</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Membership ID</th><th>Phone</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
                ) : users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${roleColors[user.role]}`}>{user.role}</span></td>
                    <td className="font-mono text-xs">{user.membershipId || '—'}</td>
                    <td>{user.phone || '—'}</td>
                    <td className="text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-1">
                        <Link href={`/users/edit/${user._id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button onClick={() => { if (confirm('Delete this user?')) deleteMutation.mutate(user._id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, meta.total)} of {meta.total}</p>
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
