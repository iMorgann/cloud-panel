/*
  # Add config rating functionality
  
  1. Changes
    - Add user_ratings table to track individual ratings
    - Add function to calculate average rating
    - Add policies for rating management
    
  2. Security
    - Enable RLS on user_ratings table
    - Add policies for authenticated users
    - Prevent multiple ratings from same user
*/

-- Create user_ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES configs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(config_id, user_id)
);

-- Enable RLS
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all ratings"
  ON user_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can rate once per config"
  ON user_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON user_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update config rating
CREATE OR REPLACE FUNCTION update_config_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE configs
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM user_ratings
    WHERE config_id = NEW.config_id
  )
  WHERE id = NEW.config_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rating updates
CREATE TRIGGER update_config_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_config_rating();