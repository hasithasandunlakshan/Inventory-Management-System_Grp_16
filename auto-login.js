// 🔐 AUTHENTICATION HELPER SCRIPT
// Copy and paste this entire script into your browser console

console.log('🔐 Starting Authentication Helper...');

// Clear any existing auth data
localStorage.removeItem('inventory_auth_token');
localStorage.removeItem('inventory_user_info');
console.log('✅ Cleared old authentication data');

// Function to login programmatically
async function loginUser(username, password) {
    try {
        console.log(`🔑 Attempting login for: ${username}`);
        
        const response = await fetch('http://localhost:8090/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store the authentication data
            localStorage.setItem('inventory_auth_token', data.token);
            localStorage.setItem('inventory_user_info', JSON.stringify(data.user));
            
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('👤 User:', data.user.fullName, `(${data.user.role})`);
            console.log('🎫 Token stored successfully');
            
            // Reload the page to trigger auth state update
            console.log('🔄 Reloading page in 2 seconds...');
            setTimeout(() => window.location.reload(), 2000);
            
            return true;
        } else {
            console.error('❌ Login failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        return false;
    }
}

// Try multiple common credentials
async function tryCredentials() {
    const credentialsList = [
        { username: 'storekeeper', password: 'password123' },
        { username: 'testuser', password: 'password123' },
        { username: 'admin', password: 'admin123' },
        { username: 'admin', password: 'admin' },
        { username: 'manager', password: 'password' },
        { username: 'storekeeper', password: 'password' }
    ];
    
    for (const creds of credentialsList) {
        console.log(`\n🧪 Trying ${creds.username}/${creds.password}...`);
        const success = await loginUser(creds.username, creds.password);
        if (success) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between attempts
    }
    
    console.log('\n❌ None of the test credentials worked.');
    console.log('💡 Please use the login form in the application with valid credentials.');
}

// Start the authentication process
console.log('🚀 Trying common credentials...\n');
tryCredentials();
