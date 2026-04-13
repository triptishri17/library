'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { loginThunk, clearError } from '../../../store/slices/authSlice';

interface LoginForm { email: string; password: string; }

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) router.replace('/dashboard'); }, [user, router]);
  useEffect(() => { if (error) { toast.error(Array.isArray(error) ? error[0] : error); dispatch(clearError()); } }, [error, dispatch]);

  // const onSubmit = async (data: LoginForm) => {
  //   console.log(data,)
  //   const res = await dispatch(loginThunk(data));
  //   if (loginThunk.fulfilled.match(res)) {
  //     toast.success('Welcome back!');
  //     router.replace('/dashboard');
  //   }
  // };

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log(data);

      const res = await dispatch(loginThunk(data));

      if (loginThunk.fulfilled.match(res)) {
        toast.success('Welcome back!');
        router.replace('/dashboard');
      } else {
        console.log("Login failed:", res);
      }

    } catch (err) {
      console.error("ERROR:", err);
      toast.error("Something went wrong");
    }
  };
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in</h2>
      <p className="text-gray-500 text-sm mb-6">Enter your credentials to access the system</p>

      {/* <form onSubmit={handleSubmit(onSubmit)} > */}
      <form className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault(); // force prevent
          handleSubmit(onSubmit)(e);
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
            type="email" placeholder="you@example.com" className="input-field"
            autoComplete="email"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-10"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Signing in…
            </span>
          ) : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
      </p>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
        <p className="font-medium mb-1">Demo credentials:</p>
        <p>Admin: admin@library.com / password123</p>
        <p>Librarian: librarian@library.com / password123</p>
        <p>Student: student@library.com / password123</p>
       
      </div>
    </div>
  );
}
