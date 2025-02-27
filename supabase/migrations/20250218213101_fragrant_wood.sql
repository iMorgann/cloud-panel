/*
  # Fix domain stats function
  
  1. Changes
    - Fixed ambiguous column reference in get_domain_stats
    - Improved column aliasing
    - Enhanced query structure
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_domain_stats(uuid);

-- Recreate domain stats function with fixed column references
CREATE OR REPLACE FUNCTION public.get_domain_stats(p_user_id uuid)
RETURNS TABLE (
  domain_name text,
  entry_count bigint
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
      END as extracted_domain
    FROM entries
    WHERE user_id = p_user_id
    AND content LIKE '%://%'
  )
  SELECT 
    pd.extracted_domain as domain_name,
    COUNT(*) as entry_count
  FROM parsed_domains pd
  WHERE pd.extracted_domain IS NOT NULL 
    AND pd.extracted_domain != ''
  GROUP BY pd.extracted_domain
  ORDER BY entry_count DESC, pd.extracted_domain;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_domain_stats TO authenticated;