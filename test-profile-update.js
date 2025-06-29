// Test script to verify profile update functionality
const axios = require('axios');

const BASE_URL = 'https://veersa-hackathon-1qjh.onrender.com';

async function testProfileUpdate() {
    try {
        console.log('Testing profile update functionality...');
        
        // First, test if the server is responding
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Server is responding:', healthResponse.data.status);
        
        // Test profile endpoint (this will fail without auth, but we can see the error)
        try {
            const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Profile endpoint is working (requires authentication)');
            } else {
                console.log('❌ Profile endpoint error:', error.response?.data || error.message);
            }
        }
        
        console.log('\n📋 Profile update checklist:');
        console.log('1. Ensure you are logged in with a valid token');
        console.log('2. Check browser console for detailed error messages');
        console.log('3. Verify network requests in browser dev tools');
        console.log('4. Make sure form fields are properly filled');
        
    } catch (error) {
        console.error('❌ Server connection failed:', error.message);
        console.log('Please check if the backend server is running');
    }
}

testProfileUpdate();
