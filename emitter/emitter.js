const io = require('socket.io-client');
const crypto = require('crypto');
const data = require('./data.json');
const passphrase = 'yourSecretPassphrase';

// Generate a 256-bit key using SHA-256 hash function
const encryptionKey = crypto.createHash('sha256').update(passphrase).digest();
console.log("Encryption Key:", encryptionKey.toString('hex'));

const socket = io.connect('http://localhost:3000');

function generateSecretKey(message) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(message));
  return hash.digest('hex');
}

function encryptMessage(message, secretKey) {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector (IV)
  const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);
  let encryptedMessage = cipher.update(JSON.stringify(message), 'utf8', 'hex');
  encryptedMessage += cipher.final('hex');
  // console.log(encryptedMessage)
  return `${iv.toString('hex')}:${encryptedMessage}`;
}

function generateRandomMessage() {
  const randomNameIndex = Math.floor(Math.random() * data.names.length);
  const randomCityIndex = Math.floor(Math.random() * data.cities.length);
  
  const message = {
    name: data.names[randomNameIndex],
    origin: data.cities[randomCityIndex],
    destination: data.cities[randomCityIndex]
  };

  message.secret_key = generateSecretKey(message);
  return encryptMessage(message, encryptionKey);
}

let messagesSent = 0;
const totalMessages = data.names.length; // Change this to the desired length
let interval; // Declare interval variable here

function sendMessages() {
  if (messagesSent >= totalMessages) {
    clearInterval(interval);
    console.log('All messages sent.');
    return;
  }

  const numMessages = Math.min(totalMessages - messagesSent, Math.floor(Math.random() * (10 - 1 + 1)) + 1);
  const messages = [];
  for (let i = 0; i < numMessages; i++) {
    messages.push(generateRandomMessage());
  }
  socket.emit('encryptedMessages', messages);
  messagesSent += numMessages;
  console.log(`Sent ${numMessages} messages. Total sent: ${messagesSent}/${totalMessages}`);
}

socket.on('connect', () => {
  console.log('Emitter connected');
  interval = setInterval(sendMessages, 10000); // Assign interval here
});

socket.on('disconnect', () => {
  console.log('Emitter disconnected');
});
