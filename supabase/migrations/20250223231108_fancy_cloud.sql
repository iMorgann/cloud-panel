/*
  # Add S3 configuration

  1. New Table
    - `s3_config`
      - `id` (uuid, primary key)
      - `access_key_id` (text)
      - `secret_access_key` (text, encrypted)
      - `bucket_name` (text)
      - `region` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `s3_config` table
    - Add policies for authenticated users
    - Use built-in encryption for sensitive data
*/

-- Create extension for encryption if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create S3 config table
CREATE TABLE IF NOT EXISTS s3_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key_id text NOT NULL,
  secret_access_key text NOT NULL,
  bucket_name text NOT NULL,
  region text NOT NULL DEFAULT 'us-east-1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE s3_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read s3 config"
  ON s3_config FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial config (encrypted)
INSERT INTO s3_config (
  access_key_id,
  secret_access_key,
  bucket_name,
  region
) VALUES (
  'd505ed0bbb061eba4892b69e5402fe06',
  encode(
    pgp_sym_encrypt(
      '7b4f45874b264b522434c4532393d32c0ffe2472d80c57792e0e7c6bb729119f',
      gen_salt('bf')
    )::bytea,
    'base64'
  ),
  'cloud-panel-storage',
  'us-east-1'
);

-- Create function to get S3 config
CREATE OR REPLACE FUNCTION get_s3_config()
RETURNS TABLE (
  access_key_id text,
  secret_access_key text,
  bucket_name text,
  region text
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.access_key_id,
    convert_from(
      pgp_sym_decrypt(
        decode(s.secret_access_key, 'base64')::bytea,
        gen_salt('bf')
      ),
      'utf8'
    ) as secret_access_key,
    s.bucket_name,
    s.region
  FROM s3_config s
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_s3_config TO authenticated;