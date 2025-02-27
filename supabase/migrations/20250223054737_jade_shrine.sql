/*
  # Add Configs and Notifications System

  1. New Tables
    - `configs`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `content` (text)
      - `user_id` (uuid, references auth.users)
      - `status` (text)
      - `downloads` (int)
      - `rating` (float)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `notifications`
      - `id` (uuid, primary key)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `user_id` (uuid, references auth.users)
      - `read` (boolean)
      - `data` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create configs table
CREATE TABLE public.configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  downloads int NOT NULL DEFAULT 0,
  rating float DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  read boolean DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Configs policies
CREATE POLICY "Users can view all configs"
  ON public.configs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own configs"
  ON public.configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configs"
  ON public.configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create config notification
CREATE OR REPLACE FUNCTION public.create_config_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    type,
    title,
    message,
    user_id,
    data
  ) VALUES (
    'config_upload',
    'New Config Upload',
    'A new ' || NEW.type || ' config has been uploaded: ' || NEW.name,
    NEW.user_id,
    jsonb_build_object(
      'config_id', NEW.id,
      'config_name', NEW.name,
      'config_type', NEW.type
    )
  );
  
  -- Also notify chat room about new config
  INSERT INTO public.messages (
    content,
    user_id,
    username,
    room
  ) VALUES (
    '🔔 New ' || NEW.type || ' config uploaded: ' || NEW.name,
    NEW.user_id,
    (SELECT email FROM auth.users WHERE id = NEW.user_id),
    'configs'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for config notifications
CREATE TRIGGER config_notification_trigger
  AFTER INSERT ON public.configs
  FOR EACH ROW
  EXECUTE FUNCTION public.create_config_notification();

-- Grant necessary permissions
GRANT ALL ON public.configs TO authenticated;
GRANT ALL ON public.notifications TO authenticated;