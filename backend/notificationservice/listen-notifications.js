const WebSocket = require('ws');

console.log('🔔 Notification Listener for User 25');
console.log('============================\n');

// Configuration
const WS_URL = 'ws://shopmindnotification.app:8087/rn-notifications';
const USER_ID = '25';

console.log(`📍 WebSocket URL: ${WS_URL}`);
console.log(`👤 Listening for notifications for User ID: ${USER_ID}`);
console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
console.log('🎧 Listening for notifications...');
console.log('   (Press Ctrl+C to stop)\n');
console.log('━'.repeat(60) + '\n');

// Create WebSocket connection
const ws = new WebSocket(WS_URL);

// Connection opened
ws.on('open', () => {
  console.log('✅ Connected to notification service\n');
  
  // Subscribe with user ID
  const subscribeMessage = {
    type: 'subscribe',
    userId: USER_ID
  };
  
  ws.send(JSON.stringify(subscribeMessage));
  console.log(`📤 Subscribed as User ${USER_ID}\n`);
});

// Listen for messages
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`[${timestamp}] 📩 Message Received:`);
    console.log('━'.repeat(60));
    
    switch (message.type) {
      case 'connection':
        console.log('🔌 Connection established');
        console.log(`   Session ID: ${message.sessionId}`);
        console.log(`   Message: ${message.message}`);
        break;
        
      case 'subscribed':
        console.log('✅ Subscription confirmed');
        console.log(`   User ID: ${message.userId}`);
        console.log(`   Message: ${message.message}`);
        break;
        
      case 'notification':
        console.log('🔔 NEW NOTIFICATION RECEIVED!');
        console.log('━'.repeat(60));
        console.log(`   📋 ID: ${message.id}`);
        console.log(`   👤 User ID: ${message.userId}`);
        console.log(`   📝 Type: ${message.notificationType}`);
        console.log(`   💬 Message: ${message.message}`);
        console.log(`   📅 Timestamp: ${message.timestamp}`);
        console.log(`   📖 Read: ${message.isRead}`);
        
        if (message.metadata) {
          try {
            const metadata = typeof message.metadata === 'string' 
              ? JSON.parse(message.metadata) 
              : message.metadata;
            console.log('   📦 Metadata:');
            Object.entries(metadata).forEach(([key, value]) => {
              console.log(`      - ${key}: ${value}`);
            });
          } catch (e) {
            console.log(`   📦 Metadata: ${message.metadata}`);
          }
        }
        
        // Play a beep sound (if terminal supports it)
        console.log('\x07'); // Bell character
        break;
        
      case 'pong':
        console.log('💓 Heartbeat response');
        break;
        
      case 'error':
        console.log('❌ Error received from server');
        console.log(`   Message: ${message.message}`);
        break;
        
      default:
        console.log(`📨 Message type: ${message.type}`);
        console.log('   Full message:', JSON.stringify(message, null, 2));
    }
    
    console.log('━'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error parsing message:', error);
    console.log('Raw data:', data.toString());
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('\n❌ WebSocket error:', error.message);
});

// Handle connection close
ws.on('close', (code, reason) => {
  console.log('\n━'.repeat(60));
  console.log('🔌 Connection closed');
  console.log(`   Code: ${code}`);
  console.log(`   Reason: ${reason || 'No reason provided'}`);
  console.log(`   Time: ${new Date().toLocaleString()}`);
  console.log('━'.repeat(60));
});

// Send periodic pings to keep connection alive
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'ping',
      timestamp: Date.now()
    }));
  }
}, 30000); // Every 30 seconds

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  ws.close();
  process.exit(0);
});
