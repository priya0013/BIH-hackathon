# BookMates + Supabase Integration Guide

## ✅ What's Done

Your frontend is ready to connect with Supabase backend. Follow these steps:

---

## 🔧 Step 1: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Click your **campus-book-connector** project
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon (public)** key (long string starting with `eyJ...`)

---

## 📝 Step 2: Update `.env.local`

In the project root, edit `.env.local`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

Replace the values with your actual Supabase credentials.

---

## 🗄️ Step 3: Create Database Tables in Supabase

In Supabase, go to **SQL Editor** and run these SQL queries:

### Create `users` table:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  idcardimage TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Create `books` table:
```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  authors TEXT[] NOT NULL,
  isbn10 VARCHAR(20),
  isbn13 VARCHAR(20),
  price INTEGER NOT NULL,
  oldPrice INTEGER,
  condition VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  college VARCHAR(100),
  sellerName VARCHAR(100) NOT NULL,
  sellerEmail VARCHAR(255) NOT NULL,
  rating DECIMAL(3,1),
  postedDate DATE NOT NULL,
  image TEXT,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  isbn_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_books_userId ON books(userId);

---

### Create `messages` table (for buyer-seller chat)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bookId UUID,
  senderId UUID NOT NULL,
  receiverId UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_receiver ON messages(receiverId);
CREATE INDEX idx_messages_book ON messages(bookId);
```

---

### Create `reports` table (for reporting suspicious listings/users)
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporterId UUID NOT NULL REFERENCES users(id),
  reportedUserId UUID REFERENCES users(id),
  bookId UUID REFERENCES books(id),
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reportedUser ON reports(reportedUserId);
```

---

### Create `blocked_users` table (for blocking problematic users)
```sql
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES users(id),
  blocked_id UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);
```
```

---

## 🔐 Security Recommendations

### ⚠️ Important: Hash Passwords in Production

Currently, passwords are stored in plain text. For production:

1. Install bcrypt:
   ```bash
   npm install bcryptjs
   ```

2. Update Signup (Register.jsx):
   ```javascript
   import bcryptjs from 'bcryptjs'
   
   // Before inserting user:
   const hashedPassword = await bcryptjs.hash(password, 10)
   
   // Insert with hashed password:
   await supabase
     .from('users')
     .insert([{
       username,
       email,
       password: hashedPassword,
      idcardimage: base64Image
     }])
   ```

3. Update Login (Login.jsx):
   ```javascript
   import bcryptjs from 'bcryptjs'
   
   // After fetching user:
   const passwordMatch = await bcryptjs.compare(password, data.password)
   if(!passwordMatch) {
     setError('Invalid email or password')
     return
   }
   ```

---

## 📦 Updated Pages (Ready to Use)

✅ **Signup** (`/signup`) - Stores user in Supabase
✅ **Login** (`/login`) - Authenticates against Supabase

---

## 🔄 Next Steps: Update Other Pages

### 1. **BrowseBooks.jsx** - Fetch books from Supabase

```javascript
import { supabase } from '../lib/supabaseClient'
import { useEffect } from 'react'

// In component:
const [books, setBooks] = useState([])

useEffect(() => {
  async function fetchBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('postedDate', { ascending: false })
    
    if(error) console.error(error)
    else setBooks(data || [])
  }
  fetchBooks()
}, [])
```

### 2. **ListBook.jsx** - Save new books to Supabase

```javascript
const currentUser = JSON.parse(localStorage.getItem('currentUser'))

const { data, error } = await supabase
  .from('books')
  .insert([{
    title,
    authors: authors.split(',').map(a => a.trim()),
    isbn10,
    isbn13,
    price: Number(price),
    oldPrice: Number(oldPrice),
    condition,
    category,
    college,
    sellerName: currentUser.username,
    sellerEmail: currentUser.email,
    rating: 5.0,
    postedDate: new Date().toISOString().split('T')[0],
    image: base64Image,
    userId: currentUser.id
  }])
```

### 3. **MyListings.jsx** - Fetch user's books

```javascript
const currentUser = JSON.parse(localStorage.getItem('currentUser'))

const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('userId', currentUser.id)
```

---

## 🧪 Test the Connection

1. Restart dev server: `npm run dev`
2. Go to http://localhost:5175
3. Click **Sign Up**
4. Fill form and create account
5. Check Supabase Dashboard → Table Editor → `users` table (should see your user!)
6. Go back to **Login** and sign in

If successful, you'll see your username in the Navbar.

---

## 🐛 Troubleshooting

**Error: "Failed to resolve import"**
- Make sure you've created `.env.local` with correct Supabase credentials
- Restart dev server after adding `.env.local`

**Error: "Invalid email or password"**
- Check that your user exists in Supabase `users` table
- Verify email and password match exactly

**Error: "Permission denied"**
- Go to Supabase → Authentication → Policies
- Ensure RLS (Row Level Security) allows anonymous inserts/selects

---

## 📚 Useful Supabase Docs

- [Supabase JS Docs](https://supabase.com/docs/reference/javascript/introduction)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

Good luck with your BookMates project! 🎉
