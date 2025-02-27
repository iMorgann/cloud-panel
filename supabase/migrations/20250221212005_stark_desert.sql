/*
  # Optimize login stats and add duplicate detection

  1. Changes
    - Add unique constraint on content per user to prevent duplicates
    - Add index for faster duplicate checking
    - Update login stats function for better performance

  2. Security
    - Function remains SECURITY DEFINER
    - Limited to authenticated users
*/

-- Add unique constraint to prevent duplicates per user
ALTER TABLE entries 
ADD CONSTRAINT unique_content_per_user UNIQUE (user_id, content);

-- Create index for faster duplicate checking
CREATE INDEX IF NOT EXISTS idx_entries_content_user_id 
  ON entries(content, user_id);

-- Update login stats function for better performance
CREATE OR REPLACE FUNCTION public.get_login_stats(p_user_id uuid)
RETURNS TABLE (
  total_logins bigint,
  new_logins_24h bigint,
  existing_logins_24h bigint,
  new_vs_existing_ratio numeric
) SECURITY DEFINER
AS $$
DECLARE
  v_total_logins bigint;
  v_new_logins bigint;
  v_existing_logins bigint;
BEGIN
  -- Get total logins
  SELECT COUNT(*)
  INTO v_total_logins
  FROM entries
  WHERE user_id = p_user_id;

  -- Get 24h stats with optimized query
  WITH recent_logins AS (
    SELECT
      content,
      created_at,
      LAG(created_at) OVER (PARTITION BY content ORDER BY created_at) as prev_entry
    FROM entries
    WHERE user_id = p_user_id
      AND created_at > NOW() - INTERVAL '24 hours'
  )
  SELECT
    COUNT(*) FILTER (WHERE prev_entry IS NULL),
    COUNT(*) FILTER (WHERE prev_entry IS NOT NULL)
  INTO
    v_new_logins,
    v_existing_logins
  FROM recent_logins;

  RETURN QUERY
  SELECT
    v_total_logins,
    COALESCE(v_new_logins, 0),
    COALESCE(v_existing_logins, 0),
    CASE 
      WHEN COALESCE(v_new_logins, 0) + COALESCE(v_existing_logins, 0) > 0 
      THEN ROUND(
        (COALESCE(v_new_logins, 0)::numeric / 
        (COALESCE(v_new_logins, 0) + COALESCE(v_existing_logins, 0))::numeric) * 100,
        2
      )
      ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_login_stats TO authenticated;