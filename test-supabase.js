const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
async function testSupabase() {
  // You need to update these with your actual credentials
  const SUPABASE_URL = 'https://mcxmrlaiteoiskwvlghg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jeG1ybGFpdGVvaXNrd3ZsZ2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDU4NDIsImV4cCI6MjA3MTEyMTg0Mn0.zbayNFmJ-Fhe89gy04dftxfwfty7I2ifph__eTnTzoE';

  // Credentials are now configured

  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test connection by getting server timestamp
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Connected to Supabase!');
        console.log('⚠️  Table "users" does not exist yet - this is normal');
        console.log('📋 Run the SQL commands from SUPABASE_SETUP.md to create tables');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Connected to Supabase!');
      console.log('✅ Table "users" exists');
    }
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test insert (this will fail if table doesn't exist, which is expected)
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([{
          email: 'test@example.com',
          display_name: 'Test User'
        }])
        .select();
      
      if (insertError) {
        console.log('⚠️  Insert test failed (expected if table not created):', insertError.message);
      } else {
        console.log('✅ Insert test successful:', insertData);
      }
    } catch (e) {
      console.log('⚠️  Insert test failed (expected if table not created)');
    }
    
    console.log('\n🎉 Supabase connection test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Create your database tables (see SUPABASE_SETUP.md)');
    console.log('2. Update your app configuration');
    console.log('3. Test your app with Supabase');
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check your Supabase URL and API key');
      console.log('2. Ensure your project is active');
      console.log('3. Check if you have internet connection');
    }
  }
}

// Run the test
testSupabase();
