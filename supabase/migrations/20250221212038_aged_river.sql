/*
  # Optimize login stats function
  
  1. Changes
    - Add index for faster queries
    - Optimize login stats function
    - Handle duplicate detection

  2. Security
    - Function remains SECURITY DEFINER
    - Limited to authenticated users
*/

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id_created_at 
  ON entries(user_id, created_at);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_login_stats(uuid);

-- Create optimized login stats function
CREATE OR REPLACE FUNCTION public.get_login_stats(p_user_id uuid)
RETURNS TABLE (
  total_logins bigint,
  new_logins_24h bigint,
  existing_logins_24h bigint,
  new_vs_existing_ratio numeric
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH login_stats AS (
    SELECT
      content,
      created_at,
      EXISTS (
        SELECT 1
        FROM entries e2
        WHERE e2.content = entries.content
          AND e2.user_id = entries.user_id
          AND e2.created_at < entries.created_at
      ) as is_existing
    FROM entries
    WHERE user_id = p_user_id
      AND created_at > NOW() - INTERVAL '24 hours'
  ),
  stats AS (
    SELECT
      (SELECT COUNT(*)::bigint FROM entries WHERE user_id = p_user_id) as total_logins,
      COUNT(*) FILTER (WHERE NOT is_existing)::bigint as new_logins,
      COUNT(*) FILTER (WHERE is_existing)::bigint as existing_logins
    FROM login_stats
  )
  SELECT
    total_logins,
    new_logins,
    existing_logins,
    CASE
      WHEN new_logins + existing_logins > 0 THEN
        ROUND((new_logins::numeric / (new_logins + existing_logins)::numeric) * 100, 2)
      ELSE 0
    END as ratio
  FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_login_stats TO authenticated;