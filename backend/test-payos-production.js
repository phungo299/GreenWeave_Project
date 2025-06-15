// Test PayOS service với credentials thật
require('dotenv').config();

console.log('🔍 Checking PayOS Environment Variables:');
console.log('PAYOS_CLIENT_ID:', process.env.PAYOS_CLIENT_ID ? 'SET (' + process.env.PAYOS_CLIENT_ID.slice(0, 8) + '...)' : 'NOT SET');
console.log('PAYOS_API_KEY:', process.env.PAYOS_API_KEY ? 'SET (' + process.env.PAYOS_API_KEY.slice(0, 8) + '...)' : 'NOT SET');
console.log('PAYOS_CHECKSUM_KEY:', process.env.PAYOS_CHECKSUM_KEY ? 'SET (' + process.env.PAYOS_CHECKSUM_KEY.slice(0, 8) + '...)' : 'NOT SET');

// Import sau khi load env
const PayOSService = require('./dist/services/payosService.js').default;

async function testPayOSProduction() {
  console.log('\n🚀 Testing PayOS Service in Production Mode...');
  
  try {
    const linkData = {
      orderId: 'prod-test-' + Date.now(),
      amount: 1000, // 1000đ cho test
      description: 'Test PayOS Production Mode',
      returnUrl: 'http://localhost:3000/payment/success',
      cancelUrl: 'http://localhost:3000/payment/cancel'
    };
    
    console.log('📋 Input data:', JSON.stringify(linkData, null, 2));
    
    const result = await PayOSService.createPaymentLink(linkData);
    
    console.log('\n📤 PayOS Service Result:');
    if (result.success) {
      console.log('✅ SUCCESS: Payment link created');
      console.log('  - Checkout URL:', result.data.checkoutUrl);
      console.log('  - Order Code:', result.data.orderCode);
      console.log('  - Payment Link ID:', result.data.paymentLinkId);
    } else {
      console.log('❌ FAILED: Could not create payment link');
      console.log('  - Error:', result.error);
      console.log('  - Details:', result.details);
    }
    
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testPayOSProduction(); 