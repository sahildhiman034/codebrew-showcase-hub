-- Fix database schema for users table
-- Add missing columns if they don't exist

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Add is_verified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add is_email_verified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_email_verified') THEN
        ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add is_phone_verified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_phone_verified') THEN
        ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add any other missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_vendor_created') THEN
        ALTER TABLE users ADD COLUMN is_vendor_created BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verification_token') THEN
        ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'phone_verification_otp') THEN
        ALTER TABLE users ADD COLUMN phone_verification_otp VARCHAR(6);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'phone_verification_expires') THEN
        ALTER TABLE users ADD COLUMN phone_verification_expires TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update existing users to have default values if columns were just added
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL;
UPDATE users SET is_email_verified = TRUE WHERE is_email_verified IS NULL;
UPDATE users SET is_phone_verified = TRUE WHERE is_phone_verified IS NULL;

-- Show the current users table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
