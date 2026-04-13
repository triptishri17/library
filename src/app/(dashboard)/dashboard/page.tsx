'use client';
import { useQuery } from '@tanstack/react-query';
// import { useAppSelector } from '../../../../hooks/useRedux';
import { useAppSelector } from '../../../hooks/useRedux';
// import { booksService, borrowService, usersService, finesService } from '../../../../services';
import { booksService,borrowService,usersService,finesService } from '../../../services';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin' || user?.role === 'librarian';

  const { data: bookStats } = useQuery({ queryKey: ['book-stats'], queryFn: () => booksService.getStats(), enabled: isAdmin });
  const { data: borrowStats } = useQuery({ queryKey: ['borrow-stats'], queryFn: () => borrowService.getStats(), enabled: isAdmin });
  const { data: userStats } = useQuery({ queryKey: ['user-stats'], queryFn: () => usersService.getStats(), enabled: user?.role === 'admin' });
  const { data: fineStats } = useQuery({ queryKey: ['fine-stats'], queryFn: () => finesService.getStats(), enabled: isAdmin });

  const { data: myBorrows } = useQuery({
    queryKey: ['my-borrows'],
    queryFn: () => borrowService.getHistory({ limit: 5, status: 'issued' }),
    enabled: user?.role === 'student',
  });

  const { data: myFines } = useQuery({
    queryKey: ['my-fines'],
    queryFn: () => finesService.getMyFines(),
    enabled: user?.role === 'student',
  });

  const { data: recentBorrows } = useQuery({
    queryKey: ['recent-borrows'],
    queryFn: () => borrowService.getHistory({ limit: 5 }),
    enabled: isAdmin,
  });

  const bs = bookStats?.data?.data;
  const brs = borrowStats?.data?.data;
  const us = userStats?.data?.data;
  const fs = fineStats?.data?.data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening in the library today.</p>
      </div>

      {/* Admin/Librarian stats */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Books" value={bs?.totalBooks} icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" color="bg-blue-500" />
            <StatCard label="Active Borrows" value={brs?.activeBorrows} icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" color="bg-green-500" />
            <StatCard label="Overdue Books" value={brs?.overdueBooks} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-red-500" />
            <StatCard label="Pending Fines (₹)" value={fs?.pendingAmount} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-amber-500" />
          </div>
          {user?.role === 'admin' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Users" value={us?.total} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" color="bg-purple-500" />
              <StatCard label="Students" value={us?.students} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" color="bg-indigo-500" />
              <StatCard label="Available Books" value={bs?.availableBooks} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-teal-500" />
              <StatCard label="Collected Fines (₹)" value={fs?.collectedAmount} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" color="bg-emerald-500" />
            </div>
          )}

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Recent Borrow Activity</h2>
            {recentBorrows?.data?.data?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentBorrows?.data?.data?.map((record: any) => (
                  <div key={record._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.bookId?.title}</p>
                      <p className="text-xs text-gray-400">{record.userId?.name} · {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}</p>
                    </div>
                    <span className={`badge ${record.status === 'returned' ? 'bg-green-100 text-green-700' : record.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Student dashboard */}
      {user?.role === 'student' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">My Current Borrows</h2>
            {myBorrows?.data?.data?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No active borrows</p>
            ) : (
              <div className="space-y-3">
                {myBorrows?.data?.data?.map((record: any) => (
                  <div key={record._id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{record.bookId?.title}</p>
                      <p className="text-xs text-gray-400">{record.bookId?.author}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-gray-700">Due {new Date(record.dueDate).toLocaleDateString()}</p>
                      {new Date(record.dueDate) < new Date() && (
                        <span className="badge bg-red-100 text-red-700 mt-1">Overdue</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">My Pending Fines</h2>
            {myFines?.data?.data?.fines?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No pending fines 🎉</p>
            ) : (
              <>
                {myFines?.data?.data?.fines?.map((fine: any) => (
                  <div key={fine._id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fine.reason}</p>
                      <p className="text-xs text-gray-400">{fine.borrowRecordId?.bookId?.title}</p>
                    </div>
                    <span className="font-bold text-red-600">₹{fine.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 font-semibold text-sm">
                  <span className="text-gray-700">Total due</span>
                  <span className="text-red-600">₹{myFines?.data?.data?.totalPending}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
