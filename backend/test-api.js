const jwt = require('jsonwebtoken');
const token = jwt.sign({ email: 'admin@ouk.ac.ke', sub: 'admin', role: 'super_admin' }, 'ouk_secret_key');

fetch('http://localhost:3001/auth/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    fullName: 'Brand New Staff',
    email: 'brandnewstaff2024@ouk.ac.ke',
    userType: 'staff'
  })
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(console.log)
.catch(console.error);
