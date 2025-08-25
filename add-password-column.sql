-- Add password column for plain text passwords

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Add password column for plain text passwords
ALTER TABLE users ADD COLUMN password VARCHAR(255);

-- Step 3: Update existing users with a default password
UPDATE users SET password = 'Qwerty#125656' WHERE password IS NULL;

-- Step 4: Make password NOT NULL
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Step 5: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password';

-- Step 6: Show updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 7: Test insert to verify everything works
INSERT INTO users (email, password, full_name, role) 
VALUES ('test@example.com', 'testpassword123', 'Test User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Step 8: Verify test insert worked
SELECT email, password, full_name, role FROM users WHERE email = 'test@example.com';

-- Step 9: Clean up test data
DELETE FROM users WHERE email = 'test@example.com';
