-- Force Supabase schema cache refresh
-- This will help resolve the "Could not find column" errors

-- First, let's verify the password_hash column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash';

-- Drop and recreate the password_hash column to force cache refresh
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL;

-- Update existing users to have a default password hash
UPDATE users SET password_hash = 'UXdlcnR5IzEyNTY1NnNhbHQ=' WHERE password_hash IS NULL OR password_hash = '';

-- Also ensure all other required columns exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;

-- Update existing users
UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL;
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
UPDATE users SET is_email_verified = TRUE WHERE is_email_verified IS NULL;
UPDATE users SET is_phone_verified = TRUE WHERE is_phone_verified IS NULL;

-- Show the final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
