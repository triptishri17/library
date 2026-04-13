'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { registerThunk, clearError } from '../../../store/slices/authSlice';

interface RegisterForm {
  name: string; email: string; password: string; phone?: string; membershipId?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  useEffect(() => { if (user) router.replace('/dashboard'); }, [user, router]);
  useEffect(() => { if (error) { toast.error(Array.isArray(error) ? error[0] : error); dispatch(clearError()); } }, [error, dispatch]);

  const onSubmit = async (data: RegisterForm) => {
    const res = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(res)) {
      toast.success('Account created!');
      router.replace('/dashboard');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Create account</h2>
      <p className="text-gray-500 text-sm mb-6">Register as a student member</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input {...register('name', { required: 'Name is required' })} placeholder="John Doe" className="input-field" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} type="email" placeholder="you@example.com" className="input-field" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} type="password" placeholder="••••••••" className="input-field" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} placeholder="+91 9876543210" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membership ID</label>
            <input {...register('membershipId')} placeholder="MEM-001" className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
