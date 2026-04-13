'use client';
import BookForm from '../../../../../components/books/BookForm';
export default function EditBookPage({ params }: { params: { id: string } }) {
  return <BookForm bookId={params.id} />;
}
