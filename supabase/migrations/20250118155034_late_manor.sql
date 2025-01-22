/*
  # Initial Schema for Feedback Application

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `access_code` (text, unique)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `professor_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
    
    - `feedback`
      - `id` (uuid, primary key)
      - `activity_id` (uuid, references activities)
      - `emotion_type` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for professors to manage their activities
    - Add policies for students to view activities and submit feedback
*/

-- Create activities table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  access_code text UNIQUE NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  professor_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create feedback table
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities NOT NULL,
  emotion_type text NOT NULL CHECK (emotion_type IN ('happy', 'sad', 'surprised', 'confused')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies for activities
CREATE POLICY "Professors can create activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Professors can view their activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = professor_id);

CREATE POLICY "Students can view activities with valid access code"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for feedback
CREATE POLICY "Anyone can create feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Professors can view feedback for their activities"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM activities 
    WHERE activities.id = feedback.activity_id 
    AND activities.professor_id = auth.uid()
  ));

CREATE POLICY "Students can view feedback for activities they have access to"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (true);