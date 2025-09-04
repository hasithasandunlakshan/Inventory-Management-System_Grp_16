// 🚨 IMMEDIATE AUTHENTICATION FIX - COPY AND PASTE INTO CONSOLE
// This will authenticate you immediately

(async function immediateAuthFix() {
    console.log('🚨 EMERGENCY AUTHENTICATION FIX STARTING...');
    
    // Step 1: Clear all existing auth data
    console.log('🧹 Clearing existing authentication data...');
    localStorage.removeItem('inventory_auth_token');
    localStorage.removeItem('inventory_user_info');
    
    // Step 2: Get a fresh authentication token
    console.log('🔑 Getting fresh authentication token...');
    
    try {
        const response = await fetch('http://localhost:8090/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'storekeeper',
                password: 'password123'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store the fresh authentication data
            localStorage.setItem('inventory_auth_token', data.token);
            localStorage.setItem('inventory_user_info', JSON.stringify(data.user));
            
            console.log('✅ AUTHENTICATION SUCCESSFUL!');
            console.log('👤 Logged in as:', data.user.fullName);
            console.log('🎭 Role:', data.user.role);
            console.log('🎫 Token:', data.token.substring(0, 50) + '...');
            
            // Verify the token immediately
            console.log('🔍 Verifying token...');
            const verifyResponse = await fetch('http://localhost:8090/api/secure/user/current', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (verifyResponse.ok) {
                console.log('✅ TOKEN VERIFICATION SUCCESSFUL!');
                console.log('🔄 Reloading page in 2 seconds...');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                console.error('❌ Token verification failed:', verifyResponse.status);
            }
            
        } else {
            console.error('❌ Authentication failed:', data.error);
            
            // Try alternate credentials
            console.log('🔄 Trying alternate credentials...');
            const altResponse = await fetch('http://localhost:8090/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'password123'
                })
            });
            
            const altData = await altResponse.json();
            if (altData.success) {
                localStorage.setItem('inventory_auth_token', altData.token);
                localStorage.setItem('inventory_user_info', JSON.stringify(altData.user));
                console.log('✅ AUTHENTICATION SUCCESSFUL WITH ALTERNATE CREDENTIALS!');
                console.log('🔄 Reloading page...');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                console.error('❌ All authentication attempts failed');
                console.log('💡 Please use the login form manually with valid credentials');
            }
        }
        
    } catch (error) {
        console.error('❌ Network error during authentication:', error);
        console.log('💡 Please check that the backend is running and try again');
    }
})();

// Additional helper functions available after running the script
window.authDebug = {
    checkStatus() {
        const token = localStorage.getItem('inventory_auth_token');
        const user = localStorage.getItem('inventory_user_info');
        console.log('Token exists:', !!token);
        console.log('User exists:', !!user);
        if (user) console.log('User:', JSON.parse(user));
    },
    
    clearAuth() {
        localStorage.removeItem('inventory_auth_token');
        localStorage.removeItem('inventory_user_info');
        console.log('Auth cleared, refresh page');
    },
    
    testAPI() {
        const token = localStorage.getItem('inventory_auth_token');
        if (!token) {
            console.log('No token found');
            return;
        }
        
        fetch('http://localhost:8090/api/secure/user/current', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => console.log('✅ API test successful:', data))
        .catch(err => console.error('❌ API test failed:', err));
    }
};

console.log('🔧 Debug functions available: authDebug.checkStatus(), authDebug.clearAuth(), authDebug.testAPI()');
