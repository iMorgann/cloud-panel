-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_domain_stats(uuid);

-- Create optimized domain stats function with unambiguous column names
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

-- Create index for better domain extraction performance
CREATE INDEX IF NOT EXISTS idx_entries_content_domain 
ON entries ((
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
)) WHERE content LIKE '%://%';

-- Create index for user_id and content for faster duplicate checking
CREATE INDEX IF NOT EXISTS idx_entries_user_content 
ON entries(user_id, content);

-- Add unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'unique_content_per_user'
  ) THEN
    ALTER TABLE entries 
    ADD CONSTRAINT unique_content_per_user 
    UNIQUE (user_id, content);
  END IF;
END $$;