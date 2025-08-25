-- Fix password_hash column issue

-- Check if password_hash column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash';

-- Add password_hash column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Make password_hash NOT NULL if it's currently nullable
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- Update existing users to have a default password hash if they don't have one
UPDATE users SET password_hash = 'UXdlcnR5IzEyNTY1NnNhbHQ=' WHERE password_hash IS NULL;

-- Show the final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
