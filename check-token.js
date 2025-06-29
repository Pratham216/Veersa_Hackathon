// Simple token checker - run this in browser console
function checkToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found in localStorage');
        return;
    }
    
    try {
        // Decode JWT token (just the payload, no verification)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const now = Math.floor(Date.now() / 1000);
        const exp = decoded.exp;
        
        console.log('🔍 Token Details:');
        console.log('User ID:', decoded.userId);
        console.log('User Type:', decoded.userType);
        console.log('Issued At:', new Date(decoded.iat * 1000).toLocaleString());
        console.log('Expires At:', new Date(exp * 1000).toLocaleString());
        console.log('Current Time:', new Date().toLocaleString());
        
        if (exp < now) {
            console.log('❌ Token is EXPIRED');
            console.log('⚠️  Please log in again');
        } else {
            console.log('✅ Token is VALID');
            console.log('⏰ Expires in:', Math.floor((exp - now) / 60), 'minutes');
        }
        
    } catch (error) {
        console.log('❌ Error decoding token:', error.message);
        console.log('⚠️  Token appears to be malformed');
    }
}

// Run the check
checkToken();

// Also log token for manual inspection
console.log('Raw token:', localStorage.getItem('token'));
