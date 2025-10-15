const assert = require('assert');

const API_URL = 'http://localhost:3000/api/login';
const RESET_URL = 'http://localhost:3000/api/reset';

/**
 * ฟังก์ชันสำหรับส่ง request ไปยัง API_URL
 * @param {object} body - ข้อมูลที่จะส่งไปใน body ของ request (email, password)
 * @returns {Promise<{response: Response, data: object}>} - ผลลัพธ์จากการ fetch และข้อมูล JSON
 */
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
    data = {}; // หาก response ไม่มี JSON body ให้ใช้ object ว่างแทน
  }

  return { response, data };
}

/**
 * ฟังก์ชันสำหรับรีเซ็ตสถานะของเซิร์ฟเวอร์ (เช่น ล้างจำนวนครั้งที่ล็อกอินผิด)
 */
async function resetServer() {
  await fetch(RESET_URL, { method: 'POST' });
}

/**
 * ฟังก์ชันสำหรับส่ง request และตรวจสอบผลลัพธ์ที่คาดหวัง
 * @param {string} name - ชื่อของเคสทดสอบ
 * @param {object} body - ข้อมูลที่จะส่งไปใน body
 * @param {number} status - HTTP status code ที่คาดหวัง
 * @param {string} message - ข้อความ message ที่คาดหวังใน response
 */
async function expectResponse(name, body, status, message) {
  const { response, data } = await sendLoginRequest(body);

  // ตรวจสอบว่า status code ที่ได้รับตรงกับที่คาดหวังหรือไม่
  assert.strictEqual(
    response.status,
    status,
    `${name}: expected status ${status}, received ${response.status}`
  );

  // ตรวจสอบว่า message ที่ได้รับตรงกับที่คาดหวังหรือไม่
  assert.strictEqual(
    data.message,
    message,
    `${name}: expected message "${message}", received "${data.message}"`
  );
}

/**
 * ฟังก์ชันหลักสำหรับรันเทสเคส "บัญชีถูกล็อค"
 */
async function runAccountLockoutTest() {
  console.log('เริ่มการทดสอบ: กรณีบัญชีถูกล็อค');

  // รีเซ็ตสถานะเซิร์ฟเวอร์ก่อนเริ่มเทส เพื่อให้แน่ใจว่าไม่มีข้อมูลเก่าค้างอยู่
  await resetServer();
  console.log('รีเซ็ตสถานะเซิร์ฟเวอร์เรียบร้อย');

  // ข้อมูลบัญชีผู้ใช้
  const userEmail = 'test@naja.com';
  const correctPassword = 'testnaja';
  const wrongPassword = 'wrong-password'; // รหัสผ่านที่ผิดสำหรับใช้ทดสอบ

  // 1. ล็อกอินด้วยอีเมลที่ถูกต้อง แต่ใช้ "รหัสผ่านที่ผิด" ติดต่อกัน 5 ครั้ง
  console.log(`\n[ขั้นตอนที่ 1] พยายามล็อกอินด้วยรหัสผ่านผิด 5 ครั้ง...`);
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    console.log(`  - ครั้งที่ ${attempt}: อีเมล '${userEmail}', รหัสผ่าน '${wrongPassword}'`);
    await expectResponse(
      `Lockout Attempt ${attempt}`,
      { email: userEmail, password: wrongPassword },
      401, // คาดหวัง status 401 (Unauthorized) สำหรับรหัสผ่านที่ผิด
      'Wrong password or email' // คาดหวังข้อความนี้
    );
  }
  console.log('✅ สำเร็จ: ล็อกอินผิด 5 ครั้ง ได้รับ status 401 ตามคาด');


  // 2. ในครั้งที่ 6 ให้ล็อกอินด้วย "รหัสผ่านที่ถูกต้อง"
  // แต่เนื่องจากบัญชีควรจะถูกล็อคไปแล้ว จึงต้องล็อกอินไม่สำเร็จ
  console.log(`\n[ขั้นตอนที่ 2] พยายามล็อกอินครั้งที่ 6 ด้วยรหัสผ่านที่ถูกต้อง...`);
  await expectResponse(
    'Login with correct password on a locked account',
    { email: userEmail, password: correctPassword },
    423, // คาดหวัง status 423 (Locked)
    'Account temporarily locked' // คาดหวังข้อความว่าบัญชีถูกล็อค
  );
  console.log('✅ สำเร็จ: ล็อกอินครั้งที่ 6 ด้วยรหัสผ่านที่ถูกต้องไม่สำเร็จ และได้รับสถานะ "Locked" (423) ตามคาด');
}


runAccountLockoutTest()
  .then(() => {
    console.log('\n✅✅✅ การทดสอบสถานการณ์บัญชีถูกล็อคผ่านทั้งหมด!');
  })
  .catch((error) => {
    console.error('\n❌❌❌ การทดสอบล้มเหลว:', error.message);
    process.exitCode = 1; // จบโปรแกรมพร้อมกับ error code
  });