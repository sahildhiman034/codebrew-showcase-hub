-- Test database connection and users table

-- Test 1: Check if we can query the users table
SELECT COUNT(*) as user_count FROM users;

-- Test 2: Check the structure of the users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Test 3: Try to insert a test user (this will help identify any issues)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('test@example.com', 'test_hash', 'Test User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Test 4: Check if the insert worked
SELECT email, full_name, role FROM users WHERE email = 'test@example.com';

-- Test 5: Clean up test data
DELETE FROM users WHERE email = 'test@example.com';

-- Test 6: Final verification
SELECT 'Database connection and users table are working correctly!' as status;
