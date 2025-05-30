const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// 中间件配置
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// 添加请求日志
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// 创建 HTTP 服务器和 Socket.io
const server = http.createServer(app);

// 设置监听器限制以避免警告
server.setMaxListeners(20);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 存储连接的打印机
const printers = new Map();
// 存储管理端连接（用于订单实时更新）
const adminClients = new Map();

// 关闭状态标志
let isShuttingDown = false;

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('🔗 新客户端连接:', socket.id);

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
    console.log(`📅 管理端订阅订单更新: ${date}`);
    
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
      console.log(`📅 更新订阅日期: ${date}`);
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
      console.log(`❌ 管理端断开: ${adminClient.subscribedDate} - ${reason}`);
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
    uptime: Math.floor(process.uptime())
  };
  
  console.log('✅ 健康检查请求 - 返回数据');
  res.json(healthData);
});

// 获取连接的打印机列表
app.get('/api/printers', (req, res) => {
  const printerList = Array.from(printers.values()).map(p => ({
    id: p.id,
    storeName: p.storeName,
    location: p.location,
    connectedAt: p.connectedAt,
    connected: p.socket.connected
  }));

  res.json({
    success: true,
    printers: printerList,
    count: printers.size,
    timestamp: new Date().toISOString()
  });
});

// 获取管理端连接列表
app.get('/api/admin-clients', (req, res) => {
  const clientList = Array.from(adminClients.values()).map(c => ({
    id: c.id,
    subscribedDate: c.subscribedDate,
    connectedAt: c.connectedAt,
    connected: c.socket.connected
  }));

  res.json({
    success: true,
    adminClients: clientList,
    count: adminClients.size,
    timestamp: new Date().toISOString()
  });
});

// 接收订单并发送到打印机
app.post('/api/orders/print', (req, res) => {
  try {
    const orderData = req.body;
    
    console.log('🆕 收到打印订单:', orderData.orderNumber || orderData.orderId);
    console.log('📊 可用打印机数量:', printers.size);

    if (printers.size === 0) {
      console.warn('⚠️ 没有连接的打印机');
      return res.json({
        success: false,
        message: '没有可用的打印机',
        printerCount: 0
      });
    }

    // 格式化并发送到所有打印机
    const printData = {
      orderId: orderData.orderId,
      orderNumber: orderData.orderNumber,
      orderDetails: orderData,
      timestamp: new Date().toISOString()
    };

    let sentCount = 0;
    printers.forEach((printer, socketId) => {
      try {
        if (printer.socket.connected) {
          printer.socket.emit('print-order', printData);
          console.log(`📤 订单已发送到: ${printer.storeName}`);
          sentCount++;
        } else {
          console.warn(`⚠️ 打印机 ${printer.storeName} 已断开连接`);
          printers.delete(socketId);
        }
      } catch (error) {
        console.error(`❌ 发送到 ${printer.storeName} 失败:`, error.message);
      }
    });

    res.json({
      success: true,
      orderId: orderData.orderId,
      orderNumber: orderData.orderNumber,
      message: `订单已发送到 ${sentCount} 台打印机`,
      printerCount: sentCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 处理打印订单时出错:', error);
    res.status(500).json({
      success: false,
      message: '处理订单失败: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// =============================================================================
// 新增：订单更新接口（用于触发实时更新）
// =============================================================================

app.post('/api/orders/update', (req, res) => {
  try {
    const { type, order, date } = req.body;
    
    console.log('📡 收到订单更新通知:', { type, orderId: order?.id, date });
    
    // 验证必需字段
    if (!type || !date) {
      return res.status(400).json({
        success: false,
        message: '缺少必需字段: type, date'
      });
    }
    
    if (type !== 'ORDER_DELETED' && !order) {
      return res.status(400).json({
        success: false,
        message: '非删除操作需要提供 order 数据'
      });
    }
    
    // 广播更新到相关的管理端客户端
    broadcastOrderUpdate(type, order || { id: req.body.orderId }, date);
    
    res.json({
      success: true,
      message: `订单更新 (${type}) 已广播`,
      adminClientCount: adminClients.size,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 处理订单更新时出错:', error);
    res.status(500).json({
      success: false,
      message: '处理订单更新失败: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 发送测试打印
app.post('/api/test-print', (req, res) => {
  const testOrder = {
    orderId: 'TEST-' + Date.now(),
    orderNumber: 'TEST-ORDER-' + Date.now(),
    orderDetails: {
      customerName: '测试顾客',
      customerPhone: '1234567890',
      items: [
        { 
          name: '测试菜品', 
          quantity: 1, 
          price: 10.00,
          selectedOptions: []
        }
      ],
      totalAmount: 10.00,
      customerNote: '这是一个测试订单',
      createdAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  let sentCount = 0;
  printers.forEach(printer => {
    if (printer.socket.connected) {
      printer.socket.emit('print-order', testOrder);
      sentCount++;
    }
  });

  console.log(`🧪 测试订单已发送到 ${sentCount} 台打印机`);

  res.json({
    success: true,
    message: `测试订单已发送到 ${sentCount} 台打印机`,
    testOrder,
    printerCount: sentCount
  });
});

// 测试订单更新广播
app.post('/api/test-order-update', (req, res) => {
  const testOrder = {
    id: 'TEST-ORDER-' + Date.now(),
    orderNumber: 'TEST-' + Date.now(),
    customerName: '测试顾客',
    totalAmount: 25.50,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  const testDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // 广播测试订单创建
  broadcastOrderUpdate('ORDER_CREATED', testOrder, testDate);
  
  res.json({
    success: true,
    message: '测试订单更新已广播',
    testOrder,
    testDate,
    adminClientCount: adminClients.size
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('💥 服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请联系技术支持'
  });
});

// 404 处理
app.use('*', (req, res) => {
  console.log(`❓ 未知路径: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: '路径不存在',
    availableEndpoints: [
      'GET /',
      'GET /health', 
      'GET /api/printers',
      'GET /api/admin-clients',
      'POST /api/orders/print',
      'POST /api/orders/update',
      'POST /api/test-print',
      'POST /api/test-order-update'
    ]
  });
});

// 启动服务器
const PORT = process.env.SOCKET_PORT || 3001;

server.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`🏪 餐厅打印&管理系统 Socket 服务器启动成功`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
  console.log(`🖨️ 打印机管理: http://localhost:${PORT}/api/printers`);
  console.log(`📊 管理端连接: http://localhost:${PORT}/api/admin-clients`);
  console.log(`📡 订单更新: POST http://localhost:${PORT}/api/orders/update`);
  console.log('🚀 ================================');
});

// 改进的优雅关闭处理
function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n🛑 收到 ${signal} 信号，正在关闭服务器...`);
  
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
  
  // 关闭所有socket连接
  io.close(() => {
    console.log('🔌 Socket.IO 已关闭');
    server.close(() => {
      console.log('✅ HTTP 服务器已关闭');
      process.exit(0);
    });
  });
  
  // 强制退出（防止挂起）
  setTimeout(() => {
    console.log('⏰ 强制退出');
    process.exit(1);
  }, 10000);
}

// 监听多种关闭信号
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGQUIT', () => shutdown('SIGQUIT'));

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('💥 未捕获的异常:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 未处理的Promise拒绝:', reason);
  shutdown('UNHANDLED_REJECTION');
});

// npm install express@4.18.2 socket.io@4 cors@2