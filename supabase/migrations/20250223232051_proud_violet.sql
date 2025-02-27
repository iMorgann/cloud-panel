-- Drop existing function
DROP FUNCTION IF EXISTS public.get_login_stats(uuid);

-- Create optimized login stats function with unambiguous column names
CREATE OR REPLACE FUNCTION public.get_login_stats(p_user_id uuid)
RETURNS TABLE (
  total_logins_count bigint,
  new_logins_24h_count bigint,
  existing_logins_24h_count bigint,
  new_vs_existing_ratio numeric
) SECURITY DEFINER
AS $$
DECLARE
  v_total_count bigint;
  v_new_count bigint;
  v_existing_count bigint;
BEGIN
  -- Get total logins
  SELECT COUNT(*)
  INTO v_total_count
  FROM entries
  WHERE user_id = p_user_id;

  -- Get 24h stats with optimized query
  WITH recent_logins AS (
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
  )
  SELECT
    COUNT(*) FILTER (WHERE NOT is_existing),
    COUNT(*) FILTER (WHERE is_existing)
  INTO
    v_new_count,
    v_existing_count
  FROM recent_logins;

  RETURN QUERY
  SELECT
    v_total_count as total_logins_count,
    COALESCE(v_new_count, 0) as new_logins_24h_count,
    COALESCE(v_existing_count, 0) as existing_logins_24h_count,
    CASE 
      WHEN COALESCE(v_new_count, 0) + COALESCE(v_existing_count, 0) > 0 
      THEN ROUND(
        (COALESCE(v_new_count, 0)::numeric / 
        (COALESCE(v_new_count, 0) + COALESCE(v_existing_count, 0))::numeric) * 100,
        2
      )
      ELSE 0
    END as new_vs_existing_ratio;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_login_stats TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_entries_user_created_at 
ON entries(user_id, created_at);