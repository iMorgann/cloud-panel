import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client with error handling
export const supabase = createClient(
  supabaseUrl || 'https://lovartnrkgaeunmsslyj.supabase.co',
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdmFydG5ya2dhZXVubXNzbHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1ODYwMzIsImV4cCI6MjA1NjE2MjAzMn0.vfw230QdvSNW2D0esggvAaXxKR_UKZ9hU3mmyNMLfmE'
);