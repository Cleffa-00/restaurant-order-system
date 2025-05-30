const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// 更严格的CORS配置用于生产环境
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  // 'https://your-frontend-domain.com', // 替换为你的前端域名
  'https://restaurant-order-system-seven.vercel.app', // 如果使用Vercel
  // 添加其他需要的域名
];

// 动态CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有origin的请求（如移动应用或Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// 添加请求日志
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toLocaleTimeString()} - Origin: ${req.get('Origin')}`);
  next();
});

// 创建 HTTP 服务器和 Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  // 添加传输方式配置
  transports: ['websocket', 'polling']
});

// 存储连接的打印机
const printers = new Map();
// 存储管理端连接（用于订单实时更新）
const adminClients = new Map();

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('🔗 新客户端连接:', socket.id, 'IP:', socket.handshake.address);

  // =============================================================================
  // 打印机相关事件
  // =============================================================================
  
  // 打印机注册
  socket.on('register-printer', (storeInfo) => {
    printers.set(socket.id, {
      id: socket.id,
      storeName: storeInfo.storeName || '未知店铺',
      location: storeInfo.location || '未知位置',
      socket: socket,
      connectedAt: new Date()
    });
    
    const printer = printers.get(socket.id);
    console.log(`✅ 打印机注册成功: ${printer.storeName} (${printer.location})`);
    console.log(`📊 当前打印机连接数: ${printers.size}`);
    
    // 确认注册成功
    socket.emit('registration-confirmed', {
      success: true,
      message: `打印机注册成功: ${printer.storeName}`
    });
  });

  // 接收打印状态反馈
  socket.on('print-status', (statusData) => {
    console.log('📄 收到打印状态:', statusData);
  });

  // =============================================================================
  // 管理端订单实时更新相关事件
  // =============================================================================
  
  // 管理端订阅订单更新
  socket.on('subscribe-orders', (data) => {
    const { date } = data;
    console.log(`📅 管理端订阅订单更新: ${date} - Socket: ${socket.id}`);
    
    adminClients.set(socket.id, {
      id: socket.id,
      subscribedDate: date,
      socket: socket,
      connectedAt: new Date(),
      type: 'admin'
    });
    
    console.log(`📊 当前管理端连接数: ${adminClients.size}`);
    
    // 确认订阅成功
    socket.emit('subscription-confirmed', {
      success: true,
      date: date,
      message: `已订阅 ${date} 的订单更新`
    });
  });

  // 更新订阅日期
  socket.on('update-subscription', (data) => {
    const { date } = data;
    const client = adminClients.get(socket.id);
    if (client) {
      client.subscribedDate = date;
      console.log(`📅 更新订阅日期: ${date} - Socket: ${socket.id}`);
    }
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    const printer = printers.get(socket.id);
    const adminClient = adminClients.get(socket.id);
    
    if (printer) {
      console.log(`❌ 打印机断开: ${printer.storeName} - ${reason}`);
      printers.delete(socket.id);
      console.log(`📊 当前打印机连接数: ${printers.size}`);
    }
    
    if (adminClient) {
      console.log(`❌ 管理端断开: ${adminClient.subscribedDate} - ${reason} - Socket: ${socket.id}`);
      adminClients.delete(socket.id);
      console.log(`📊 当前管理端连接数: ${adminClients.size}`);
    }
  });
});

// =============================================================================
// 广播订单更新的工具函数
// =============================================================================

function broadcastOrderUpdate(type, orderData, orderDate) {
  console.log(`📡 广播订单更新: ${type} - ${orderData.id || orderData.orderId} - ${orderDate}`);
  
  let sentCount = 0;
  adminClients.forEach((client, socketId) => {
    try {
      // 只发送给订阅了相应日期的客户端
      if (client.socket.connected && client.subscribedDate === orderDate) {
        client.socket.emit('order-update', {
          type: type, // 'ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_DELETED'
          data: {
            order: type === 'ORDER_DELETED' ? undefined : orderData,
            orderId: orderData.id || orderData.orderId,
            date: orderDate
          }
        });
        sentCount++;
      } else if (!client.socket.connected) {
        adminClients.delete(socketId);
      }
    } catch (error) {
      console.error(`❌ 发送订单更新失败 ${socketId}:`, error.message);
      adminClients.delete(socketId);
    }
  });
  
  console.log(`📤 订单更新已发送到 ${sentCount} 个管理端客户端`);
}

// =============================================================================
// HTTP 路由
// =============================================================================

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '🏪 餐厅打印&管理系统 Socket 服务器',
    status: 'running',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      printers: '/api/printers',
      printOrder: '/api/orders/print (POST)',
      testPrint: '/api/test-print (POST)',
      orderUpdate: '/api/orders/update (POST)',
      adminClients: '/api/admin-clients'
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  const printerList = Array.from(printers.values()).map(p => ({
    id: p.id,
    storeName: p.storeName,
    location: p.location,
    connectedAt: p.connectedAt
  }));
  
  const adminList = Array.from(adminClients.values()).map(c => ({
    id: c.id,
    subscribedDate: c.subscribedDate,
    connectedAt: c.connectedAt
  }));

  const healthData = {
    status: 'ok',
    server: '餐厅打印&管理系统',
    printerCount: printers.size,
    adminClientCount: adminClients.size,
    printers: printerList,
    adminClients: adminList,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  };
  
  console.log('✅ 健康检查请求 - 返回数据');
  res.json(healthData);
});

// 其余路由保持不变...
// [包含其他所有路由代码]

// 启动服务器
const PORT = process.env.SOCKET_PORT || process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ================================');
  console.log(`🏪 餐厅打印&管理系统 Socket 服务器启动成功`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🔗 WebSocket: ws://0.0.0.0:${PORT}`);
  console.log(`🌐 健康检查: http://0.0.0.0:${PORT}/health`);
  console.log(`🖨️ 打印机管理: http://0.0.0.0:${PORT}/api/printers`);
  console.log(`📊 管理端连接: http://0.0.0.0:${PORT}/api/admin-clients`);
  console.log(`📡 订单更新: POST http://0.0.0.0:${PORT}/api/orders/update`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 允许的源: ${allowedOrigins.join(', ')}`);
  console.log('🚀 ================================');
});

// 优雅关闭
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('\n🛑 正在关闭服务器...');
  
  // 通知所有连接的打印机和管理端
  printers.forEach(printer => {
    if (printer.socket.connected) {
      printer.socket.emit('server-shutdown', { 
        message: '服务器正在关闭，请稍后重连' 
      });
    }
  });
  
  adminClients.forEach(client => {
    if (client.socket.connected) {
      client.socket.emit('server-shutdown', { 
        message: '服务器正在关闭，请稍后重连' 
      });
    }
  });
  
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
}

// npm install express@4.18.2 socket.io@4 cors@2