
const assert = require('assert');

const API_URL = 'http://localhost:3000/api/login';
const RESET_URL = 'http://localhost:3000/api/reset';


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

async function resetServer() {
  await fetch(RESET_URL, { method: 'POST' });
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

// รีเซ็ตสถานะก่อนเริ่มเทสแต่ละชุด
async function runTests() {
  console.log('\n Starting Login API Tests...');
  await resetServer();

  // Login-01: valid
  await expectResponse(
    'Login-01 (Valid Credentials)',
    { email: 'test@email.com', password: 'test123' },
    200,
    'Login success'
  );

  // Login-06: ข้อมูลไม่ครบ (ทั้งสองช่องว่าง)
  await expectResponse(
    'Login-06 (Missing Email & Password)',
    { email: '', password: '' },
    400,
    'Email and password are required'
  );

  // Login-07: อีเมลรูปแบบไม่ถูกต้อง
  await expectResponse(
    'Login-07 (Invalid Email Format)',
    { email: 'testnaja.com', password: 'test123' },
    400,
    'Invalid email format'
  );

  // Login-02: ขาด email (ยังคงเก็บไว้ทดสอบเพิ่ม)
  await expectResponse(
    'Login-02 (Missing Email)',
    { email: '', password: 'me' },
    400,
    'Email and password are required'
  );

  // Login-03: ขาด password
  await expectResponse(
    'Login-03 (Missing Password)',
    { email: 'demo@example.com', password: '' },
    400,
    'Email and password are required'
  );

  // Login-04: อีเมลไม่ถูก format (อีกเคส)
  await expectResponse(
    'Login-04 (Invalid Email Format)',
    { email: 'demo', password: 'me' },
    400,
    'Invalid email format'
  );

  // Login-05: password ผิด
  await expectResponse(
    'Login-05 (Wrong Password)',
    { email: 'sam@example.com', password: 'wrong' },
    401,
    'Wrong password or email'
  );

  // Login-08..Login-12: lockout หลังผิด 5 ครั้ง
  await resetServer();
  for (let attempt = 1; attempt <= 6; attempt++) {
    const expectedStatus = attempt <= 5 ? 401 : 423;
    const expectedMessage =
      attempt <= 5 ? 'Wrong password or email' : 'Account temporarily locked';

    await expectResponse(
      `Login-0${7 + attempt} (Lockout Attempt ${attempt})`,
      { email: 'sam@example.com', password: 'wrong' },
      expectedStatus,
      expectedMessage
    );
  }

  // Login-12 (ยืนยันล็อกด้วยรหัสถูก)
  await expectResponse(
    'Login-12 (Locked Account with Correct Password)',
    { email: 'sam@example.com', password: '1234' },
    423,
    'Account temporarily locked'
  );

  console.log('\n✅ All Login Tests Passed Successfully!');
}

// --- Execute ---
runTests().catch((error) => {
  console.error('\n❌ Test Failed:', error.message);
  process.exitCode = 1;
});
