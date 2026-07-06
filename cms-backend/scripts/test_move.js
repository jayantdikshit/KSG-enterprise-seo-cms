const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';
const EMAIL = 'admin@test.com';
const PASSWORD = 'admin123';

async function main() {
  // Login
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('Login failed:', loginData);
    return;
  }
  const token = loginData.data.accessToken;
  console.log('Logged in – token (truncated):', token.slice(0, 12) + '...');

  // Move files
  const payload = {
    ids: [
      '6a4b6e6b8dcfedbf2331ddeb',
      '6a4b6d598dcfedbf2331dde9',
      '6a465c8a8fe121292b87fd1f',
      '6a465c888fe121292b87fd1d',
      '6a36326ca06cb811f3618f09'
    ],
    folder: 'Archive_1577'
  };

  const moveRes = await fetch(`${API_BASE}/api/media/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const moveData = await moveRes.json();
  console.log('Move response status:', moveRes.status);
  console.log('Move response body:', JSON.stringify(moveData, null, 2));
}

main().catch(err => console.error('Error:', err));
