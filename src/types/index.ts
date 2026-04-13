export type UserRole = 'admin' | 'librarian' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  membershipId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: Category | string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  publishedYear?: number;
  coverImage?: string;
  createdAt: string;
}

export type BorrowStatus = 'issued' | 'returned' | 'overdue' | 'renewed';

export interface BorrowRecord {
  _id: string;
  bookId: Book;
  userId: User;
  issuedDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  renewCount: number;
  createdAt: string;
}

export type FineStatus = 'pending' | 'paid' | 'waived';

export interface Fine {
  _id: string;
  userId: User;
  borrowRecordId: BorrowRecord;
  amount: number;
  reason: string;
  status: FineStatus;
  paidAt?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeBorrows: number;
  overdueBooks: number;
  pendingFines: number;
}
