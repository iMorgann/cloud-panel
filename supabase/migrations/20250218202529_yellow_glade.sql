/*
  # Add Config Statistics Functions
  
  1. New Functions
    - get_config_stats: Returns statistics about different config types
    - get_config_type_stats: Returns detailed stats for each config type
  
  2. Changes
    - Adds new functions for tracking config uploads
    - Provides detailed statistics for each config type
*/

-- Function to get overall config statistics
CREATE OR REPLACE FUNCTION public.get_config_stats(p_user_id uuid)
RETURNS TABLE (
  total_configs bigint,
  configs_last_24h bigint,
  unique_config_types bigint
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_configs,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::bigint as configs_last_24h,
    COUNT(DISTINCT type)::bigint as unique_config_types
  FROM entries
  WHERE user_id = p_user_id
  AND type != 'credential';
END;
$$ LANGUAGE plpgsql;

-- Function to get statistics for each config type
CREATE OR REPLACE FUNCTION public.get_config_type_stats(p_user_id uuid)
RETURNS TABLE (
  config_type text,
  count bigint,
  last_upload timestamptz
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.type as config_type,
    COUNT(*)::bigint as count,
    MAX(e.created_at) as last_upload
  FROM entries e
  WHERE e.user_id = p_user_id
  AND e.type != 'credential'
  GROUP BY e.type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_config_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_config_type_stats TO authenticated;