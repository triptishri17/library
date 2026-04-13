'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService } from '../../services';

interface UserFormData {
  name: string; email: string; password?: string;
  role: string; phone?: string; membershipId?: string;
}

export default function UserForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = !!userId;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>();

  const { data: userData } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getOne(userId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (userData?.data?.data) {
      const u = userData.data.data;
      reset({ name: u.name, email: u.email, role: u.role, phone: u.phone, membershipId: u.membershipId });
    }
  }, [userData, reset]);

  const mutation = useMutation({
    mutationFn: (data: UserFormData) => isEdit ? usersService.update(userId!, data) : usersService.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'User updated!' : 'User created!');
      qc.invalidateQueries({ queryKey: ['users'] });
      router.push('/users');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Something went wrong'),
  });

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit User' : 'Add User'}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input {...register('email', { required: 'Email is required' })} type="email" className="input-field" placeholder="john@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} type="password" className="input-field" placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select {...register('role', { required: 'Role is required' })} className="input-field">
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="librarian">Librarian</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="+91 9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership ID</label>
              <input {...register('membershipId')} className="input-field" placeholder="MEM-001" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
