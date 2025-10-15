const assert = require('assert');

const { resetAllAttempts, verifyCredentials, recordFailure } = require('../src/login');

const cases = [
  {
    id: 'Login-01',
    details: 'valid credentials',
    email: 'test@email.com',
    password: 'test123',
    expected: true
  },
  {
    id: 'Login-02',
    details: 'wrong password',
    email: 'test@email.com',
    password: 'testnaja',
    expected: false
  }
];

cases.forEach((testCase) => {
  const { id, details, email, password, expected } = testCase;

  try {
    resetAllAttempts();

    const result = verifyCredentials(email, password);
    console.log(`${id} result:`, result);
    assert.strictEqual(
      result,
      expected,
      `${id}: Expected ${expected} but received ${result}`
    );

    if (!expected) {
      const locked = recordFailure(email);
      assert.strictEqual(
        locked,
        false,
        `${id}: Account should remain unlocked after one failed attempt`
      );
    }

    console.log(`✅ ${id} (${details})`);
  } catch (error) {
    console.error(`❌ ${id} (${details}): ${error.message}`);
    process.exitCode = 1;
  }
});
