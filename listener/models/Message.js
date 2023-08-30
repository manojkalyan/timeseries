const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  data: [
    {
      name: String,
      origin: String,
      destination: String,
      secret_key: String,
      timestamp: Date
    }
  ]
});

const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;
