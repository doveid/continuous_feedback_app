/*
  # Remove authentication requirements

  1. Changes
    - Remove RLS policies that depend on authentication
    - Add new policies that allow all operations
    - Keep basic data validation

  2. Security Note
    - This is a simplified version without authentication
    - All operations are allowed but data integrity is maintained
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Professors can create activities" ON activities;
DROP POLICY IF EXISTS "Professors can view their activities" ON activities;
DROP POLICY IF EXISTS "Students can view activities with valid access code" ON activities;
DROP POLICY IF EXISTS "Anyone can create feedback" ON feedback;
DROP POLICY IF EXISTS "Professors can view feedback for their activities" ON feedback;
DROP POLICY IF EXISTS "Students can view feedback for activities they have access to" ON feedback;

-- Create new policies for activities
CREATE POLICY "Allow all operations on activities"
  ON activities
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for feedback
CREATE POLICY "Allow all operations on feedback"
  ON feedback
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alter professor_id to be nullable since we don't use auth
ALTER TABLE activities ALTER COLUMN professor_id DROP NOT NULL;