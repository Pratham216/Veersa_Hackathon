import crypto from 'crypto';
const secretKey = crypto.randomBytes(32).toString('hex');
console.log('JWT Secret Key:', secretKey);