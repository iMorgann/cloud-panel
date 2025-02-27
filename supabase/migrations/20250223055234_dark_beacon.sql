/*
  # Add Messages Table and Update Configs Display

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references auth.users)
      - `username` (text)
      - `room` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  username text NOT NULL,
  room text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view all messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.messages TO authenticated;