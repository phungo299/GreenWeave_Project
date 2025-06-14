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

async function testCreateTestOrder() {
  try {
    console.log('🧪 Testing createTestOrder endpoint...');
    
    const response = await axios.post(`${BASE_URL}/orders/create-test`, testOrderData);
    
    console.log('✅ Test Order Created Successfully:');
    console.log('Order ID:', response.data.data.orderId);
    console.log('Order Code:', response.data.data.orderCode);
    console.log('Total Amount:', response.data.data.totalAmount);
    console.log('Status:', response.data.data.status);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error creating test order:', error.response?.data || error.message);
    return null;
  }
}

async function testCreatePaymentLink(orderId) {
  try {
    console.log('\n💳 Testing createPaymentLink endpoint...');
    
    const paymentData = {
      orderId: orderId,
      amount: 1000,
      description: `Test PayOS - Order #${orderId}`,
      returnUrl: 'http://localhost:3000/payment/success',
      cancelUrl: 'http://localhost:3000/payment/cancel'
    };
    
    // Use test endpoint without auth
    const response = await axios.post(`${BASE_URL}/payos/test/create-payment-link`, paymentData);
    
    console.log('✅ Payment Link Created Successfully:');
    console.log('Checkout URL:', response.data.data.checkoutUrl);
    console.log('Order Code:', response.data.data.orderCode);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error creating payment link:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting PayOS Integration Tests...\n');
  
  // Test 1: Create test order
  const order = await testCreateTestOrder();
  if (!order) {
    console.log('❌ Test failed at order creation');
    return;
  }
  
  // Test 2: Create payment link
  const payment = await testCreatePaymentLink(order.orderId);
  if (!payment) {
    console.log('❌ Test failed at payment link creation');
    return;
  }
  
  console.log('\n🎉 All tests passed! PayOS integration is working.');
  console.log('\n📋 Next steps:');
  console.log('1. Visit http://localhost:3000/payment-test');
  console.log('2. Login and test the payment flow');
  console.log('3. Check the payment link:', payment.checkoutUrl);
}

// Run tests
runTests().catch(console.error); 