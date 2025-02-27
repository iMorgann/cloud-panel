/*
  # Fix Configs RLS Policies

  1. Security Changes
    - Drop existing policies
    - Add new RLS policies for configs table
    - Grant necessary permissions
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all configs" ON public.configs;
DROP POLICY IF EXISTS "Users can insert own configs" ON public.configs;
DROP POLICY IF EXISTS "Users can update own configs" ON public.configs;

-- Create new policies
CREATE POLICY "Anyone can view configs"
  ON public.configs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert configs"
  ON public.configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configs"
  ON public.configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own configs"
  ON public.configs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;