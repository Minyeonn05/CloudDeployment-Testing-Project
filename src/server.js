const express = require('express');
const path = require('path');
const {
  verifyCredentials,
  isValidEmail,
  normalizeEmail,
  isLocked,
  recordFailure,
  resetFailures,
  resetAllAttempts
} = require('./login');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../public')));


app.post('/api/reset', (req, res) => {
  resetAllAttempts();
  res.json({ message: 'Server state reset' });
});

app.post('/api/login', (req, res) => {
  const emailInput = (req.body?.email || '').trim();
  const password = (req.body?.password || '').trim();

  if (!emailInput || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  if (!isValidEmail(emailInput)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  const email = normalizeEmail(emailInput);

  if (isLocked(email)) {
    return res.status(423).json({
      success: false,
      message: 'Account temporarily locked'
    });
  }

  if (!verifyCredentials(email, password)) {
    const lockedNow = recordFailure(email);

    if (lockedNow) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Wrong password or email'
    });
  }

  resetFailures(email);
  res.json({ success: true, message: 'Login success' });
});



app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
