# Simple Login Demo

This project provides an easy-to-understand login example with:
- **Backend:** An Express app with source code in the `src/` directory.
- **Frontend:** Static HTML, CSS, and JavaScript served from the `public/` directory.
ระบบ Login 
- ตรวจสอบความถูกต้องของอีเมลและรหัสผ่าน
- กรอกรหัสผิดเกิน5ครั้ง บัญชีจะโดนล็อค 3 นาที
- มีการตรวจสอบฟิลด์อีเมลและรหัสผ่านไม่ให้ว่างเมื่อทำการLogin
- มีการตรวจสอบความถูกต้องของรูปแบบอีเมลที่ใส่
- มีการส่ง Status ดังนี้
    เมื่อ Login สำเร็จ Status 200  ok 
    - message: “Login success”

    เมื่อใส่รหัสผ่านหรืออีเมลผิด Status 401 Unauthorized
      - message: “Wrong password or email”

    เมื่อใส่รหัสผ่านผิดเกิน 5 ครั้ง Status 423 Locked
      - message: “Account temporarily locked”

    เมื่อใส่ข้อมูล Login ไม่ครบ Status 400 Bad Request
      - message: “Email and password are required”

## Quick start

```bash
npm install
npm start
```

The app runs on [http://localhost:3000](http://localhost:3000). The frontend is served directly by the backend.

## Test credentials

- Email: `test@email.com`
- Password: `test123`

### Validation rules
  - ต้องกรอก อีเมล และ รหัสผ่าน ครบถ้วน
  - อีเมลต้องมีรูปแบบที่ถูกต้อง
  - ใส่ผิดเกิน 5 ครั้ง → บัญชีถูกล็อก 3 นาที (HTTP 423)
  - ใส่รหัสผิด → HTTP 401
  - ล็อกอินสำเร็จ → HTTP 200

## Automated tests

เปิดเซิร์ฟเวอร์ในเทอร์มินัลแรก:

npm start


แล้วเปิดเทอร์มินัลที่สอง รันเทส:

npm test


ชุดเทสอยู่ที่โฟลเดอร์ tests/ 

Test table

Unit Tests
ID	ชื่อเคส	วัตถุประสงค์	เงื่อนไข / อินพุต	ผลลัพธ์ที่คาดหวัง
Login-01	ข้อมูลถูกต้อง (Success)	ตรวจสอบล็อกอินปกติ	verifyCredentials('test@email.com','test123')	คืนค่า true
Login-02	รหัสผ่านผิด	ปฏิเสธเมื่อรหัสผิด	verifyCredentials('test@email.com','wrong')	คืนค่า false (ยังไม่ล็อก)
Login-03	ล็อกหลังใส่ผิด >5 ครั้ง	ล็อกบัญชีอัตโนมัติ	เรียก recordFailure(email) 6 ครั้ง	isLocked(email) === true
Login-04	ปลดล็อกหลัง 3 นาที	ปลดล็อกเมื่อเวลาครบ	เดินเวลา Date.now() เกิน LOCK_DURATION_MS	isLocked(email) === false, ล็อกอินสำเร็จ
Login-05	อีเมลไม่มีในระบบ	ปฏิเสธเมื่อไม่พบผู้ใช้	verifyCredentials('test@eiei.com','any')	คืนค่า false
Login-06	กรอกไม่ครบ	อีเมล/รหัสว่าง	verifyCredentials('','')	คืนค่า false
Login-07	อีเมลรูปแบบผิด	ไม่มี @	verifyCredentials('testnaja.com','1234')	คืนค่า false

ทุกเคสจะ รีเซ็ตสถานะ ก่อนรัน เพื่อกันผลค้างจากเคสอื่น

Integration Tests
ID	ชื่อเคส	เส้นทาง	ตัวอย่างอินพุต	สถานะที่คาดหวัง	ข้อความที่คาดหวัง
Login-00	ตรวจสุขภาพเซิร์ฟเวอร์	GET /health	—	200	"Server is healthy"
Login-01	ล็อกอินถูกต้อง	POST /api/login	{ "email":"test@email.com","password":"test123" }	200	"Login success"
Login-02	ขาดอีเมล	POST /api/login	{ "email":"", "password":"me" }	400	"Email and password are required"
Login-03	ขาดรหัสผ่าน	POST /api/login	{ "email":"demo@example.com", "password":"" }	400	"Email and password are required"
Login-04	อีเมลผิดรูปแบบ	POST /api/login	{ "email":"demo", "password":"me" }	400	"Invalid email format"
Login-05	รหัสผ่านผิด	POST /api/login	{ "email":"sam@example.com", "password":"wrong" }	401	"Wrong password or email"
Login-06	ล็อกหลังพลาด 5 ครั้ง	POST /api/login × 6	ยิงผิด 5 ครั้งแรก + เช็คครั้งที่ 6	423	"Account temporarily locked"
Login-07	ถูกล็อกแม้รหัสถูก	POST /api/login	{ "email":"sam@example.com", "password":"1234" }	423	"Account temporarily locked"

Github Action
- test รัน test cases ทั้งหมด
- Publish Docker image ตรวจสอบการเอารูปขึ้น Docker หลัง release

Repository secrets
- DOCKER_USERNAME
- DOCKER_PASSWORD

## Deployment

ทำการ Deploy ผ่าน Container App ใน Azure โดยใช้ Docker Image
Link: https://deploy.ambitiousglacier-e4e5e196.japaneast.azurecontainerapps.io

