// Test PayOS service với mock data
const PayOSService = require('./dist/services/payosService.js').default;

async function testPayOSService() {
  console.log('🧪 Testing PayOS Service directly...');
  
  try {
    const linkData = {
      orderId: 'test-order-' + Date.now(),
      amount: 260000,
      description: 'Test payment for order',
      returnUrl: 'http://localhost:3000/payment/success',
      cancelUrl: 'http://localhost:3000/payment/cancel'
    };
    
    console.log('📋 Input data:', JSON.stringify(linkData, null, 2));
    
    const result = await PayOSService.createPaymentLink(linkData);
    
    console.log('📤 PayOS Service Result:');
    console.log('  - Success:', result.success);
    console.log('  - Has data:', !!result.data);
    console.log('  - Has checkoutUrl:', !!(result.data && result.data.checkoutUrl));
    console.log('  - Full result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data && result.data.checkoutUrl) {
      console.log('✅ PayOS Service working correctly!');
    } else {
      console.log('❌ PayOS Service issue detected');
    }
    
  } catch (error) {
    console.log('❌ Error testing PayOS Service:', error.message);
  }
}

testPayOSService(); 