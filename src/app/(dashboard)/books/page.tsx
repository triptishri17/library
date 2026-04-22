'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { booksService, categoriesService } from '../../../services';
import { useAppSelector } from '../../../hooks/useRedux';
import { Book } from '../../../types';

// ======================================================
// ✅ SAFE BASE URL (IMPORTANT FIX)
// ======================================================
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'http://localhost:5000';

// ======================================================
// ✅ SAFE IMAGE HELPER
// ======================================================
const getImageUrl = (path?: string) => {
  if (!path) return '';

  // already full URL
  if (path.startsWith('http')) return path;

  return `${BASE_URL}${path}`;
};

export default function BooksPage() {
  const { user } = useAppSelector((s) => s.auth);
  const qc = useQueryClient();

  const canEdit =
    user?.role === 'admin' || user?.role === 'librarian';

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState('');
  const [page, setPage] = useState(1);

  // ======================================================
  // ✅ BOOKS API
  // ======================================================
  const { data, isLoading } = useQuery({
    queryKey: ['books', search, categoryId, available, page],
    queryFn: () => {
      const params: any = {
        page,
        limit: 12,
      };

      if (search?.trim()) params.search = search.trim();
      if (categoryId?.trim()) params.categoryId = categoryId;
      if (available?.trim()) params.available = available;

      return booksService.getAll(params);
    },
  });

  // ======================================================
  // ✅ CATEGORIES API
  // ======================================================
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const categories = catData?.data?.data || [];
  const books: Book[] = data?.data?.data || [];
  const meta = data?.data?.meta;

  // ======================================================
  // ✅ DELETE BOOK
  // ======================================================
  const deleteMutation = useMutation({
    mutationFn: (id: string) => booksService.delete(id),
    onSuccess: () => {
      toast.success('Book deleted');
      qc.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Delete failed'),
  });

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Books</h1>
          <p className="text-gray-500 text-sm">
            {meta?.total || 0} books
          </p>
        </div>

        {canEdit && (
          <Link href="/books/add" className="btn-primary">
            Add Book
          </Link>
        )}
      </div>

      {/* FILTERS */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="input-field"
          />

          {/* CATEGORY */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* AVAILABLE */}
          <select
            value={available}
            onChange={(e) => {
              setAvailable(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="">All Books</option>
            <option value="true">Available Only</option>
          </select>
        </div>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-10">No books found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {books.map((book) => (
            <div key={book._id} className="card p-4">

              {/* IMAGE */}
              <div className="h-40 bg-gray-100 mb-3 relative rounded overflow-hidden">
                {book.coverImage ? (
                  <Image
                    src={getImageUrl(book.coverImage)}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* INFO */}
              <p className="font-semibold text-sm">{book.title}</p>
              <p className="text-xs text-gray-500">{book.author}</p>

              {/* CATEGORY */}
              {book.categoryId && typeof book.categoryId === 'object' && (
                <p className="text-xs text-blue-600 mt-1">
                  {(book.categoryId as any).name}
                </p>
              )}

              {/* STATUS */}
              <p className="mt-2 text-sm">
                {book.availableCopies > 0
                  ? `${book.availableCopies} available`
                  : 'Unavailable'}
              </p>

              {/* ACTIONS */}
              {canEdit && (
                <div className="flex gap-2 mt-3">
                  <Link href={`/books/edit/${book._id}`}>
                    Edit
                  </Link>

                  <button
                    onClick={() => {
                      if (confirm('Delete book?')) {
                        deleteMutation.mutate(book._id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span>
            {page} / {meta.totalPages}
          </span>

          <button
            onClick={() =>
              setPage((p) => Math.min(meta.totalPages, p + 1))
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}