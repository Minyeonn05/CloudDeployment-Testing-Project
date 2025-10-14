# Simple Login Demo

This project provides an easy-to-understand login example with:
- **Backend:** An Express app with source code in the `src/` directory.
- **Frontend:** Static HTML, CSS, and JavaScript served from the `public/` directory.

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
- Email/password must be provided and the email must be a valid format.
- More than 5 wrong attempts locks the account for 3 minutes (HTTP 423).
- Wrong credentials return HTTP 401, successful logins return HTTP 200.

## Automated tests

Launch the server (`npm start`) in one terminal, then in another run:

```bash
npm test
```

The suite in `tests/login.test.js` covers successful login, validation errors, and lockout behaviour. The data remains in memory so it is easy to switch to a database or external auth provider later on.
