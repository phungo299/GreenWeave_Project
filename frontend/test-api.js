const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testOrderData = {
  userId: '507f1f77bcf86cd799439011', // Fake ObjectId for test
  items: [
    {
      productId: 'test-product-1',
      quantity: 1,
      price: 1000,
      name: 'Sản phẩm test PayOS'
    }
  ],
  totalAmount: 1000,
  shippingCost: 0,
  paymentMethod: 'PAYOS'
};

async function testFrontendFlow() {
  try {
    console.log('🧪 Testing Frontend API Flow...\n');
    
    // Step 1: Test createTestOrder (same as frontend calls)
    console.log('📦 Step 1: Creating test order...');
    const orderResponse = await axios.post(`${BASE_URL}/orders/create-test`, testOrderData);
    
    console.log('✅ Order Response Structure:');
    console.log('- Success:', orderResponse.data.success);
    console.log('- Message:', orderResponse.data.message);
    console.log('- Data:', orderResponse.data.data);
    
    if (!orderResponse.data?.data?.orderId) {
      console.error('❌ Missing orderId in response');
      return;
    }
    
    const orderId = orderResponse.data.data.orderId;
    console.log('✅ Order ID extracted:', orderId);
    
    // Step 2: Test createPaymentLink (with auth - will fail but shows structure)
    console.log('\n💳 Step 2: Testing payment link creation...');
    const paymentData = {
      orderId: orderId,
      amount: 1000,
      description: `Test PayOS - Order #${orderId}`,
      returnUrl: 'http://localhost:3000/payment/success',
      cancelUrl: 'http://localhost:3000/payment/cancel'
    };
    
    try {
      const paymentResponse = await axios.post(`${BASE_URL}/payos/create-payment-link`, paymentData);
      console.log('✅ Payment Response:', paymentResponse.data);
    } catch (authError) {
      console.log('⚠️ Expected auth error (normal for test):', authError.response?.data?.message);
      
      // Try test endpoint
      console.log('🔄 Trying test endpoint...');
      const testPaymentResponse = await axios.post(`${BASE_URL}/payos/test/create-payment-link`, paymentData);
      console.log('✅ Test Payment Response:', testPaymentResponse.data);
    }
    
    console.log('\n🎉 Frontend API flow test completed!');
    console.log('📋 The issue might be in frontend response handling.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendFlow(); 