// Test script để verify order cancellation fix
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testOrderCancellation() {
  console.log('🧪 Testing Order Cancellation Fix...\n');
  
  try {
    // 1. Create a test order first
    console.log('1️⃣ Creating test order...');
    const orderData = {
      userId: '684dd8be6210f6bad7d0c1d7', // Use existing user ID
      items: [
        {
          productId: '684644b2551f8f193314de93', // Use existing product ID
          quantity: 1,
          price: 220000,
          color: '#E5E7EB'
        }
      ],
      totalAmount: 225000,
      shippingCost: 5000,
      paymentMethod: 'PAYOS',
      shippingAddress: 'Test address for cancellation'
    };
    
    const createOrderResponse = await axios.post(`${BASE_URL}/orders/create`, orderData);
    
    if (!createOrderResponse.data.success) {
      console.error('❌ Failed to create test order:', createOrderResponse.data.message);
      return;
    }
    
    const orderId = createOrderResponse.data.data.orderId;
    console.log(`✅ Test order created: ${orderId}`);
    
    // 2. Check initial order status
    console.log('\n2️⃣ Checking initial order status...');
    const orderDetailsResponse = await axios.get(`${BASE_URL}/orders/${orderId}`);
    const initialOrder = orderDetailsResponse.data.data;
    
    console.log(`📋 Order Status: ${initialOrder.status}`);
    console.log(`💳 Payment Method: ${initialOrder.paymentMethod}`);
    console.log(`💰 Payment Status: ${initialOrder.paymentId?.status || 'No payment'}`);
    
    // 3. Cancel the order using new endpoint
    console.log('\n3️⃣ Cancelling order using new endpoint...');
    const cancelResponse = await axios.put(`${BASE_URL}/orders/${orderId}/cancel`);
    
    if (!cancelResponse.data.success) {
      console.error('❌ Failed to cancel order:', cancelResponse.data.message);
      return;
    }
    
    const cancelledOrder = cancelResponse.data.data;
    console.log(`✅ Order cancellation successful!`);
    
    // 4. Verify final statuses
    console.log('\n4️⃣ Verifying final statuses...');
    console.log(`📋 Final Order Status: ${cancelledOrder.status}`);
    console.log(`💳 Final Payment Status: ${cancelledOrder.paymentId?.status || 'No payment'}`);
    
    // 5. Validation checks
    console.log('\n5️⃣ Validation Results:');
    const validations = [
      { 
        name: 'Order Status Cancelled', 
        passed: cancelledOrder.status === 'cancelled',
        expected: 'cancelled',
        actual: cancelledOrder.status
      },
      { 
        name: 'Payment Status Cancelled', 
        passed: cancelledOrder.paymentId?.status === 'cancelled',
        expected: 'cancelled',
        actual: cancelledOrder.paymentId?.status || 'undefined'
      },
      { 
        name: 'Response Success Flag', 
        passed: cancelResponse.data.success === true,
        expected: 'true',
        actual: cancelResponse.data.success
      }
    ];
    
    validations.forEach(validation => {
      const status = validation.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${validation.name}: Expected "${validation.expected}", Got "${validation.actual}"`);
    });
    
    const allPassed = validations.every(v => v.passed);
    
    console.log(`\n🏁 Overall Test Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('🎉 Order cancellation fix is working correctly!');
    } else {
      console.log('⚠️  Some validations failed. Check the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
  }
}

// Run the test
testOrderCancellation(); 