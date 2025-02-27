/*
  # Update user entries schema and policies

  1. Changes
    - Safely adds user_id column if it doesn't exist
    - Updates RLS policies for user-specific access
  
  2. Security
    - Ensures RLS policies exist for user data isolation
    - Policies restrict users to only access their own data
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE entries ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Allow authenticated users to read entries" ON entries;
  DROP POLICY IF EXISTS "Allow authenticated users to insert entries" ON entries;
  DROP POLICY IF EXISTS "Allow authenticated users to delete entries" ON entries;
  
  -- Only create new policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entries' AND policyname = 'Users can read own entries'
  ) THEN
    CREATE POLICY "Users can read own entries"
      ON entries FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entries' AND policyname = 'Users can insert own entries'
  ) THEN
    CREATE POLICY "Users can insert own entries"
      ON entries FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entries' AND policyname = 'Users can delete own entries'
  ) THEN
    CREATE POLICY "Users can delete own entries"
      ON entries FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;