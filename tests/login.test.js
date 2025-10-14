const assert = require('assert');

const API_URL = 'http://localhost:3000/api/login';

async function sendLoginRequest(body) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  return { response, data };
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

async function runTests() {
  await expectResponse(
    'Login-01 (valid credentials)',
    { email: 'demo@example.com', password: 'me' },
    200,
    'Login success'
  );

  await expectResponse(
    'Login-02 (missing email)',
    { email: '', password: 'me' },
    400,
    'Email and password are required'
  );

  await expectResponse(
    'Login-03 (missing password)',
    { email: 'demo@example.com', password: '' },
    400,
    'Email and password are required'
  );

  await expectResponse(
    'Login-04 (invalid email format)',
    { email: 'demo', password: 'me' },
    400,
    'Invalid email format'
  );

  await expectResponse(
    'Login-05 (wrong password)',
    { email: 'sam@example.com', password: 'wrong' },
    401,
    'Wrong password or email'
  );

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const expectedStatus = attempt <= 5 ? 401 : 423;
    const expectedMessage =
      attempt <= 5 ? 'Wrong password or email' : 'Account temporarily locked';

    await expectResponse(
      `Login-0${5 + attempt} (lockout attempt ${attempt})`,
      { email: 'sam@example.com', password: 'wrong' },
      expectedStatus,
      expectedMessage
    );
  }

  await expectResponse(
    'Login-12 (locked account with correct password)',
    { email: 'sam@example.com', password: '1234' },
    423,
    'Account temporarily locked'
  );
}

runTests()
  .then(() => {
    console.log('✅ All login tests passed.');
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error.message);
    process.exitCode = 1;
  });
