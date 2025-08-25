-- Simple fix for users table - add missing columns safely

-- Add is_verified column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Add is_email_verified column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

-- Add is_phone_verified column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;

-- Add is_active column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_vendor_created column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_vendor_created BOOLEAN DEFAULT FALSE;

-- Add email_verification_token column
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);

-- Add phone_verification_otp column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_otp VARCHAR(6);

-- Add phone_verification_expires column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_expires TIMESTAMP WITH TIME ZONE;

-- Add last_login column
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add updated_at column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing users to have default values
UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL;
UPDATE users SET is_email_verified = TRUE WHERE is_email_verified IS NULL;
UPDATE users SET is_phone_verified = TRUE WHERE is_phone_verified IS NULL;
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
