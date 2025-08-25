-- Add the missing columns that are still needed

-- Add is_verified column (this is crucial for the admin panel)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Add is_active column (this is crucial for the admin panel)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add email_verification_token column
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);

-- Add phone_verification_otp column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_otp VARCHAR(6);

-- Add phone_verification_expires column
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_expires TIMESTAMP WITH TIME ZONE;

-- Update existing users to have default values for the new columns
UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL;
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Show the final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
