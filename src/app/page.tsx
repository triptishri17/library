'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../hooks/useRedux';

export default function Home() {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    router.replace(user ? '/dashboard' : '/login');
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );
}
