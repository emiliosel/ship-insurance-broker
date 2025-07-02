import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Parse command line arguments
const argv = {
  userId: process.argv.find(arg => arg.startsWith('--userId='))?.split('=')[1],
  email: process.argv.find(arg => arg.startsWith('--email='))?.split('=')[1],
  companyId: process.argv.find(arg => arg.startsWith('--companyId='))?.split('=')[1],
  roles: process.argv.find(arg => arg.startsWith('--roles='))?.split('=')[1],
};

// Function to generate a UUID v4 using crypto
function generateUUID(): string {
  return ([1e7] as any +-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c: any) =>
    (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
  );
}

// Paths for key files
const publicKeyPath = path.join(__dirname, '../../../../public-key.pem');
const privateKeyPath = path.join(__dirname, '../../../../private-key.pem');

// Check if keys exist, if not generate them
let privateKey: string;
let publicKey: string;

if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
  console.error('Generating new key pair...');
  // Generate a private key for testing
  const keyPair = crypto.generateKeyPairSync('rsa', {
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
  
  privateKey = keyPair.privateKey;
  publicKey = keyPair.publicKey;
  
  // Save the keys to files
  fs.writeFileSync(publicKeyPath, publicKey);
  fs.writeFileSync(privateKeyPath, privateKey);
  console.error('Public key saved to public-key.pem');
  console.error('Private key saved to private-key.pem');
} else {
  // Read keys from files
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  console.error('Using existing key pair from files');
}

// Define the JWT payload interface
interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  roles: string[];
  iat: number;
  exp: number;
}

// If command line arguments are provided, generate a token with those values
if (argv.userId || argv.email || argv.companyId || argv.roles) {
  const userId = argv.userId || generateUUID();
  const email = argv.email || 'user@example.com';
  const companyId = argv.companyId || generateUUID();
  const roles = argv.roles ? argv.roles.split(',') : ['requester'];

  const payload: JwtPayload = {
    sub: userId,
    email,
    companyId,
    roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };

  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  console.log(token);
} else {
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
  console.error('\nRequester JWT Token:');
  console.error(requesterToken);
  console.error(`\nRequester User ID: ${requesterUserId}`);
  console.error(`Requester Company ID: ${requesterCompanyId}`);

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
  console.error('\nResponder JWT Token:');
  console.error(responderToken);
  console.error(`\nResponder User ID: ${responderUserId}`);
  console.error(`Responder Company ID: ${responderCompanyId}`);

  // Print instructions for updating the .env file
  console.error('\nUpdate your .env file with the following JWT_PUBLIC_KEY:');
  console.error(publicKey.replace(/\n/g, '\\n'));
}
