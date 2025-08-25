-- Recreate users table with correct schema
-- This will drop and recreate the table with all required columns

-- Drop existing users table (WARNING: This will delete all user data)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with complete schema
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vendor')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_vendor_created BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  phone_verification_otp VARCHAR(6),
  phone_verification_expires TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: Qwerty#125656)
INSERT INTO users (email, password_hash, full_name, role, is_verified, is_email_verified, is_phone_verified, is_active) VALUES
('sahilcodebrew77@gmail.com', 'UXdlcnR5IzEyNTY1NnNhbHQ=', 'Sahil Code Brew', 'admin', TRUE, TRUE, TRUE, TRUE);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Enable read access for authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for admin users" ON users
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE email = auth.email() AND role = 'admin'
  ));

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Show the new table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
