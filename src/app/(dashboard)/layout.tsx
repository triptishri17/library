'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../../services';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2...', roles: ['admin','librarian','student'] },
  { href: '/books', label: 'Books', icon: 'M12 6.253v13...', roles: ['admin','librarian','student'] },
  { href: '/users', label: 'Users', icon: 'M12 4.354...', roles: ['admin','librarian'] },
  { href: '/borrow', label: 'Borrow', icon: 'M8 7h12...', roles: ['admin','librarian','student'] },
  { href: '/fines', label: 'Fines', icon: 'M12 8c...', roles: ['admin','librarian','student'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // ⭐ IMPORTANT

  // ✅ FIX: wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationsService.getAll({ limit: 1 }),
    enabled: !!user,
    refetchInterval: 60000,
  });

  const unreadCount = notifData?.data?.meta?.unread || 0;

  useEffect(() => {
    if (mounted && !user) {
      router.replace('/login');
    }
  }, [user, mounted, router]);

  // ❗ VERY IMPORTANT FIX
  if (!mounted) return null;

  const allowedNav = navItems.filter((n) => user?.role && n.roles.includes(user.role));

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const active =
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href));

    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
        </svg>
        {item.label}
      </Link>
    );
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-5'}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">L</span>
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">LibraryMS</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {allowedNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>☰</button>

          <div>{pathname.split('/')[1] || 'Dashboard'}</div>

          <div>
            🔔 {unreadCount}
          </div>
        </header>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}