const assert = require('assert');

const {
  resetAllAttempts,
  resetFailures,
  normalizeEmail,
  verifyCredentials,
  recordFailure
} = require('../src/login');

// รันเทสแต่ละกรณีให้มีรูปแบบเดียวกัน
function runTest(name, testFn) {
  resetAllAttempts(); // ล้างข้อมูลสถานะเก่าก่อนทุกเทส เพื่อไม่ให้ผลค้างกัน
  console.log(`▶️ เริ่มทดสอบ: ${name}`);
  testFn(); // เรียกใช้ฟังก์ชันทดสอบที่ส่งเข้ามา
  console.log(`✅ ผ่านการทดสอบ: ${name}`);
  console.log('-------------------------');
}

// 1: ล็อกอินสำเร็จ (ข้อมูลถูกต้อง)
runTest('Login-01 (valid credentials)', () => {
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

// 2: ล็อกอินไม่สำเร็จ 
runTest('Login-02 (wrong password)', () => {
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
