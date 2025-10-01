// Simple test script to verify profile API functionality
const API_BASE_URL = 'http://localhost:3000';

async function testProfileAPI() {
  console.log('🧪 Testing Profile API endpoints...');

  try {
    // Test 1: Try to get profile without user ID (should fail)
    console.log('\n1. Testing GET profile without userId...');
    const response1 = await fetch(`${API_BASE_URL}/api/profile`);
    const data1 = await response1.json();
    console.log('Status:', response1.status, 'Response:', data1);

    // Test 2: Try to update profile without user ID (should fail)
    console.log('\n2. Testing PUT profile without userId...');
    const response2 = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User' }),
    });
    const data2 = await response2.json();
    console.log('Status:', response2.status, 'Response:', data2);

    // Test 3: Try to upload profile picture without data (should fail)
    console.log('\n3. Testing POST profile picture without data...');
    const response3 = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data3 = await response3.json();
    console.log('Status:', response3.status, 'Response:', data3);

    console.log('\n✅ API endpoint tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProfileAPI().catch(console.error);