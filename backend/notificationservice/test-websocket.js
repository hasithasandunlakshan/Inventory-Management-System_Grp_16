const WebSocket = require('ws');

console.log('🧪 WebSocket Connection Test');
console.log('============================\n');

// Test configuration
const WS_URL = 'ws://localhost:8087/rn-notifications';
const USER_ID = '25';

console.log(`📍 WebSocket URL: ${WS_URL}`);
console.log(`👤 User ID: ${USER_ID}\n`);

// Create WebSocket connection
console.log('🔌 Connecting to WebSocket...');
const ws = new WebSocket(WS_URL);

// Connection opened
ws.on('open', () => {
  console.log('✅ Connection established!\n');
  
  // Send subscribe message
  const subscribeMessage = {
    type: 'subscribe',
    userId: USER_ID
  };
  
  console.log('📤 Sending subscribe message:', JSON.stringify(subscribeMessage, null, 2));
  ws.send(JSON.stringify(subscribeMessage));
  
  // Send a ping after 2 seconds
  setTimeout(() => {
    const pingMessage = {
      type: 'ping',
      timestamp: Date.now()
    };
    console.log('\n📤 Sending ping:', JSON.stringify(pingMessage, null, 2));
    ws.send(JSON.stringify(pingMessage));
  }, 2000);
});

// Listen for messages
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('\n📩 Received message:');
    console.log(JSON.stringify(message, null, 2));
    
    // Log specific message types
    switch(message.type) {
      case 'connection':
        console.log('✅ Connection confirmed by server');
        break;
      case 'subscribed':
        console.log('✅ Successfully subscribed for user:', message.userId);
        break;
      case 'notification':
        console.log('🔔 NEW NOTIFICATION:');
        console.log('   - Message:', message.message);
        console.log('   - Type:', message.notificationType);
        console.log('   - User ID:', message.userId);
        break;
      case 'pong':
        console.log('💓 Pong received');
        break;
      case 'error':
        console.log('❌ Error from server:', message.message);
        break;
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
    console.log('Raw data:', data.toString());
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('\n❌ WebSocket error:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('   Connection refused. Is the server running?');
  }
});

// Handle connection close
ws.on('close', (code, reason) => {
  console.log(`\n🔌 Connection closed`);
  console.log(`   Code: ${code}`);
  console.log(`   Reason: ${reason || 'No reason provided'}`);
  process.exit(0);
});

// Keep the connection alive for 30 seconds
console.log('\n⏱️  Keeping connection alive for 30 seconds...');
console.log('   (Press Ctrl+C to exit earlier)\n');

setTimeout(() => {
  console.log('\n⏰ Test timeout reached. Closing connection...');
  ws.close();
}, 30000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Closing connection...');
  ws.close();
  process.exit(0);
});
