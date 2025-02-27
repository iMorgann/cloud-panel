/*
  # Enhanced Statistics Functions

  1. New Functions
    - get_domain_stats: Extracts and counts unique domains from entries
    - get_user_stats: Analyzes unique usernames from entries
    - get_entry_stats: Provides comprehensive entry statistics

  2. Changes
    - Added SQL functions for statistical analysis
    - Functions are restricted to authenticated users only
*/

-- Function to extract and count unique domains
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
      split_part(split_part(content, ':', 1), '//', 2) as domain
    FROM entries
    WHERE user_id = p_user_id
    AND content LIKE '%://%'
  )
  SELECT 
    domain,
    COUNT(*) as count
  FROM parsed_domains
  WHERE domain != ''
  GROUP BY domain
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze unique usernames
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
RETURNS TABLE (
  total_unique_users bigint,
  most_common_users json
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH parsed_users AS (
    SELECT split_part(content, ':', 2) as username
    FROM entries
    WHERE user_id = p_user_id
    AND content LIKE '%:%:%'
  )
  SELECT 
    COUNT(DISTINCT username) as total_unique_users,
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
    WHERE username != ''
    GROUP BY username
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) top_users;
END;
$$ LANGUAGE plpgsql;

-- Function to get comprehensive entry statistics
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
  SELECT
    COUNT(*)::bigint as total_entries,
    COUNT(DISTINCT split_part(split_part(content, ':', 1), '//', 2))::bigint as unique_domains,
    COUNT(DISTINCT split_part(content, ':', 2))::bigint as unique_users,
    MAX(created_at) as latest_upload,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::bigint as entries_last_24h
  FROM entries
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_domain_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_entry_stats TO authenticated;