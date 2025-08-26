import { createClient } from '@supabase/supabase-js';

// You'll need to get these from your Supabase project dashboard
const SUPABASE_URL = 'https://mcxmrlaiteoiskwvlghg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jeG1ybGFpdGVvaXNrd3ZsZ2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDU4NDIsImV4cCI6MjA3MTEyMTg0Mn0.zbayNFmJ-Fhe89gy04dftxfwfty7I2ifph__eTnTzoE';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table names
export const TABLES = {
  USERS: 'users',
  PROFILES: 'profiles',
  NOTIFICATIONS: 'notifications',
  EMERGENCIES: 'emergencies',
  FRIEND_REQUESTS: 'friend_requests',
  FRIENDS: 'friends'
} as const;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return SUPABASE_URL.includes('supabase.co') && SUPABASE_ANON_KEY.length > 50;
};
