/*
  # Add Login Statistics Functions
  
  1. New Functions
    - get_login_stats: Returns statistics about new vs existing logins
      - total_logins: Total number of logins
      - new_logins_24h: Number of new unique logins in last 24h
      - existing_logins_24h: Number of existing logins seen again in last 24h
      - new_vs_existing_ratio: Percentage of new vs existing logins
*/

-- Function to get login statistics
CREATE OR REPLACE FUNCTION public.get_login_stats(p_user_id uuid)
RETURNS TABLE (
  total_logins bigint,
  new_logins_24h bigint,
  existing_logins_24h bigint,
  new_vs_existing_ratio numeric
) SECURITY DEFINER
AS $$
DECLARE
  total_24h bigint;
BEGIN
  -- Get counts for the last 24 hours
  WITH login_stats AS (
    SELECT
      content,
      created_at,
      -- Check if this login combination appeared before this entry
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
  )
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE NOT is_existing)::bigint,
    COUNT(*) FILTER (WHERE is_existing)::bigint,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND(
          (COUNT(*) FILTER (WHERE NOT is_existing)::numeric / COUNT(*)::numeric) * 100,
          2
        )
      ELSE 0
    END
  INTO
    total_24h,
    new_logins_24h,
    existing_logins_24h,
    new_vs_existing_ratio
  FROM login_stats;

  -- Get total all-time logins
  SELECT COUNT(*)::bigint INTO total_logins
  FROM entries
  WHERE user_id = p_user_id;

  RETURN QUERY
  SELECT
    total_logins,
    new_logins_24h,
    existing_logins_24h,
    new_vs_existing_ratio;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_login_stats TO authenticated;