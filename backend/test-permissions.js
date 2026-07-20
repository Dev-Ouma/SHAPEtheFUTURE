const jwt = require('jsonwebtoken');

const JWT_SECRET = 'ouk_secret_key'; // From your .env

// Helper to generate token based on JWT payload format from auth service
function generateToken(userId, email, roleName) {
  // NestJS JwtService sign payload usually matches standard { sub, email, role } etc.
  const payload = { 
    userId: userId, 
    sub: userId,
    email: email, 
    role: roleName
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function testApi() {
  // We need valid user UUIDs from the DB. Let's assume we pass them as arguments
  const adminUserId = process.argv[2]; 
  const standardUserId = process.argv[3];
  
  console.log('Testing Admin User...');
  const adminToken = generateToken(adminUserId, 'admin@example.com', 'Super Administrator');
  const adminRes = await fetch('http://localhost:3001/api/campus-feedback/admin/list', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Admin User Response:', adminRes.status, await adminRes.text());

  console.log('\nTesting Standard User...');
  const standardToken = generateToken(standardUserId, 'standard@example.com', 'Student');
  const standardRes = await fetch('http://localhost:3001/api/campus-feedback/admin/list', {
    headers: { 'Authorization': `Bearer ${standardToken}` }
  });
  console.log('Standard User Response:', standardRes.status, await standardRes.text());
}

testApi();
