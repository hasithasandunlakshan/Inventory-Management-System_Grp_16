# 🔗 Notification Service Connection URLs

## ✅ Working Connections

### 📡 **Domain-Based URLs (Recommended for Production)**

#### HTTP Endpoints:
```
Health Check:    http://shopmindnotification.app:8087/api/health
Notifications:   http://shopmindnotification.app:8087/api/notifications
User Notifications: http://shopmindnotification.app:8087/api/notifications/user/{userId}
```

#### WebSocket Endpoints:
```
Native WebSocket:  ws://shopmindnotification.app:8087/rn-notifications
STOMP WebSocket:   ws://shopmindnotification.app:8087/ws
Alternative:       ws://shopmindnotification.app:8087/websocket
```

### 🌐 **IP-Based URLs (Development/Testing)**

#### HTTP Endpoints:
```
Health Check:    http://34.136.119.127:8087/api/health
Notifications:   http://34.136.119.127:8087/api/notifications
User Notifications: http://34.136.119.127:8087/api/notifications/user/{userId}
```

#### WebSocket Endpoints:
```
Native WebSocket:  ws://34.136.119.127:8087/rn-notifications
STOMP WebSocket:   ws://34.136.119.127:8087/ws
Alternative:       ws://34.136.119.127:8087/websocket
```

### 🏠 **Localhost URLs (Local Development)**

#### HTTP Endpoints:
```
Health Check:    http://localhost:8087/api/health
Notifications:   http://localhost:8087/api/notifications
User Notifications: http://localhost:8087/api/notifications/user/{userId}
```

#### WebSocket Endpoints:
```
Native WebSocket:  ws://localhost:8087/rn-notifications
STOMP WebSocket:   ws://localhost:8087/ws
Alternative:       ws://localhost:8087/websocket
```

---

## 📱 React Native Configuration

### ✅ **For Production (Use Domain):**

```typescript
// config/apiConfig.ts

// ✅ Use WS (not WSS) because server doesn't have SSL certificate
export const WEBSOCKET_URL = 'ws://shopmindnotification.app:8087/rn-notifications';
export const NOTIFICATION_API_URL = 'http://shopmindnotification.app:8087';

// ❌ DON'T use WSS - will fail
// export const WEBSOCKET_URL = 'wss://shopmindnotification.app/rn-notifications';
```

### 🏠 **For Local Development:**

```typescript
// config/apiConfig.ts
export const WEBSOCKET_URL = 'ws://localhost:8087/rn-notifications';
export const NOTIFICATION_API_URL = 'http://localhost:8087';
```

---

## 🔧 Connection Methods

### **Option 1: Native WebSocket (Recommended)**

```typescript
const ws = new WebSocket('ws://shopmindnotification.app:8087/rn-notifications');

ws.onopen = () => {
  // Subscribe with userId
  ws.send(JSON.stringify({
    type: 'subscribe',
    userId: '25'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification') {
    console.log('Notification:', data.message);
  }
};
```

### **Option 2: STOMP WebSocket**

```typescript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const socket = new SockJS('http://shopmindnotification.app:8087/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
  // Subscribe to user-specific queue
  stompClient.subscribe('/user/queue/notifications', (message) => {
    const notification = JSON.parse(message.body);
    console.log('Notification:', notification);
  });
});
```

---

## ⚠️ Important Notes

### **SSL/TLS (HTTPS/WSS)**
- ❌ **Not configured yet**: Server doesn't have SSL certificate
- ❌ **Don't use `wss://`** - will fail with connection error
- ✅ **Use `ws://`** for now (works fine)

### **Port 8087**
- ⚠️ **Must include port** when using domain: `ws://shopmindnotification.app:8087/...`
- ❌ **Will fail without port**: `ws://shopmindnotification.app/...`

### **DNS Configuration**
- ✅ Domain points to: `34.136.119.127`
- ✅ DNS is working correctly

---

## 🧪 Testing

### **Test Health Endpoint:**
```bash
curl http://shopmindnotification.app:8087/api/health
```

### **Test WebSocket (Node.js):**
```bash
node listen-notifications.js
```

### **Test from Browser Console:**
```javascript
const ws = new WebSocket('ws://shopmindnotification.app:8087/rn-notifications');
ws.onopen = () => ws.send(JSON.stringify({type: 'subscribe', userId: '25'}));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## 🚀 Status

| Component | Status | URL |
|-----------|--------|-----|
| Domain DNS | ✅ Working | shopmindnotification.app → 34.136.119.127 |
| HTTP API | ✅ Working | http://shopmindnotification.app:8087 |
| WebSocket | ✅ Working | ws://shopmindnotification.app:8087/rn-notifications |
| SSL/HTTPS | ❌ Not configured | N/A |
| Port 8087 | ✅ Open | Required in URL |

---

## 📝 Next Steps (Optional)

To enable HTTPS/WSS:
1. Install Nginx as reverse proxy
2. Get SSL certificate (Let's Encrypt)
3. Configure Nginx to handle SSL and forward to port 8087
4. Then you can use: `wss://shopmindnotification.app/rn-notifications` (without port)
