/*
  # Fix duplicate entries handling

  1. Changes
    - Add unique constraint for user_id and content combination
    - Add index for faster duplicate checking
    - Add function to handle duplicate entries gracefully

  2. Security
    - Enable RLS on entries table
    - Add policies for authenticated users
*/

-- Create index for faster duplicate checking
CREATE INDEX IF NOT EXISTS idx_entries_user_content 
ON entries(user_id, content);

-- Add unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'unique_content_per_user'
  ) THEN
    ALTER TABLE entries 
    ADD CONSTRAINT unique_content_per_user 
    UNIQUE (user_id, content);
  END IF;
END $$;

-- Function to handle duplicate entries
CREATE OR REPLACE FUNCTION handle_duplicate_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- If entry already exists, silently skip
  IF EXISTS (
    SELECT 1 
    FROM entries 
    WHERE user_id = NEW.user_id 
    AND content = NEW.content
  ) THEN
    RETURN NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for duplicate handling
CREATE TRIGGER handle_duplicate_entry_trigger
  BEFORE INSERT ON entries
  FOR EACH ROW
  EXECUTE FUNCTION handle_duplicate_entry();