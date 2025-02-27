/*
  # Update domain stats function

  1. Changes
    - Drop existing function to allow return type modification
    - Recreate function with new return type (domain_name instead of domain)
    - Add table aliases for better clarity
    - Improve column naming consistency
  
  2. Security
    - Maintain SECURITY DEFINER setting
    - Preserve execute permissions for authenticated users
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_domain_stats(uuid);

-- Create the function with new return type
CREATE OR REPLACE FUNCTION public.get_domain_stats(p_user_id uuid)
RETURNS TABLE (
  domain_name text,
  count bigint
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH parsed_domains AS (
    SELECT 
      split_part(split_part(content, ':', 1), '//', 2) as domain_name
    FROM entries e
    WHERE e.user_id = p_user_id
    AND e.content LIKE '%://%'
  )
  SELECT 
    pd.domain_name,
    COUNT(*) as count
  FROM parsed_domains pd
  WHERE pd.domain_name != ''
  GROUP BY pd.domain_name
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_domain_stats(uuid) TO authenticated;