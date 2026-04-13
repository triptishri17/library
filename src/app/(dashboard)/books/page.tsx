'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { booksService,categoriesService } from '../../../services';
import { useAppSelector } from '../../../hooks/useRedux';
import { Book } from '../../../types';

export default function BooksPage() {
  const { user } = useAppSelector((s) => s.auth);
  const qc = useQueryClient();
  const canEdit = user?.role === 'admin' || user?.role === 'librarian';

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['books', search, categoryId, available, page],
    queryFn: () => booksService.getAll({ search, categoryId, available, page, limit: 12 }),
  });

  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesService.getAll() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => booksService.delete(id),
    onSuccess: () => { toast.success('Book deleted'); qc.invalidateQueries({ queryKey: ['books'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const books: Book[] = data?.data?.data || [];
  const meta = data?.data?.meta;
  const categories = catData?.data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-500 text-sm mt-0.5">{meta?.total || 0} books in library</p>
        </div>
        {canEdit && (
          <Link href="/books/add" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Book
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search title, author, ISBN…" className="input-field"
          />
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={available} onChange={(e) => { setAvailable(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Books</option>
            <option value="true">Available Only</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-400 font-medium">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <div key={book._id} className="card flex flex-col hover:shadow-md transition-shadow p-4">
              <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-3 overflow-hidden">
                {book.coverImage ? (
                  <Image src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${book.coverImage}`}
                    alt={book.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">{book.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                {book.categoryId && typeof book.categoryId === 'object' && (
                  <span className="badge bg-blue-50 text-blue-600 mt-2">{(book.categoryId as any).name}</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className={`badge ${book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}
                </span>
                {canEdit && (
                  <div className="flex gap-1">
                    <Link href={`/books/edit/${book._id}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button onClick={() => { if (confirm('Delete this book?')) deleteMutation.mutate(book._id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Previous</button>
          <span className="flex items-center px-4 text-sm text-gray-600">{page} / {meta.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
