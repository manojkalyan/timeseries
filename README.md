# Encrypted Timeseries Data Streaming Project

This project demonstrates a simple data streaming system that involves generating, encrypting, transmitting, receiving, and displaying time-series data. The system consists of three main components: the Emitter, the Listener, and the Frontend. The Emitter generates encrypted messages, the Listener receives and validates them, and the Frontend displays the received messages along with a success rate.
## start the project:
- npm start

## Components

### 1. Emitter
The Emitter is responsible for generating encrypted messages and sending them to the Listener. It uses the AES-256 encryption algorithm to encrypt the messages. The number of messages sent periodically can be configured, and they are sent over a WebSocket connection.

### 2. Listener
The Listener receives the encrypted messages from the Emitter. It decrypts the messages, validates their integrity using a secret key, and saves them to a MongoDB database. Messages are stored in a time-series manner, where each minute's data is stored in a single document.

### 3. Frontend
The Frontend displays the decrypted and validated messages in real-time. It connects to the Listener using WebSocket and fetches the stored messages from the MongoDB database. The success rate of data transmission and decoding is displayed at the top of the page.

## Usage

1. Install Node.js and MongoDB if not already installed.
## Endpoints
1.http://localhost:3000/
2.http://localhost:3000/api/messages
## images of application
 ## Encrypted messages and can look like this


![Screenshot (71)](https://github.com/manojkalyan/timeseries/assets/70328306/c50e511f-8219-41ec-9d00-e229f75ab150)
## frontend app along with the success rate for data transmission and decoding
 ![Screenshot (69)](https://github.com/manojkalyan/timeseries/assets/70328306/0f5c7973-39c9-452d-a920-2d8f9a058e7c)
## data received for a person between 14:00 to 14:01 all records are added in a single document as a timeseries.
![Screenshot (72)](https://github.com/manojkalyan/timeseries/assets/70328306/e849ee8b-fb29-4f88-a8bc-d5075805c7c8)
## json response

![Screenshot (70)](https://github.com/manojkalyan/timeseries/assets/70328306/9d542507-e2db-47f6-b383-56169ce80b5b)



