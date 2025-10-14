const form = document.getElementById('login-form');
const messageElement = document.getElementById('message');

const showMessage = (text, type) => {
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    email: (formData.get('email') || '').trim(),
    password: (formData.get('password') || '').trim()
  };

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showMessage(result.message || 'Login failed.', 'error');
      return;
    }

    showMessage(result.message, 'success');
    form.reset();
  } catch (error) {
    showMessage('Unable to reach the server. Please try again later.', 'error');
  }
});
