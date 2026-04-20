'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { booksService } from '../../services';

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  description?: string;
  totalCopies: number;
  publishedYear?: number;
}

export default function BookForm({ bookId }: { bookId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const isEdit = !!bookId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormData>();

  // ✅ STATIC CATEGORIES
  const categories = [
    { _id: '1', name: 'Romance' },
    { _id: '2', name: 'Motivation' },
    { _id: '3', name: 'Fiction' },
    { _id: '4', name: 'Self Help' },
    { _id: '5', name: 'Education' },
  ];

  // ✅ Book Data (Edit mode)
  const { data: bookData } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => booksService.getOne(bookId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (bookData?.data?.data) {
      const b = bookData.data.data;

      reset({
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        categoryId:
          typeof b.categoryId === 'object'
            ? b.categoryId._id
            : b.categoryId,
        description: b.description,
        totalCopies: b.totalCopies,
        publishedYear: b.publishedYear,
      });

      if (b.coverImage) {
        setPreview(
          `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${b.coverImage}`
        );
      }
    }
  }, [bookData, reset]);

  // ✅ Mutation
  const mutation = useMutation({
    mutationFn: (fd: FormData) =>
      isEdit
        ? booksService.update(bookId!, fd)
        : booksService.create(fd),

    onSuccess: () => {
      toast.success(isEdit ? 'Book updated!' : 'Book added!');
      qc.invalidateQueries({ queryKey: ['books'] });
      router.push('/books');
    },

    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Something went wrong'),
  });

  // ✅ Submit
  const onSubmit = (data: BookFormData) => {
    const fd = new FormData();

    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        fd.append(k, String(v));
      }
    });

    if (fileRef.current?.files?.[0]) {
      fd.append('coverImage', fileRef.current.files[0]);
    }

    mutation.mutate(fd);
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          ←
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Book' : 'Add New Book'}
          </h1>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Title */}
            <div className="sm:col-span-2">
              <input
                {...register('title', { required: 'Title is required' })}
                className="input-field"
                placeholder="Book title"
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>

            {/* Author */}
            <input
              {...register('author', { required: 'Author is required' })}
              className="input-field"
              placeholder="Author name"
            />

            {/* ISBN */}
            <input
              {...register('isbn', { required: 'ISBN is required' })}
              className="input-field"
              placeholder="ISBN"
            />

            {/* ✅ CATEGORY DROPDOWN (STATIC) */}
            <select
              {...register('categoryId', { required: 'Category is required' })}
              className="input-field"
            >
              <option value="">Select category</option>

              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {errors.categoryId && (
              <p className="text-red-500 text-xs">
                {errors.categoryId.message}
              </p>
            )}

            {/* Total Copies */}
            <input
              type="number"
              min={1}
              {...register('totalCopies', {
                required: 'Required',
                valueAsNumber: true,
              })}
              className="input-field"
              placeholder="Total copies"
            />

            {/* Published Year */}
            <input
              type="number"
              {...register('publishedYear', { valueAsNumber: true })}
              className="input-field"
              placeholder="Published year"
            />

            {/* Description */}
            <textarea
              {...register('description')}
              className="input-field"
              placeholder="Description"
            />

            {/* Image Upload */}
            <div className="sm:col-span-2">
              {preview && (
                <img src={preview} className="w-20 h-24 object-cover mb-2" />
              )}

              <input
                ref={fileRef}
                type="file"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setPreview(URL.createObjectURL(f));
                }}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-secondary"
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Saving...'
                : isEdit
                ? 'Update Book'
                : 'Add Book'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}