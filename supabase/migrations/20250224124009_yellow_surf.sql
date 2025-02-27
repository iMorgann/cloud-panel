-- Create entry validation table
CREATE TABLE IF NOT EXISTS entry_validation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL,
  description text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default validation patterns
INSERT INTO entry_validation (pattern, description) VALUES
  ('^https?:\/\/.+:.+:.+$', 'URL:LOGIN:PASS format'),
  ('^[^:]+:[^:]+$', 'EMAIL:PASSWORD format');

-- Create entry logs table
CREATE TABLE IF NOT EXISTS entry_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_entry_stats(uuid);
DROP FUNCTION IF EXISTS public.validate_entry(text);
DROP FUNCTION IF EXISTS public.process_entry(text, uuid);

-- Create materialized view for entry statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS entry_stats AS
WITH domain_stats AS (
  SELECT 
    user_id,
    COUNT(DISTINCT 
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
  GROUP BY user_id
),
user_stats AS (
  SELECT 
    user_id,
    COUNT(DISTINCT split_part(content, ':', 2)) as unique_users
  FROM entries
  GROUP BY user_id
)
SELECT
  e.user_id,
  COUNT(*) as total_entries,
  d.unique_domains,
  u.unique_users,
  COUNT(*) FILTER (WHERE e.created_at > NOW() - INTERVAL '24 hours') as entries_24h,
  MAX(e.created_at) as latest_entry
FROM entries e
LEFT JOIN domain_stats d ON e.user_id = d.user_id
LEFT JOIN user_stats u ON e.user_id = u.user_id
GROUP BY e.user_id, d.unique_domains, u.unique_users;

-- Create index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_entry_stats_user_id ON entry_stats (user_id);

-- Function to refresh entry stats
CREATE OR REPLACE FUNCTION refresh_entry_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY entry_stats;
END $$;

-- Function to validate entry format
CREATE OR REPLACE FUNCTION validate_entry(p_content text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM entry_validation 
    WHERE is_active = true 
    AND p_content ~ pattern
  );
END $$;

-- Function to process new entry
CREATE OR REPLACE FUNCTION process_entry(
  p_content text,
  p_user_id uuid
)
RETURNS TABLE (
  success boolean,
  message text,
  entry_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entry_id uuid;
  v_is_valid boolean;
BEGIN
  -- Validate entry format
  SELECT validate_entry(p_content) INTO v_is_valid;
  
  IF NOT v_is_valid THEN
    RETURN QUERY SELECT false, 'Invalid entry format', NULL::uuid;
    RETURN;
  END IF;

  -- Check for duplicates
  IF EXISTS (
    SELECT 1 FROM entries 
    WHERE user_id = p_user_id AND content = p_content
  ) THEN
    RETURN QUERY SELECT false, 'Duplicate entry', NULL::uuid;
    RETURN;
  END IF;

  -- Insert entry
  INSERT INTO entries (content, user_id, type)
  VALUES (p_content, p_user_id, 'credential')
  RETURNING id INTO v_entry_id;

  -- Log the action
  INSERT INTO entry_logs (user_id, action, details)
  VALUES (
    p_user_id,
    'insert',
    jsonb_build_object(
      'entry_id', v_entry_id,
      'content_length', length(p_content)
    )
  );

  -- Refresh stats if needed
  IF (SELECT COUNT(*) FROM entries WHERE user_id = p_user_id) % 100 = 0 THEN
    PERFORM refresh_entry_stats();
  END IF;

  RETURN QUERY SELECT true, 'Entry processed successfully', v_entry_id;
END $$;

-- Function to get entry statistics
CREATE OR REPLACE FUNCTION get_entry_stats(p_user_id uuid)
RETURNS TABLE (
  total_entries bigint,
  unique_domains bigint,
  unique_users bigint,
  entries_last_24h bigint,
  latest_upload timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    es.total_entries,
    es.unique_domains,
    es.unique_users,
    es.entries_24h,
    es.latest_entry
  FROM entry_stats es
  WHERE es.user_id = p_user_id;
END $$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_entry(text) TO authenticated;
GRANT EXECUTE ON FUNCTION process_entry(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_entry_stats(uuid) TO authenticated;

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_entries_content ON entries(content);
CREATE INDEX IF NOT EXISTS idx_entries_user_created ON entries (user_id, created_at DESC);

-- Enable RLS on new tables
ALTER TABLE entry_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view validation rules"
  ON entry_validation FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view own logs"
  ON entry_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);