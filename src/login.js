
const USERS = new Map([
  ['demo@example.com', 'me'],
  ['sam@example.com', '1234'],
  ['test@email.com', 'test123']
]);


const MAX_ATTEMPTS = 5; 
const LOCK_DURATION_MS = 3 * 60 * 1000; // ระยะเวลาล็อกบัญชี = 3 นาที (หน่วยเป็นมิลลิวินาที)

// เก็บสถานะการพยายามล็อกอินของแต่ละผู้ใช้ (email → {count, lockedUntil})
const attemptState = new Map();

// รีเซ็ตสถานะการล็อกอินทั้งหมด (ใช้ตอนเทส เพื่อให้เริ่มใหม่ทุกครั้ง)
function resetAllAttempts() {
  attemptState.clear(); // ล้างข้อมูล
}

// จัดรูปแบบอีเมลนั้นนี้ (ตัดช่องว่าง, แปลงเป็นตัวเล็ก)
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// ตรวจสอบรูปแบบอีเมลว่าถูกต้องไหม (ใช้ regex)
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email); // ถ้าถูกคืนค่า true
}

// ตรวจว่าบัญชีถูกล็อกมั้ย
function isLocked(email) {
  const entry = attemptState.get(email); // ดึงสถานะของอีเมลนี้จาก attemptState

  // ถ้ายังไม่เคยพยายามล็อกอินเลย = ไม่ล็อก
  if (!entry || !entry.lockedUntil) {
    return false;
  }

  // ถ้าเวลาที่ล็อกไว้ (lockedUntil) ยังมากกว่าเวลาปัจจุบัน = ยังถูกล็อกอยู่
  if (entry.lockedUntil > Date.now()) {
    return true;
  }

  // ถ้าครบเวลาแล้ว = ปลดล็อก ลบสถานะออก
  attemptState.delete(email);
  return false;
}

// \บันทึกการพยายามล็อกอินที่ล้มเหลว
function recordFailure(email) {
  // ถ้ายังไม่เคยพลาด → ตั้งค่าเริ่มต้น count = 0
  const entry = attemptState.get(email) || { count: 0, lockedUntil: null };

  // เพิ่มจำนวนครั้งที่พลาด +1
  entry.count += 1;

  // ถ้าพลาดเกิน MAX_ATTEMPTS → ตั้งเวลาล็อกบัญชี
  if (entry.count > MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_DURATION_MS; // ล็อกไว้ 3 นาที
  }

  // บันทึกสถานะใหม่กลับไปใน attemptState
  attemptState.set(email, entry);

  // คืนค่าผลว่า "ล็อกอยู่หรือไม่" (true/false)
  return isLocked(email);
 
}

// รีเซ็ตจำนวนการพลาดของอีเมลนั้น (หลังล็อกอินสำเร็จ)
function resetFailures(email) {
  attemptState.delete(email);
}

// ตรวจสอบข้อมูลล็อกอินว่า
function verifyCredentials(email, password) {
  const expectedPassword = USERS.get(email); 
  return expectedPassword === password; 
}


module.exports = {
  MAX_ATTEMPTS,       // จำนวนครั้งสูงสุดที่พลาดได้
  LOCK_DURATION_MS,   // ระยะเวลาล็อกบัญชี (3 นาที)
  normalizeEmail,     // แปลงอีเมลให้อยู่ในรูปแบบมาตรฐาน
  isValidEmail,       // ตรวจรูปแบบอีเมล
  isLocked,           // ตรวจว่าบัญชีถูกล็อกไหม
  recordFailure,      // บันทึกการพลาด
  resetFailures,      // รีเซ็ตจำนวนพลาดของผู้ใช้
  verifyCredentials,  // ตรวจสอบอีเมล/รหัสผ่าน
  resetAllAttempts    // รีเซ็ตสถานะทั้งหมด (ใช้ในการเทส)
};
