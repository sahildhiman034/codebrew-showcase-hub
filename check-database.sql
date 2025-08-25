-- Check what tables exist in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if there's a custom users table
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- Check if we're using .users (Supabase built-in)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' AND table_name = 'users';

-- Check the structure of auth.users if it exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if we have any custom users table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
