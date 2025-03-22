// Load environment variables
require('dotenv').config({ path: '../../../../node-backend/.env' });

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and/or anonymous key are missing. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertScan(email, scanNumber, scanData) {
  console.log('Inserting scan...');

  const { data, error } = await supabase
    .from('scans')
    .insert([
      {
        email: email,
        scan_number: scanNumber,
        scan: scanData, // This should be a JSON object
        scan_date: new Date().toISOString(), // Current date and time
      },
    ]);

  if (error) {
    console.error('Error inserting scan:', error);
    return null;
  } else {
    console.log('Scan inserted successfully:', data);
    return data;
  }
}

// Example usage
const email = 'user@example.com';
const scanNumber = 12345; // Replace with your scan number
const scanData = {
  type: 'qr_code',
  content: 'https://example.com',
  metadata: {
    device: 'scanner_001',
    location: 'warehouse',
  },
};

insertScan(email, scanNumber, scanData)
  .then((insertedScan) => {
    if (insertedScan) {
      console.log('Inserted scan:', insertedScan);
    }
  })
  .catch((err) => {
    console.error('Failed to insert scan:', err);
  });