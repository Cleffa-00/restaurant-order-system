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
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 存储连接的打印机
const printers = new Map();

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('🔗 新客户端连接:', socket.id);

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
    console.log(`📊 当前连接数: ${printers.size}`);
    
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

  // 断开连接
  socket.on('disconnect', (reason) => {
    const printer = printers.get(socket.id);
    if (printer) {
      console.log(`❌ 打印机断开: ${printer.storeName} - ${reason}`);
    }
    printers.delete(socket.id);
    console.log(`📊 当前连接数: ${printers.size}`);
  });
});

// =============================================================================
// HTTP 路由
// =============================================================================

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '🏪 餐厅打印系统 Socket 服务器',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      printers: '/api/printers',
      printOrder: '/api/orders/print (POST)',
      testPrint: '/api/test-print (POST)'
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

  const healthData = {
    status: 'ok',
    server: '餐厅打印系统',
    printerCount: printers.size,
    printers: printerList,
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
      'POST /api/orders/print',
      'POST /api/test-print'
    ]
  });
});

// 启动服务器
const PORT = process.env.SOCKET_PORT || 3001;

server.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`🏪 餐厅打印系统 Socket 服务器启动成功`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
  console.log(`🖨️ 打印机管理: http://localhost:${PORT}/api/printers`);
  console.log('🚀 ================================');
});

// 优雅关闭
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('\n🛑 正在关闭服务器...');
  
  // 通知所有连接的打印机
  printers.forEach(printer => {
    if (printer.socket.connected) {
      printer.socket.emit('server-shutdown', { 
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