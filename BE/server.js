require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');  // thêm dòng này
const { Server } = require('socket.io');  // thêm dòng này

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

// Routes
app.use(clientRoutes);
app.use('/admin', adminRoutes);
app.use(apiRoutes);

const port = 5000;

// Tạo HTTP server từ Express app
const server = http.createServer(app);

// Khởi tạo socket.io và cho phép CORS nếu cần
const io = new Server(server, {
  cors: {
    origin: "*", // hoặc domain frontend của bạn
    methods: ["GET", "POST"],
  },
});

// Xử lý sự kiện kết nối socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Ví dụ: lắng nghe event join room
  socket.on('join', (userId) => {
    console.log('User joined:', userId);
    socket.join(userId);
  });

  // Ví dụ: gửi thông báo đến user cụ thể
  // io.to(userId).emit('newNotification', { ... });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Lắng nghe server qua HTTP server thay vì app.listen
server.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
