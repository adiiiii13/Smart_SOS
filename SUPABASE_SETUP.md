# Supabase Setup Guide for SOS App

## What is Supabase?
Supabase is an open-source alternative to Firebase that provides:
- **PostgreSQL Database** (more powerful than Firestore)
- **Real-time subscriptions** (like Firebase)
- **Authentication** (email, Google, GitHub, etc.)
- **Storage** (file uploads)
- **Edge Functions** (serverless functions)
- **Better SQL queries** and relationships

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Click "New Project"

## Step 2: Create New Project

1. **Choose organization** (create one if needed)
2. **Project name**: `sos-app`
3. **Database password**: Create a strong password (save it!)
4. **Region**: Choose closest to your users
5. Click "Create new project"

## Step 3: Get Your Credentials

1. **Wait for project setup** (2-3 minutes)
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Update Configuration

Edit `src/lib/supabase.ts`:

```typescript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Step 5: Create Database Tables

In Supabase Dashboard → **SQL Editor**, run these commands:

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  is_read BOOLEAN DEFAULT FALSE,
  action_type TEXT,
  action_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Emergencies Table
```sql
CREATE TABLE emergencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  emergency_type TEXT NOT NULL,
  specific_type TEXT,
  location TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Friend Requests Table
```sql
CREATE TABLE friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_user_name TEXT NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Friends Table
```sql
CREATE TABLE friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL,
  friend_email TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 6: Enable Row Level Security (RLS)

For each table, enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Example policy for notifications (users can only see their own)
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Friend requests policies
CREATE POLICY "Friend requests: insert by sender" ON friend_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = from_user_id::text);

CREATE POLICY "Friend requests: view for sender or receiver" ON friend_requests
  FOR SELECT TO authenticated
  USING (auth.uid()::text = from_user_id::text OR auth.uid()::text = to_user_id::text);

CREATE POLICY "Friend requests: update status by receiver" ON friend_requests
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = to_user_id::text)
  WITH CHECK (auth.uid()::text = to_user_id::text);

-- Friends policies
CREATE POLICY "Friends: insert by either party on accept" ON friends
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text);

CREATE POLICY "Friends: view own rows" ON friends
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Friends: delete own rows" ON friends
  FOR DELETE TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Profiles search (optional): allow authenticated users to read basic profiles for search
CREATE POLICY "Profiles: readable by authenticated" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Notifications: allow sender to insert friend events for the receiver
-- This enables client-side inserts of notifications tied to friend flows without a service role.
-- It requires action_data->>'fromUserId' to match the current user's auth.uid().
CREATE POLICY "Notifications: sender may insert friend events" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    action_type IN ('friend_request', 'friend_accepted')
    AND (
      (
        CASE WHEN action_data ? 'fromUserId'
        THEN (action_data->>'fromUserId')::uuid = auth.uid()
        ELSE false
        END
      )
    )
  );

-- Inspect current notification policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'notifications';
```

## Step 7: Test Your Setup

1. **Start your app**: `npm run dev`
2. **Check browser console** for Supabase connection
3. **Test basic operations** (create user, etc.)

## Step 8: Enable Real-time

In Supabase Dashboard → **Database** → **Replication**:
1. Enable **Logical Replication**
2. Your app will automatically get real-time updates

## Advantages of Supabase over Firebase

✅ **Better Database**: PostgreSQL vs Firestore
✅ **SQL Queries**: Full SQL support vs limited queries
✅ **Relationships**: Proper foreign keys vs denormalized data
✅ **Real-time**: WebSocket-based vs polling
✅ **Open Source**: Self-hostable vs vendor lock-in
✅ **Cost**: Often cheaper for high usage

## Troubleshooting

### Connection Issues
- Check URL and API key
- Ensure project is active
- Check browser console for errors

### RLS Errors
- Make sure RLS is enabled
- Check policy permissions
- Verify user authentication

### Friend requests FK violation (to_user_id/from_user_id)
If you see an error like:

"violates foreign key constraint friend_requests_to_user_id_fkey"

It means your friend_requests (and likely friends) table is referencing a different users table than the auth users your app uses (auth.users). Fix by pointing FKs to auth.users:

```sql
-- Friend Requests -> auth.users
ALTER TABLE friend_requests DROP CONSTRAINT IF EXISTS friend_requests_from_user_id_fkey;
ALTER TABLE friend_requests DROP CONSTRAINT IF EXISTS friend_requests_to_user_id_fkey;
ALTER TABLE friend_requests
  ADD CONSTRAINT friend_requests_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT friend_requests_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Friends -> auth.users
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_user_id_fkey;
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_friend_id_fkey;
ALTER TABLE friends
  ADD CONSTRAINT friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

Quickly inspect your current FK targets (copy/paste):

```sql
-- Inspect FKs for friend_requests
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema AS fk_schema,
  ccu.table_name   AS fk_table,
  ccu.column_name  AS fk_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.constraint_schema = kcu.constraint_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.constraint_schema = tc.constraint_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'friend_requests'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Inspect FKs for friends
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema AS fk_schema,
  ccu.table_name   AS fk_table,
  ccu.column_name  AS fk_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.constraint_schema = kcu.constraint_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.constraint_schema = tc.constraint_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'friends'
  AND tc.constraint_type = 'FOREIGN KEY';
```

Verify both accounts exist in auth.users (replace emails):

```sql
SELECT id, email FROM auth.users
WHERE email IN ('sender@example.com', 'receiver@example.com');
```

Optional smoke test (replace names/emails):

```sql
-- Insert a test friend request
WITH s AS (
  SELECT id, email FROM auth.users WHERE email = 'sender@example.com'
),
r AS (
  SELECT id, email FROM auth.users WHERE email = 'receiver@example.com'
)
INSERT INTO public.friend_requests (from_user_id, from_user_name, to_user_id, to_user_name, status)
SELECT s.id, 'Sender Name', r.id, 'Receiver Name', 'pending'
FROM s CROSS JOIN r;

-- Clean up the test row
WITH s AS (
  SELECT id FROM auth.users WHERE email = 'sender@example.com'
),
r AS (
  SELECT id FROM auth.users WHERE email = 'receiver@example.com'
)
DELETE FROM public.friend_requests
WHERE from_user_id = (SELECT id FROM s)
  AND to_user_id   = (SELECT id FROM r);
```

Note: If your notifications/emergencies also reference a custom users table, either:
- Switch those FKs to auth.users as well (recommended), or
- Ensure a matching row exists in your custom users table for every auth user (our app attempts this via ensureUserRow on login).

### Real-time Not Working
- Enable logical replication
- Check subscription setup
- Verify table permissions

## Next Steps

1. **Test basic CRUD operations**
2. **Implement authentication**
3. **Add real-time subscriptions**
4. **Migrate existing data** (if any)

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
