const assert = require('assert');

const {
  MAX_ATTEMPTS,LOCK_DURATION_MS,
  normalizeEmail,
  isValidEmail,
  isLocked,
  recordFailure,
  resetFailures,
  verifyCredentials,
  resetAllAttempts
} = require('../src/login');

// รันเทสแต่ละกรณีให้มีรูปแบบเดียวกัน
function runTest(name, testFn) {
  resetAllAttempts(); // ล้างข้อมูลสถานะเก่าก่อนทุกเทส เพื่อไม่ให้ผลค้างกัน
  console.log(`▶️  Start test ${name}`);
  testFn(); // เรียกใช้ฟังก์ชันทดสอบที่ส่งเข้ามา
  console.log(`✅ Test passed: ${name}`);
  console.log('-------------------------');
}

//Login-01: Login ด้วยข้อมูลที่ถูกต้อง
runTest('Login-01: Valid credentials (success)', () => {
  const email = normalizeEmail('test@email.com'); // แปลงอีเมลให้เป็นตัวเล็กและตัดช่องว่าง
  const password = 'test123';
  const result = verifyCredentials(email, password);
  console.log('Result:', result);

  // ต้องได้ค่า true ถ้าข้อมูลถูกต้อง
  assert.strictEqual(
    result,
    true,
    'เข้าสู่ระบบได้เมื่อใช้อีเมลและรหัสผ่านที่ถูกต้อง'
  );

  // รีเซ็ตจำนวนครั้งที่พลาดของอีเมลนี้ (เผื่อมีเทสอื่นใช้ต่อ)
  resetFailures(email);
});

//Login-02 Login ด้วยรหัสผ่านที่ผิด
runTest('Login-02: Incorrect password (unauthorized)', () => {
  const email = normalizeEmail('test@email.com');
  const password = 'testnaja';

  const result = verifyCredentials(email, password); // ตรวจสอบข้อมูลล็อกอิน
  console.log('Result:', result);

  // ต้องเป็น false เมื่อรหัสผิด
  assert.strictEqual(
    result,
    false,
    'ควรเข้าสู่ระบบไม่สำเร็จเมื่อใส่รหัสผ่านผิด'
  );

  // บันทึกการพลาด 1 ครั้ง และดูว่าถูกล็อกหรือยัง
  const locked = recordFailure(email);
  console.log('Locked:', locked); // แสดงผลสถานะล็อก (true/false)


  assert.strictEqual(
    locked,
    false,
    'หลังพลาดครั้งแรกไม่ถูกล็อกบัญชี'
  );

  // รีเซ็ตจำนวนครั้งที่พลาดของอีเมลนี้เพื่อไม่ให้ค้าง
  resetFailures(email);
});

//Login-03: ล็อคบัญชีหลัง ใส่ข้อมูลlogin ผิดเกิน 5 ครั้ง 
runTest('Login-03: Account locked after more than 5 failed attempts', () => {
  const email = 'demo@example.com';
  const password = 'me';
  const normalizedEmail = normalizeEmail(email);

  // ทำแบบ Login-03: ล็อคบัญชีโดยพยายาม login ผิดเกิน 5 ครั้ง
  for (let i = 0; i <= MAX_ATTEMPTS; i++) {
    recordFailure(normalizedEmail);
  }
  const locked = recordFailure(email);
  console.log('Locked:', locked);
  // ตรวจสอบว่าบัญชีถูกล็อค
  assert.strictEqual(isLocked(normalizedEmail), true, 'บัญชีควรถูกล็อค');

  
  resetFailures(normalizedEmail); // ล้างสถานะพลาดทั้งหมด
});

