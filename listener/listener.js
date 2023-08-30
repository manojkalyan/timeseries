const io = require('socket.io');
const express = require('express');
const http = require('http');
const crypto = require('crypto');
const mongoose = require('mongoose');
const MessageModel = require('./models/Message'); // Create this mongoose model
const path = require('path'); // Import the path module

const app = express();
const server = http.createServer(app);
const socketServer = io(server);

mongoose.connect('mongodb://127.0.0.1/mynewdb');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error connecting to database:'));
db.once('open', function () {
    console.log('Successfully connected to database');
});

// Define your encryption key here
const passphrase = 'yourSecretPassphrase';
const encryptionKey = crypto.createHash('sha256').update(passphrase).digest();

// Define the generateSecretKey function
function generateSecretKey(message) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(message));
  return hash.digest('hex');
}

function decryptMessage(encryptedMessage, secretKey) {
  const [iv, encryptedData] = encryptedMessage.split(':');
  const decipher = crypto.createDecipheriv('aes-256-ctr', secretKey, Buffer.from(iv, 'hex'));
  let decryptedMessage = decipher.update(encryptedData, 'hex', 'utf8');
  decryptedMessage += decipher.final('utf8');
  return JSON.parse(decryptedMessage);
}

function validateMessage(message) {
  const calculatedSecretKey = generateSecretKey({
    name: message.name,
    origin: message.origin,
    destination: message.destination
  });
  return message.secret_key === calculatedSecretKey;
}

async function saveMessageToDB(message) {
  const minute = new Date(message.timestamp).getMinutes();
  const existingMinuteMessage = await MessageModel.findOne({ minute }).exec();
  if (existingMinuteMessage) {
    existingMinuteMessage.data.push(message);
    await existingMinuteMessage.save();
  } else {
    const newMinuteMessage = new MessageModel({
      minute,
      data: [message]
    });
    newMinuteMessage.timestamp = message.timestamp;

    await newMinuteMessage.save();
  }
}

// Create an HTTP endpoint to fetch messages from the database
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await MessageModel.find().sort({ timestamp: 'desc' }).limit(10).exec();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'An error occurred while fetching messages' });
  }
});

socketServer.on('connection', socket => {
  console.log('Emitter connected');

  socket.on('encryptedMessages', async encryptedMessages => {
    for (const encryptedMessage of encryptedMessages) {
      const decryptedMessage = decryptMessage(encryptedMessage, encryptionKey);

      if (validateMessage(decryptedMessage)) {
        const timestamp = new Date();
        const messageWithTimestamp = {
          ...decryptedMessage,
          timestamp: timestamp, 
        };

        try {
          await saveMessageToDB(messageWithTimestamp);
          socketServer.emit('newMessage', messageWithTimestamp); // Broadcast to all connected clients
        } catch (error) {
          console.error('Error saving message:', error);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Emitter disconnected');
  });
});

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

server.listen(3000, () => {
  console.log('Listener service running on port 3000');
});
