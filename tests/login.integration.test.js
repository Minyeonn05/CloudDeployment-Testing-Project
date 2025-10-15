const assert = require('assert');

const API_URL = 'http://localhost:3000';

async function sendHealthRequest() {
  const response = await fetch(`${API_URL}/health`, { method: 'GET' });
  let data;
  try { data = await response.json(); } catch { data = {}; }
  return { response, data };
}

async function expectHealth(name, status, message) {
  const { response, data } = await sendHealthRequest();
  assert.strictEqual(
    response.status, status,
    `${name}: expected status ${status}, received ${response.status}`
  );
  assert.strictEqual(
    data.message, message,
    `${name}: expected message "${message}", received "${data.message}"`
  );
  return { response, data };
}

async function sendLoginRequest(body) {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  let data;
  try { data = await response.json(); } catch { data = {}; }
  return { response, data };
}

async function resetServer() {
  await fetch(`${API_URL}/api/reset`, { method: 'POST' });
}

async function expectResponse(name, body, status, message) {
  const { response, data } = await sendLoginRequest(body);
  assert.strictEqual(
    response.status,
    status,
    `${name}: expected status ${status}, received ${response.status}`
  );
  assert.strictEqual(
    data.message,
    message,
    `${name}: expected message "${message}", received "${data.message}"`
  );
  return { response, data };
}

async function runCase(name, fn) {
  console.log(`▶️  ${name}`);
  try {
    await fn();
    console.log(`✅ Test passed: ${name}`);
  } catch (err) {
    console.error(`❌ Test failed: ${name}\n   ↳ ${err.message}`);
    throw err; // โยนต่อเพื่อให้ชุดเทสหยุดและ exit code ถูกต้อง
  } finally {
    console.log('-------------------------');
  }
}

async function runTests() {
  console.log('Start integration tests:\n');

  // รีเซ็ตสถานะก่อนเริ่มชุด
  await resetServer();

  await runCase('Login-00 (Server Health)', async () => {
    await expectHealth('Login-00 (Server Health)', 200, 'Server is healthy');
  });

  await runCase('Login-01 (valid credentials)', async () => {
    await expectResponse(
      'Login-01 (valid credentials)',
      { email: 'test@email.com', password: 'test123' },
      200,
      'Login success'
    );
  });

  await runCase('Login-02 (missing email)', async () => {
    await expectResponse(
      'Login-02 (missing email)',
      { email: '', password: 'me' },
      400,
      'Email and password are required'
    );
  });

  await runCase('Login-03 (missing password)', async () => {
    await expectResponse(
      'Login-03 (missing password)',
      { email: 'demo@example.com', password: '' },
      400,
      'Email and password are required'
    );
  });

  await runCase('Login-04 (invalid email format)', async () => {
    await expectResponse(
      'Login-04 (invalid email format)',
      { email: 'demo', password: 'me' },
      400,
      'Invalid email format'
    );
  });

  await runCase('Login-05 (wrong password)', async () => {
    await expectResponse(
      'Login-05 (wrong password)',
      { email: 'sam@example.com', password: 'wrong' },
      401,
      'Wrong password or email'
    );
  });

  //
  await runCase('Login-06 Locked account after 5 failed attempts', async () => {
  await resetServer();

  const email = 'sam@example.com';
  const wrongPassword = 'wrong';
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    await sendLoginRequest({ email, password: wrongPassword });
  }
  await expectResponse(
    'Login-06 Locked account after 5 failed attempts',
    { email, password: wrongPassword },
    423,
    'Account temporarily locked'
  );
});


  await runCase('Login-07 (locked account with correct password)', async () => {
    await expectResponse(
      'Login-12 (locked account with correct password)',
      { email: 'sam@example.com', password: '1234' },
      423,
      'Account temporarily locked'
    );
  });
}

runTests()
  .then(() => {
    console.log('✅ All login tests passed.');
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error.message);
    process.exitCode = 1;
  });
