// Simplified CORS logic verification (no dependencies)
const allowedOrigin = 'https://learning-management-system-hkzvwalw0.vercel.app';

function testCorsOrigin(origin) {
  let result = null;
  const callback = (err, allowed) => {
    result = { err, allowed };
  };

  const originFn = function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin === allowedOrigin || origin === 'http://localhost:3000') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  };

  originFn(origin, callback);
  return result;
}

console.log('--- START SIMPLE CORS VERIFICATION ---');

// 1. Test allowed origin
const test1 = testCorsOrigin(allowedOrigin);
if (test1.allowed && !test1.err) {
  console.log(`✔ SUCCESS: ${allowedOrigin} allowed`);
} else {
  console.error(`❌ FAILURE: ${allowedOrigin} should be allowed`);
}

// 2. Test localhost
const test2 = testCorsOrigin('http://localhost:3000');
if (test2.allowed && !test2.err) {
  console.log(`✔ SUCCESS: http://localhost:3000 allowed`);
} else {
  console.error(`❌ FAILURE: http://localhost:3000 should be allowed`);
}

// 3. Test no origin
const test3 = testCorsOrigin(null);
if (test3.allowed && !test3.err) {
  console.log(`✔ SUCCESS: null origin (mobile/curl) allowed`);
} else {
  console.error(`❌ FAILURE: null origin should be allowed`);
}

// 4. Test disallowed origin
const test4 = testCorsOrigin('https://malicious-site.com');
if (!test4.allowed && test4.err) {
  console.log(`✔ SUCCESS: https://malicious-site.com blocked`);
} else {
  console.error(`❌ FAILURE: https://malicious-site.com should be blocked`);
}

console.log('--- CORS VERIFICATION COMPLETE ---');
