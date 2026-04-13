'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { booksService, categoriesService } from '../../services';

interface BookFormData {
  title: string; author: string; isbn: string; categoryId: string;
  description?: string; totalCopies: number; publishedYear?: number;
}

export default function BookForm({ bookId }: { bookId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const isEdit = !!bookId;
  

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookFormData>();

  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesService.getAll() });
  const categories = catData?.data?.data || [];

  const { data: bookData } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => booksService.getOne(bookId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (bookData?.data?.data) {
      const b = bookData.data.data;
      reset({
        title: b.title, author: b.author, isbn: b.isbn,
        categoryId: typeof b.categoryId === 'object' ? b.categoryId._id : b.categoryId,
        description: b.description, totalCopies: b.totalCopies, publishedYear: b.publishedYear,
      });
      if (b.coverImage) setPreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${b.coverImage}`);
    }
  }, [bookData, reset]);

  const mutation = useMutation({
    mutationFn: (fd: FormData) => isEdit ? booksService.update(bookId!, fd) : booksService.create(fd),
    onSuccess: () => {
      toast.success(isEdit ? 'Book updated!' : 'Book added!');
      qc.invalidateQueries({ queryKey: ['books'] });
      router.push('/books');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Something went wrong'),
  });

  const onSubmit = (data: BookFormData) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, String(v)); });
    if (fileRef.current?.files?.[0]) fd.append('coverImage', fileRef.current.files[0]);
    mutation.mutate(fd);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Book' : 'Add New Book'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Update book information' : 'Add a book to the library'}</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input {...register('title', { required: 'Title is required' })} className="input-field" placeholder="Book title" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <input {...register('author', { required: 'Author is required' })} className="input-field" placeholder="Author name" />
              {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
              <input {...register('isbn', { required: 'ISBN is required' })} className="input-field" placeholder="978-0000000000" />
              {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select {...register('categoryId', { required: 'Category is required' })} className="input-field">
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
              <input {...register('totalCopies', { required: 'Required', min: { value: 1, message: 'Min 1' }, valueAsNumber: true })}
                type="number" min={1} className="input-field" placeholder="1" />
              {errors.totalCopies && <p className="text-red-500 text-xs mt-1">{errors.totalCopies.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Published Year</label>
              <input {...register('publishedYear', { valueAsNumber: true })} type="number" className="input-field" placeholder="2024" min={1000} max={new Date().getFullYear()} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="input-field resize-none" placeholder="Brief description of the book" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <div className="flex items-center gap-4">
                {preview && (
                  <div className="w-16 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={preview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">
                    {preview ? 'Change Image' : 'Upload Cover'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Saving…' : isEdit ? 'Update Book' : 'Add Book'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
