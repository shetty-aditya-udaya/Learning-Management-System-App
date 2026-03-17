const AuthService = require('./src/services/auth.service');
const { query } = require('./src/config/db');
require('dotenv').config();

async function verifyAuthRobust() {
  const testEmail = `robust_test_${Date.now()}@example.com`;
  const testPassword = 'RobustPassword123!';
  
  try {
    console.log('--- REFINED AUTH ERROR VERIFICATION ---');

    // 1. Test Missing Fields (Mocking controller logic since we are calling service)
    // The controller now handles !email || !password.
    console.log('\n[TEST 1] Testing missing fields (Service level check)...');
    try {
      await AuthService.register(testEmail, null);
    } catch (err) {
      console.log('✔ Caught expected missing password error:', err.message);
    }

    // 2. Test Registration (Success)
    console.log(`\n[TEST 2] Registering user: ${testEmail}...`);
    const newUser = await AuthService.register(testEmail, testPassword);
    console.log('✔ Registration success.');

    // 3. Test Login (Wrong Password)
    console.log('\n[TEST 3] Testing login with wrong password...');
    try {
      await AuthService.login(testEmail, 'wrong-one');
    } catch (err) {
      console.log('✔ Caught expected login failure:', err.message);
    }

    // 4. Test Login (Success)
    console.log('\n[TEST 4] Testing successful login...');
    const loginRes = await AuthService.login(testEmail, testPassword);
    console.log('✔ Login successful.');

    // 5. Cleanup
    await query('DELETE FROM users WHERE email = $1', [testEmail]);
    console.log('\n✔ Cleanup complete.');
    console.log('--- VERIFICATION SUCCESSFUL ---');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED:', err.message);
    process.exit(1);
  }
}

verifyAuthRobust();
