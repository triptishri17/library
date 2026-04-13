'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
// import { notificationsService } from '../../../../services';
import { notificationsService } from '../../../services';
// import { Notification } from '../../../../types';
import { Notification } from '../../../types';
import { formatDistanceToNow } from 'date-fns';

const typeIcons: Record<string, { icon: string; color: string }> = {
  due_reminder: { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-amber-100 text-amber-600' },
  overdue_alert: { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'bg-red-100 text-red-600' },
  fine_generated: { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2', color: 'bg-red-100 text-red-600' },
  book_available: { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-100 text-green-600' },
  general: { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-blue-100 text-blue-600' },
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsService.getAll({ limit: 50 }) });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notifications-count'] }); },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notifications-count'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const notifications: Notification[] = data?.data?.data || [];
  const unread = data?.data?.meta?.unread || 0;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-blue-600 font-medium mt-0.5">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending} className="btn-secondary text-sm">
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-400">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const { icon, color } = typeIcons[n.type] || typeIcons.general;
            return (
              <div key={n._id} className={`card flex items-start gap-4 p-4 transition-colors ${!n.isRead ? 'bg-blue-50 border-blue-100' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button onClick={() => markOneMutation.mutate(n._id)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Mark as read">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                  )}
                  <button onClick={() => deleteMutation.mutate(n._id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
