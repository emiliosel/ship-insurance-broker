import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Function to generate a UUID v4 using crypto
function generateUUID(): string {
  return ([1e7] as any +-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c: any) =>
    (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
  );
}

// Generate a private key for testing
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Save the public key to a file
fs.writeFileSync(path.join(__dirname, '../../../../public-key.pem'), publicKey);
console.log('Public key saved to public-key.pem');

// Define the JWT payload interface
interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  roles: string[];
  iat: number;
  exp: number;
}

// Generate a JWT token for a requester
const requesterUserId = generateUUID();
const requesterCompanyId = generateUUID();
const requesterPayload: JwtPayload = {
  sub: requesterUserId,
  email: 'requester@example.com',
  companyId: requesterCompanyId,
  roles: ['requester'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
};

const requesterToken = jwt.sign(requesterPayload, privateKey, { algorithm: 'RS256' });
console.log('\nRequester JWT Token:');
console.log(requesterToken);
console.log(`\nRequester User ID: ${requesterUserId}`);
console.log(`Requester Company ID: ${requesterCompanyId}`);

// Generate a JWT token for a responder
const responderUserId = generateUUID();
const responderCompanyId = generateUUID();
const responderPayload: JwtPayload = {
  sub: responderUserId,
  email: 'responder@example.com',
  companyId: responderCompanyId,
  roles: ['responder'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
};

const responderToken = jwt.sign(responderPayload, privateKey, { algorithm: 'RS256' });
console.log('\nResponder JWT Token:');
console.log(responderToken);
console.log(`\nResponder User ID: ${responderUserId}`);
console.log(`Responder Company ID: ${responderCompanyId}`);

// Print instructions for updating the .env file
console.log('\nUpdate your .env file with the following JWT_PUBLIC_KEY:');
console.log(publicKey.replace(/\n/g, '\\n'));
