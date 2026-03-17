const AuthService = require('./src/services/auth.service');
const { query } = require('./src/config/db');
require('dotenv').config();

async function testAuth() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  try {
    console.log(`--- Testing Auth Logic with email: ${email} ---`);
    
    // 1. Test Registration
    console.log('Registering...');
    await AuthService.register(email, password);
    console.log('✔ Registration successful');
    
    // 2. Test Login
    console.log('Logging in...');
    const result = await AuthService.login(email, password);
    console.log('✔ Login successful');
    console.log('User object returned:', JSON.stringify(result.user, null, 2));
    
    // 3. Clean up
    await query('DELETE FROM users WHERE email = $1', [email]);
    console.log('✔ Test user cleaned up');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Auth Verification Failed:', err.message);
    process.exit(1);
  }
}

testAuth();
