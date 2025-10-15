// === Unit test 6 7 ===

const assert = require('assert');
const API_URL = 'http://localhost:3000/api/login';

async function sendLoginRequest(body) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  return { response, data };
}

async function expectResponse(name, body, status, message) {
  console.log(`Running test: ${name}`);
  const { response, data } = await sendLoginRequest(body);

  assert.strictEqual(
    response.status,
    status,
    `[${name}] Expected status ${status}, but got ${response.status}`
  );

  assert.strictEqual(
    data.message,
    message,
    `[${name}] Expected message "${message}", but got "${data.message}"`
  );
}

async function runTests() {
  console.log('--- Starting Login Validation Tests ---');

  // Unit-06-Login-กรอกข้อมูลไม่ครบ
  await expectResponse(
    'Login-06 (Missing Fields)',
    { email: '', password: '' },
    400,
    'Email and password are required'
  );

  // Unit-07-Login-รูปแบบอีเมลไม่ถูกต้อง
  await expectResponse(
    'Login-07 (Invalid Email Format)',
    { email: 'testnaja.com', password: 'test123' },
    400,
    'Invalid email format'
  );

  console.log('--- Tests Finished ---');
}



// test
runTests()
  .then(() => console.log('\n✅ All tests passed successfully!'))
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exitCode = 1;
  });
