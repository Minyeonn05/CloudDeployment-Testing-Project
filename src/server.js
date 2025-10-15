
const express = require('express');           
const path = require('path');                  


const {
  verifyCredentials,  // ตรวจสอบอีเมล/รหัสผ่าน
  isValidEmail,       // ตรวจสอบรูปแบบอีเมล
  normalizeEmail,     // ทำให้อีเมลเป็นตัวพิมพ์เล็กและตัดช่องว่าง
  isLocked,           // ตรวจสอบว่าบัญชีถูกล็อกไหม
  recordFailure,      // บันทึกการล็อกอินผิด
  resetFailures,      // รีเซ็ตสถานะการพลาดหลังจากล็อกอินสำเร็จ
  resetAllAttempts    // รีเซ็ตข้อมูลการพยายามล็อกอินทั้งหมด (ใช้ตอนเทสต์)
} = require('./login');


const app = express();
const PORT = process.env.PORT || 3000; 

//  Middleware: ให้ Express แปลงข้อมูล JSON จาก request body อัตโนมัติ
app.use(express.json());


app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../public'))); 

//  Endpoint สำหรับรีเซ็ตสถานะของระบบ (ใช้ตอนเทสต์)
app.post('/api/reset', (req, res) => {
  resetAllAttempts(); // ล้างข้อมูล
  res.json({ message: 'Server state reset' }); 
});

//  Endpoint ล็อกอิน
app.post('/api/login', (req, res) => {
  // ดึงค่าจาก body ของ request
  const emailInput = (req.body?.email || '').trim();
  const password = (req.body?.password || '').trim();

  // ตรวจว่ากรอกอีเมลหรือรหัสผ่านหรือยัง
  if (!emailInput || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // ตรวจรูปแบบอีเมล
  if (!isValidEmail(emailInput)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // แปลงอีเมลให้เป็นตัวเล็กทั้งหมดก่อนเช็ก
  const email = normalizeEmail(emailInput);

  // ตรวจว่าบัญชีนี้ถูกล็อกอยู่มั้ย
  if (isLocked(email)) {
    return res.status(423).json({
      success: false,
      message: 'Account temporarily locked'
    });
  }

  // ตรวจรหัส
  if (!verifyCredentials(email, password)) {
    const lockedNow = recordFailure(email); // บันทึกว่าพลาดอีกครั้ง

    // ถ้าพลาดจนระบบล็อกบัญชีแล้ว → แจ้งว่าถูกล็อก
    if (lockedNow) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked'
      });
    }

    // ถ้ายังไม่ถึง limit → แจ้งว่าอีเมลหรือรหัสผิด
    return res.status(401).json({
      success: false,
      message: 'Wrong password or email'
    });
  }

  //  ถ้ารหัสถูก → รีเซ็ตการพลาดทั้งหมดให้บัญชีนี้
  resetFailures(email);

  // ส่งผลลัพธ์สำเร็จกลับไปให้ frontend
  res.json({ success: true, message: 'Login success' });
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
