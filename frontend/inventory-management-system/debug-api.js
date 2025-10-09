// Debug script to test the API endpoint
const API_URL =
  'https://orderservice-337812374841.us-central1.run.app/api/orders/all';

async function testAPI() {
  console.log('🔍 Testing API endpoint:', API_URL);

  // Test 1: Simple fetch without authentication
  console.log('\n1️⃣ Testing without authentication...');
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ Network/CORS error:', error.message);
  }

  // Test 2: With authentication (if token exists)
  const token = localStorage.getItem('inventory_auth_token');
  if (token) {
    console.log('\n2️⃣ Testing with authentication...');
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success with auth:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ Error with auth:', errorText);
      }
    } catch (error) {
      console.log('❌ Network/CORS error with auth:', error.message);
    }
  } else {
    console.log('\n2️⃣ No auth token found in localStorage');
  }

  // Test 3: CORS preflight check
  console.log('\n3️⃣ Testing CORS preflight...');
  try {
    const response = await fetch(API_URL, {
      method: 'OPTIONS',
    });
    console.log('OPTIONS Status:', response.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers.get(
        'Access-Control-Allow-Origin'
      ),
      'Access-Control-Allow-Methods': response.headers.get(
        'Access-Control-Allow-Methods'
      ),
      'Access-Control-Allow-Headers': response.headers.get(
        'Access-Control-Allow-Headers'
      ),
    });
  } catch (error) {
    console.log('❌ CORS preflight error:', error.message);
  }
}

// Run the test
testAPI();
