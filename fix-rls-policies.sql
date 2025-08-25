-- Fix RLS policies for better access control
-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON demo_projects;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON demo_projects;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON live_clients;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON live_clients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON status_monitors;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON status_monitors;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON monitoring_alerts;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON monitoring_alerts;

-- Create more permissive policies for development
-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON demo_projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON live_clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON status_monitors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON monitoring_alerts
  FOR ALL USING (auth.role() = 'authenticated');

-- Also allow access for service role (for admin operations)
CREATE POLICY "Allow service role access" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role access" ON demo_projects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role access" ON live_clients
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role access" ON status_monitors
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role access" ON monitoring_alerts
  FOR ALL USING (auth.role() = 'service_role');
