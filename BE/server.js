require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const session = require("express-session");
const app = express();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const cron = require('node-cron');
const { Sequelize, Op } = require('sequelize');
const OrderModel = require('./models/ordersModel');
const cleanupRememberTokens = require('./controllers/Client/rememberTokenCleanup');
const authenticate = require('./services/Middleware');
const updateLastActive = require('./config/middleware/updateLastActive');
const { authAdmin} = require('./services/authCheck');
const notifyWishlistPromotions = require('./services/notifyWishlistPromotions');

const webhookRoutes = require('./routes/webhookRoutes');
app.use('/stripe/webhook', express.raw({type: 'application/json'}), webhookRoutes);


cron.schedule('* * * * *', async () => {
  try {
    // 2h: - 2 * 60 * 1000
    const twoMinutesAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

    const ordersToUpdate = await OrderModel.findAll({
      where: {
        status: 'completed',
        updated_at: {
          [Op.lte]: twoMinutesAgo,
        },
      },
    });

    for (const order of ordersToUpdate) {
      order.status = 'delivered';
      await order.save();
    }

  } catch (error) {
    console.error("Lỗi khi kiểm tra và cập nhật trạng thái đơn hàng:", error);
  }
});

cron.schedule('0 0 * * *', () => {
  cleanupRememberTokens();
});


cron.schedule('0 9 * * *', () => {
    notifyWishlistPromotions();
});

app.use(cors());

require('./models/connectsModel');
require('./controllers/Admin/cronJobController');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');

const apiRoutes = require('./routes/apiRoutes');

app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: "*",
  methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
}));

app.use(apiRoutes);
app.use(clientRoutes);
app.use('/admin', adminRoutes);
app.use('/', authenticate, updateLastActive, clientRoutes);


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