//Login-04: Login ได้หลังจากบัญชีถูกล็อคครบ 3 นาที
runTest('Login succeeds after account unlock (3 min passed)', () => {
  const email = 'demo@example.com';
  const password = 'me';
  const normalizedEmail = normalizeEmail(email);

  // ทำแบบ Login-03: ล็อคบัญชีโดยพยายาม login ผิดเกิน 5 ครั้ง
  for (let i = 0; i <= MAX_ATTEMPTS; i++) {
    recordFailure(normalizedEmail);
  }
  let locked = isLocked(email);
  console.log('Locked after failure:', locked);

  // ตรวจสอบว่าบัญชีถูกล็อค
  assert.strictEqual(isLocked(normalizedEmail), true, 'บัญชีควรถูกล็อค');

  // ---- จำลองเวลาให้ผ่านเกิน 3 นาที ----
  const realNow = Date.now;
  try {
    const now = realNow();
    global.Date.now = () => now + LOCK_DURATION_MS + 1; // เดินเวลาเลยหน้าต่างล็อก
    locked = isLocked(normalizedEmail);
    console.log('Unlocked after 3 minutes:', locked);

    // หลังจากครบ 3 นาที บัญชีควรปลดล็อค
    assert.strictEqual(isLocked(normalizedEmail), false, 'บัญชีควรปลดล็อคหลังครบ 3 นาที');

    // ตรวจสอบว่าสามารถ login ด้วย credentials ที่ถูกต้องได้
      // Status 200 OK และ message: "Login success"
    assert.strictEqual(
      verifyCredentials(normalizedEmail, password),
      true,
      'ควร login สำเร็จหลังปลดล็อค'
    );
  } finally {
    global.Date.now = realNow; // คืนเวลาเดิม
  }
  resetFailures(normalizedEmail); // ล้างสถานะพลาดทั้งหมด
});

//Login-05: Login ด้วยอีเมลที่ไม่มีอยู่ในระบบ
runTest('Login-05: Non-existent email (email not found)', () => {
  const email = normalizeEmail('test@eiei.com');
  const password = 'any';

  assert.strictEqual(isValidEmail(email), true, 'รูปแบบอีเมลต้องถูกต้อง');
  assert.strictEqual(isLocked(email), false, 'บัญชีไม่ควรถูกล็อก');

  const hasEmail = verifyCredentials(email, password);
  assert.strictEqual(hasEmail, false, 'อีเมลไม่มีในระบบต้องไม่ผ่าน');
  console.log('Email found:', hasEmail);

  const nowLocked = recordFailure(email);
  assert.strictEqual(nowLocked, false, 'พลาดครั้งแรกยังไม่ล็อก');
  resetFailures(email);
});

//Login-06: กรอกข้อมูลไม่ครบ (อีเมล/รหัสผ่านว่าง)
runTest('Login-06: Missing fields (empty email & password)', () => {
  const emailRaw = '   ';              // ช่องว่างล้วน
  const password = '';                 // ว่าง
  const email = normalizeEmail(emailRaw);

  // normalize แล้วต้องเป็นสตริงว่าง และอีเมลไม่ผ่านรูปแบบ
  assert.strictEqual(email, '', 'normalizeEmail ควรตัดช่องว่างจนเหลือ "" ');
  assert.strictEqual(isValidEmail(email), false, 'อีเมลว่างต้องไม่ผ่านรูปแบบ');

  // ใส่คู่นี้ต้องล็อกอินไม่ผ่านแน่นอน
  const ok = verifyCredentials(email, password);
  assert.strictEqual(ok, false, 'ข้อมูลไม่ครบต้องไม่สามารถล็อกอินได้');

  // พลาดครั้งแรกยังไม่ถูกล็อก
  const locked = recordFailure(email);
  assert.strictEqual(locked, false, 'พลาดครั้งแรกไม่ควรถูกล็อก');

  // เคลียร์สถานะ
  resetFailures(email);
});

//Login-07: รูปแบบอีเมลไม่ถูกต้อง
runTest('Login-07: Invalid email format', () => {
  const emailRaw = 'testnaja.com';     // ไม่มีเครื่องหมาย @
  const password = 'test123';
  const email = normalizeEmail(emailRaw);

  // รูปแบบอีเมลต้องไม่ผ่าน
  assert.strictEqual(isValidEmail(email), false, 'อีเมลที่ไม่มี @ ต้องไม่ผ่านรูปแบบ');

  // ตรวจสอบว่าการยืนยันตัวตนล้มเหลว
  const ok = verifyCredentials(email, password);
  assert.strictEqual(ok, false, 'อีเมลผิดรูปแบบต้องล็อกอินไม่สำเร็จ');

  // บันทึกความล้มเหลว 1 ครั้ง แต่ยังไม่ล็อก
  const locked = recordFailure(email);
  assert.strictEqual(locked, false, 'พลาดครั้งแรกไม่ควรถูกล็อก');

  // เคลียร์สถานะ
  resetFailures(email);
});


