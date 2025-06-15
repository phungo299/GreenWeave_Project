const axios = require('axios');

async function testPayOSAPI() {
  try {
    console.log('🧪 Testing PayOS API directly...');
    
    const response = await axios.post('http://localhost:5000/api/payos/create-payment-link', {
      orderId: 'test-' + Date.now(),
      amount: 1000,
      description: 'Test payment direct',
      returnUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testPayOSAPI(); 