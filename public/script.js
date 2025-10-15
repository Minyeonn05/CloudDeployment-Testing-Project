const form = document.getElementById('login-form');
const messageElement = document.getElementById('message'); 

// ฟังก์ชันแสดงข้อความบนหน้าเว็บ
const showMessage = (text, type) => {
  messageElement.textContent = text;             
  messageElement.className = `message ${type}`;  
};

//  event listener //กดปุ่ม submit
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // เก็บค่าที่กรอกในฟอร์ม
  const formData = new FormData(form);

  // ส่งไปให้ backend
  const payload = {
    email: (formData.get('email') || '').trim(),       // ดึงค่า email และตัดช่องว่างออก
    password: (formData.get('password') || '').trim()  // ดึงค่า password และตัดช่องว่างออก
  };

  try {
    // เรียก API ไปที่ login (POST /api/login)
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload)        // แปลง payload เป็น JSON string ก่อนส่ง
    });

    // แปลงผลลัพธ์ที่ backend ส่งกลับมาให้เป็น JSON
    const result = await response.json();

    // ถ้า response status 401, 400, 500) หรือ result.success = False
    if (!response.ok || !result.success) {
      showMessage(result.message || 'Login failed.', 'error'); 
      return; // ออก
    }

    // ถ้าเข้าสู่ระบบสำเร็จ
    showMessage(result.message, 'success'); 
    form.reset(); // ล้างข้อมูล
  } catch (error) {
    // ถ้า  server ล่ม
    showMessage('Unable to reach the server. Please try again later.', 'error');
  }
});
