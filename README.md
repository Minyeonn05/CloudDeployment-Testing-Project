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
<img width="1154" height="596" alt="image" src="https://github.com/user-attachments/assets/73a2f66e-5e25-4067-8aa7-da94dd8d6beb" />


ทุกเคสจะ รีเซ็ตสถานะ ก่อนรัน เพื่อกันผลค้างจากเคสอื่น

Integration Tests
<img width="1041" height="589" alt="image" src="https://github.com/user-attachments/assets/62d164bc-b40e-4d03-af37-4dc225c9c927" />


Github Action
- test รัน test cases ทั้งหมด
- Publish Docker image ตรวจสอบการเอารูปขึ้น Docker หลัง release

Repository secrets
- DOCKER_USERNAME
- DOCKER_PASSWORD

## Deployment

ทำการ Deploy ผ่าน Container App ใน Azure โดยใช้ Docker Image
Link: https://deploy.ambitiousglacier-e4e5e196.japaneast.azurecontainerapps.io

