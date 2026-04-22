'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../../services';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin','librarian','student'] },
  { href: '/books', label: 'Books', roles: ['admin','librarian','student'] },
  { href: '/users', label: 'Users', roles: ['admin','librarian'] },
  { href: '/borrow', label: 'Borrow', roles: ['admin','librarian','student'] },
  { href: '/fines', label: 'Fines', roles: ['admin','librarian','student'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // AUTH REDIRECT
  useEffect(() => {
    if (mounted && !user) router.replace('/login');
  }, [mounted, user, router]);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationsService.getAll({ limit: 1 }),
    enabled: !!user,
    refetchInterval: 60000,
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  const allowedNav = navItems.filter((n) =>
    user?.role ? n.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  const unreadCount = notifData?.data?.meta?.unread || 0;

  const Sidebar = () => (
    <div className="flex flex-col h-full p-5">
      <div className="mb-8 font-bold text-lg">📚 LibraryMS</div>

      <nav className="flex-1 space-y-2">
        {allowedNav.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm ${
                active
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-gray-400 mb-2">{user?.email}</p>

        <button
          onClick={handleLogout}
          className="text-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-60 bg-white border-r">
        <Sidebar />
      </aside>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 lg:hidden">
          <div className="w-64 bg-white h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="capitalize">
            {pathname.split('/')[1] || 'dashboard'}
          </div>

          <div>🔔 {unreadCount}</div>
        </header>

        <main className="p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}