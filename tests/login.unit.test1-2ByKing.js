const assert = require('assert');

// ฟังก์ชันจากไฟล์ login.js ที่test
const {
  resetAllAttempts,   // รีเซ็ตสถานะการล็อกอินทั้งหมด (จำนวนครั้งที่พลาด)
  normalizeEmail,     // ทำให้อีเมลเป็นรูปแบบมาตรฐาน (ตัวเล็ก, ตัดช่องว่าง)
  verifyCredentials,  // ตรวจสอบว่า email/password ถูกต้องไหม
  recordFailure       // บันทึกจำนวนครั้งที่พลาด และตรวจสอบว่าบัญชีถูกล็อกหรือยัง
} = require('../src/login');

// ฟังก์ชันช่วยรันเทสต์แต่ละอัน รีเซ็ตสถานะก่อนทุกครั้ง
function runTest(name, fn) {
  try {
    resetAllAttempts(); // เคลียร์ข้อมูลการพยายามล็อกอินก่อนเริ่มเทสต์ใหม่ทุกครั้ง
    fn(); // เรียกฟังก์ชันทดสอบที่ส่งเข้ามา
    console.log(`✅ ${name}`); // ถ้าไม่ error แสดงว่าเทสต์ผ่าน
  } catch (error) {

    console.error(`❌ ${name}: ${error.message}`);
    process.exitCode = 1; // ตั้งค่า exit code = 1 เพื่อบอกว่ามีเทสต์ไม่ผ่าน
  }
}

// 1: กรณีล็อกอินสำเร็จ (ข้อมูลถูกต้อง)
runTest('Login-01 (valid credentials)', () => {
  const email = normalizeEmail('test@email.com'); // แปลงอีเมลให้เป็นรูปแบบมาตรฐาน
  const password = 'test123'; // ใช้รหัสผ่านที่ถูกต้องตาม USERS ใน login.js

  const success = verifyCredentials(email, password); // ตรวจสอบว่าถูกต้องบ่
  console.log('result:', success);

  
  assert.strictEqual(
    success,
    true,
    'Expected login success for valid credentials' 
  );
});

//  2: กรณีล็อกอินไม่สำเร็จ (รหัสผ่านผิด)
runTest('Login-02 (wrong password)', () => {
  const email = normalizeEmail('test@email.com');
  const password = 'testnaja'; // ตั้งใจพิมพ์รหัสผิด

  const success = verifyCredentials(email, password); // ตรวจสอบข้อมูล
  console.log('result:', success); 

  // ต้องได้ f 
  assert.strictEqual(
    success,
    false,
    'Expected login failure for incorrect password'
  );

  // หลังจากพลาด 1 ครั้ง  ระบบควรยังไม่ล็อกบัญชี
  const locked = recordFailure(email);
  assert.strictEqual(
    locked,
    false,
    'Account should remain unlocked after a single failed attempt'
  );
});
