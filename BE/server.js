require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');  
const { Server } = require('socket.io'); 

const session = require("express-session");
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');
const app = express();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());

require('./models/connectsModel');
require('./controllers/Admin/cronJobController');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
}));

app.use(clientRoutes);
app.use('/admin', adminRoutes);
app.use('/client', adminRoutes);
app.use(apiRoutes);

const port = 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
  });
});

server.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
