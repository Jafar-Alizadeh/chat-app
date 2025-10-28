const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const sequelize = require('./models'); // Sequelize-Verbindung
const User = require('./models/User');
const Message = require('./models/Message');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Routen
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Client verbunden');

  // Jeder Benutzer tritt einem eigenen Raum bei (z.B. "user_3" bei User mit ID=3)
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // Statt io.emit(...) nur an den Empfänger-Raum senden:
  socket.on('sendMessage', (data) => {
    // data: { senderId, receiverId, text, ... }
    io.to(`user_${data.receiverId}`).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client getrennt');
  });
});


// MariaDB mit Sequelize verbinden
sequelize.sync({ alter: true }) // Tabellen erstellen/anpassen
  .then(() => {
    server.listen(5000, () => {
      console.log('🚀 Server läuft auf http://localhost:5000');
    });
  })
  .catch((err) => {
    console.error('❗ DB-Verbindung fehlgeschlagen:', err);
  });
