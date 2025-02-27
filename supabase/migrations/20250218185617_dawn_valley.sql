/*
  # Add user_id to entries table and update RLS policies

  1. Changes
    - Add user_id column to entries table
    - Update RLS policies to enforce user-based access control

  2. Security
    - Entries are now tied to specific users
    - Users can only access their own entries
*/

-- Add user_id column
ALTER TABLE entries ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read entries" ON entries;
DROP POLICY IF EXISTS "Allow authenticated users to insert entries" ON entries;
DROP POLICY IF EXISTS "Allow authenticated users to delete entries" ON entries;

-- Create new policies
CREATE POLICY "Users can read own entries"
  ON entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);