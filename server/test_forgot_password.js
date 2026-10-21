const axios = require('axios');

async function testForgotPassword() {
    try {
        console.log('Testing Forgot Password API...');
        const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
            email: 'chiu11@gmail.com'
        });
        console.log('Response:', response.data);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

testForgotPassword();
