/*
  # Update statistics functions
  
  1. Changes
    - Improved domain stats function with better URL parsing
    - Enhanced user stats function with proper username extraction
    - Optimized entry stats function with better aggregation
  
  2. Security
    - All functions are SECURITY DEFINER
    - Execute permissions granted to authenticated users only
*/

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_domain_stats(uuid);
DROP FUNCTION IF EXISTS public.get_user_stats(uuid);
DROP FUNCTION IF EXISTS public.get_entry_stats(uuid);

-- Improved domain stats function
CREATE OR REPLACE FUNCTION public.get_domain_stats(p_user_id uuid)
RETURNS TABLE (
  domain text,
  count bigint
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH parsed_domains AS (
    SELECT 
      CASE 
        WHEN position('//' IN content) > 0 THEN
          split_part(
            split_part(
              split_part(content, ':', 1),
              '//',
              2
            ),
            '/',
            1
          )
        ELSE NULL
      END as domain
    FROM entries
    WHERE user_id = p_user_id
    AND content LIKE '%://%'
  )
  SELECT 
    domain,
    COUNT(*) as count
  FROM parsed_domains
  WHERE domain IS NOT NULL AND domain != ''
  GROUP BY domain
  ORDER BY count DESC, domain;
END;
$$ LANGUAGE plpgsql;

-- Enhanced user stats function
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
RETURNS TABLE (
  total_unique_users bigint,
  most_common_users json
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH parsed_users AS (
    SELECT 
      NULLIF(trim(split_part(content, ':', 2)), '') as username
    FROM entries
    WHERE user_id = p_user_id
    AND content LIKE '%:%:%'
  )
  SELECT 
    COUNT(DISTINCT username)::bigint as total_unique_users,
    json_agg(
      json_build_object(
        'username', username,
        'count', user_count
      )
    ) as most_common_users
  FROM (
    SELECT 
      username,
      COUNT(*) as user_count
    FROM parsed_users
    WHERE username IS NOT NULL
    GROUP BY username
    ORDER BY user_count DESC, username
    LIMIT 5
  ) top_users;
END;
$$ LANGUAGE plpgsql;

-- Improved entry stats function
CREATE OR REPLACE FUNCTION public.get_entry_stats(p_user_id uuid)
RETURNS TABLE (
  total_entries bigint,
  unique_domains bigint,
  unique_users bigint,
  latest_upload timestamptz,
  entries_last_24h bigint
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH domain_counts AS (
    SELECT COUNT(DISTINCT 
      CASE 
        WHEN position('//' IN content) > 0 THEN
          split_part(
            split_part(
              split_part(content, ':', 1),
              '//',
              2
            ),
            '/',
            1
          )
        ELSE NULL
      END
    ) as unique_domains
    FROM entries
    WHERE user_id = p_user_id
    AND content LIKE '%://%'
  ),
  user_counts AS (
    SELECT COUNT(DISTINCT 
      NULLIF(trim(split_part(content, ':', 2)), '')
    ) as unique_users
    FROM entries
    WHERE user_id = p_user_id
    AND content LIKE '%:%:%'
  )
  SELECT
    COUNT(*)::bigint as total_entries,
    dc.unique_domains::bigint,
    uc.unique_users::bigint,
    MAX(e.created_at) as latest_upload,
    COUNT(*) FILTER (WHERE e.created_at > NOW() - INTERVAL '24 hours')::bigint as entries_last_24h
  FROM entries e
  CROSS JOIN domain_counts dc
  CROSS JOIN user_counts uc
  WHERE e.user_id = p_user_id
  GROUP BY dc.unique_domains, uc.unique_users;
END;
$$ LANGUAGE plpgsql;

-- Ensure execute permissions are granted
GRANT EXECUTE ON FUNCTION public.get_domain_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_entry_stats TO authenticated;