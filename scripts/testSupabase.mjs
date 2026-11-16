import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwdmplcjqrwpctjodxeh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZG1wbGNqcXJ3cGN0am9keGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3OTM0MjUsImV4cCI6MjExMDM2OTQyNX0.K6Nkgr9ISkXTR-h-lH65kFg_1KxcLTUICre-SB0zjbk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('pockets').select('*');
    if (error) {
      console.log('Supabase response error:', error.message);
    } else {
      console.log('SUCCESS: Connected to Supabase! Pockets table exists. Current rows:', data.length);
    }
  } catch (err) {
    console.error('Network or client error:', err.message);
  }
}

test();
