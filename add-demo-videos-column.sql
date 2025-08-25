-- Add demo_videos column to demo_projects table
ALTER TABLE demo_projects 
ADD COLUMN IF NOT EXISTS demo_videos TEXT[] DEFAULT '{}';

-- Update existing records to have empty demo_videos array
UPDATE demo_projects 
SET demo_videos = '{}' 
WHERE demo_videos IS NULL;

-- Make sure the column is not null
ALTER TABLE demo_projects 
ALTER COLUMN demo_videos SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN demo_projects.demo_videos IS 'Array of demo video URLs for this project';
