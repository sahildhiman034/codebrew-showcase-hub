-- Fix NULL password_hash values before making column NOT NULL

-- Step 1: Check current users and their password_hash values
SELECT id, email, password_hash FROM users;

-- Step 2: Update all NULL password_hash values with a default hash
UPDATE users SET password_hash = 'UXdlcnR5IzEyNTY1NnNhbHQ=' WHERE password_hash IS NULL;

-- Step 3: Verify no NULL values remain
SELECT COUNT(*) as null_count FROM users WHERE password_hash IS NULL;

-- Step 4: Now make the column NOT NULL
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- Step 5: Verify the column is now NOT NULL
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash';

-- Step 6: Show final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
