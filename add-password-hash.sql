-- Add password_hash column to users table

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Add password_hash column
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);

-- Step 3: Update existing users with a default password hash
UPDATE users SET password_hash = 'UXdlcnR5IzEyNTY1NnNhbHQ=' WHERE password_hash IS NULL;

-- Step 4: Make password_hash NOT NULL
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- Step 5: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash';

-- Step 6: Show updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 7: Test insert to verify everything works
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('test@example.com', 'test_hash_123', 'Test User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Step 8: Verify test insert worked
SELECT email, full_name, role FROM users WHERE email = 'test@example.com';

-- Step 9: Clean up test data
DELETE FROM users WHERE email = 'test@example.com';
