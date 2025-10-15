const assert = require('assert');
const {
  MAX_ATTEMPTS,
  normalizeEmail,
  isValidEmail,
  isLocked,
  recordFailure,
  resetFailures,
  verifyCredentials,
  resetAllAttempts
} = require('../src/login');

// Test suite runner
function describe(suiteName, fn) {
  console.log(`\n📦 ${suiteName}`);
  fn();
}

function it(testName, fn) {
  try {
    fn();
    console.log(`  ✅ ${testName}`);
  } catch (error) {
    console.log(`  ❌ ${testName}`);
    console.error(`     ${error.message}`);
    throw error;
  }
}

function beforeEach(fn) {
  fn();
}

// Run all tests
function runUnitTests() {
  describe('Login Tests', () => {
    beforeEach(() => {
      resetAllAttempts();
    });

    it('Login-04: Loginได้หลังจากบัญชีถูกล็อคครบ 3 นาที', () => {
      const email = 'test@naja.com';
      const password = 'test123';
      const normalizedEmail = normalizeEmail(email);
      
      // ทำแบบ Login-03: ล็อคบัญชีโดยพยายาม login ผิดเกิน 5 ครั้ง
      for (let i = 0; i <= MAX_ATTEMPTS; i++) {
        recordFailure(normalizedEmail);
      }
      
      // ตรวจสอบว่าบัญชีถูกล็อค
      assert.strictEqual(isLocked(normalizedEmail), true, 'บัญชีควรถูกล็อค');
      
      // Mock เวลาให้เกิน 3 นาที โดยการตั้ง lockedUntil เป็นเวลาที่ผ่านไปแล้ว
      const loginModule = require('../src/login');
      const attemptState = loginModule.attemptState || new Map();
      const entry = attemptState.get(normalizedEmail);
      
      if (entry) {
        // ตั้งเวลาล็อคให้หมดอายุ (เวลาปัจจุบัน - 1ms = เวลาที่ผ่านไปแล้ว)
        entry.lockedUntil = Date.now() - 1;
      }
      
      // หลังจากครบ 3 นาที บัญชีควรปลดล็อค
      assert.strictEqual(isLocked(normalizedEmail), false, 'บัญชีควรปลดล็อคหลังครบ 3 นาที');
      
      // ตรวจสอบว่าสามารถ login ด้วย credentials ที่ถูกต้องได้
      // Status 200 OK และ message: "Login success"
      assert.strictEqual(
        verifyCredentials(normalizedEmail, password),
        true,
        'ควร login สำเร็จด้วย email และ password ที่ถูกต้อง (Status 200, message: "Login success")'
      );
    });

    it('Login-05: Login ด้วยอีเมลที่ไม่มีอยู่ในระบบ', () => {
      const email = 'test@eiei.com';
      const password = 'test123';
      const normalizedEmail = normalizeEmail(email);
      
      // ตรวจสอบว่า email format ถูกต้อง
      assert.strictEqual(
        isValidEmail(normalizedEmail),
        true,
        'Email format ควรถูกต้อง'
      );
      
      // ตรวจสอบว่าบัญชีไม่ถูกล็อค
      assert.strictEqual(
        isLocked(normalizedEmail),
        false,
        'บัญชีไม่ควรถูกล็อค'
      );
      
      // พยายาม login ด้วยอีเมลที่ไม่มีในระบบ
      // Status 401 Unauthorized และ message: "Wrong password or email"
      assert.strictEqual(
        verifyCredentials(normalizedEmail, password),
        false,
        'ควรล้มเหลวเพราะอีเมลไม่มีในระบบ (Status 401, message: "Wrong password or email")'
      );
      
      // บันทึกความล้มเหลว
      const nowLocked = recordFailure(normalizedEmail);
      
      // ควรยังไม่ถูกล็อคหลังจากพยายามครั้งแรก
      assert.strictEqual(
        nowLocked,
        false,
        'บัญชีไม่ควรถูกล็อคหลังจากความล้มเหลวครั้งแรก'
      );
    });
  });
}

// Run the test suite
try {
  runUnitTests();
  console.log('\n✅ All unit tests passed!\n');
} catch (error) {
  console.error('\n❌ Unit test suite failed\n');
  process.exit(1);
}