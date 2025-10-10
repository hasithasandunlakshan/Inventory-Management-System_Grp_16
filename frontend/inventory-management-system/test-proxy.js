// Simple test for the proxy API
async function testProxy() {
  const token = localStorage.getItem('inventory_auth_token');

  if (!token) {
    console.error('❌ No auth token found. Please log in first.');
    return;
  }

  console.log('🔍 Testing proxy API at /api/orders/all');

  try {
    const response = await fetch('/api/orders/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('📥 Proxy response:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Proxy success:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Proxy error:', errorText);
    }
  } catch (error) {
    console.log('❌ Proxy network error:', error);
  }
}

// Run the test
testProxy();
