import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  await db.dropDatabase();
  console.log('Database cleared');

  // Categories
  const categories = await db.collection('categories').insertMany([
    { name: 'Fiction', slug: 'fiction', description: 'Fictional works', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Science', slug: 'science', description: 'Science books', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Technology', slug: 'technology', description: 'Tech and programming', createdAt: new Date(), updatedAt: new Date() },
    { name: 'History', slug: 'history', description: 'Historical books', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Biography', slug: 'biography', description: 'Life stories', createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log('Categories seeded');

  const catIds = Object.values(categories.insertedIds);

  // Users
  const hashedPassword = await bcrypt.hash('password123', 12);
  await db.collection('users').insertMany([
    { name: 'Admin User', email: 'admin@library.com', password: hashedPassword, role: 'admin', phone: '+91 9000000001', membershipId: 'ADM-001', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Jane Librarian', email: 'librarian@library.com', password: hashedPassword, role: 'librarian', phone: '+91 9000000002', membershipId: 'LIB-001', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Rahul Student', email: 'student@library.com', password: hashedPassword, role: 'student', phone: '+91 9000000003', membershipId: 'STU-001', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Priya Singh', email: 'priya@library.com', password: hashedPassword, role: 'student', phone: '+91 9000000004', membershipId: 'STU-002', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log('Users seeded');

  // Books
  await db.collection('books').insertMany([
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', categoryId: catIds[2], description: 'A handbook of agile software craftsmanship', totalCopies: 5, availableCopies: 5, publishedYear: 2008, createdAt: new Date(), updatedAt: new Date() },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', categoryId: catIds[0], description: 'A story of the fabulously wealthy Jay Gatsby', totalCopies: 3, availableCopies: 3, publishedYear: 1925, createdAt: new Date(), updatedAt: new Date() },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', categoryId: catIds[1], description: 'From the Big Bang to Black Holes', totalCopies: 4, availableCopies: 4, publishedYear: 1988, createdAt: new Date(), updatedAt: new Date() },
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0062316097', categoryId: catIds[3], description: 'A brief history of humankind', totalCopies: 6, availableCopies: 6, publishedYear: 2011, createdAt: new Date(), updatedAt: new Date() },
    { title: 'Steve Jobs', author: 'Walter Isaacson', isbn: '978-1451648539', categoryId: catIds[4], description: 'The exclusive biography', totalCopies: 2, availableCopies: 2, publishedYear: 2011, createdAt: new Date(), updatedAt: new Date() },
    { title: 'The Pragmatic Programmer', author: 'David Thomas', isbn: '978-0135957059', categoryId: catIds[2], description: 'Your journey to mastery', totalCopies: 4, availableCopies: 4, publishedYear: 2019, createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log('Books seeded');

  console.log('\n✅ Seed complete!');
  console.log('Login credentials:');
  console.log('  Admin:     admin@library.com / password123');
  console.log('  Librarian: librarian@library.com / password123');
  console.log('  Student:   student@library.com / password123');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
