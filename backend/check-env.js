require('dotenv').config();

console.log('🔍 PayOS Environment Check:');
console.log('PAYOS_CLIENT_ID:', process.env.PAYOS_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('PAYOS_API_KEY:', process.env.PAYOS_API_KEY ? 'SET' : 'NOT SET');
console.log('PAYOS_CHECKSUM_KEY:', process.env.PAYOS_CHECKSUM_KEY ? 'SET' : 'NOT SET');

if (process.env.PAYOS_CLIENT_ID) {
  console.log('Client ID preview:', process.env.PAYOS_CLIENT_ID.slice(0, 8) + '...');
}
if (process.env.PAYOS_API_KEY) {
  console.log('API Key preview:', process.env.PAYOS_API_KEY.slice(0, 8) + '...');
}
if (process.env.PAYOS_CHECKSUM_KEY) {
  console.log('Checksum Key preview:', process.env.PAYOS_CHECKSUM_KEY.slice(0, 8) + '...');
} 