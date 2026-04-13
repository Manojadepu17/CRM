const BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    let data = null;
    try {
        data = await response.json();
    } catch (_) {
        data = null;
    }

    if (!response.ok) {
        const error = new Error(data?.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return { status: response.status, data };
}

async function checkBackend() {
    console.log('═══════════════════════════════════════════════');
    console.log('⚙️  BACKEND API VERIFICATION');
    console.log('═══════════════════════════════════════════════\n');
    
    let token = null;
    let passedTests = 0;
    let failedTests = 0;
    
    // Test 1: Server Health
    try {
        console.log('🧪 Test 1: Server Health Check');
        const response = await request(`${BASE_URL.replace('/api', '')}/health`);
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   Response:`, response.data);
        passedTests++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        failedTests++;
    }
    console.log('');
    
    // Test 2: Admin Login
    try {
        console.log('🧪 Test 2: Admin Login');
        const response = await request(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@system.com',
                password: 'Admin@123'
            })
        });
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   User:`, response.data.data.user.email);
        console.log(`   Role:`, response.data.data.user.role);
        console.log(`   Token: ${response.data.data.token.substring(0, 30)}...`);
        token = response.data.data.token;
        passedTests++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.data?.message || error.message}`);
        failedTests++;
    }
    console.log('');
    
    if (!token) {
        console.log('⚠️  Cannot continue tests without authentication token\n');
        return;
    }
    
    // Test 3: Get Profile
    try {
        console.log('🧪 Test 3: Get User Profile');
        const response = await request(`${BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   Profile:`, response.data.data);
        passedTests++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.data?.message || error.message}`);
        failedTests++;
    }
    console.log('');
    
    // Test 4: Get Templates
    try {
        console.log('🧪 Test 4: Get Templates');
        const response = await request(`${BASE_URL}/templates`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const templates = response.data?.data?.templates || response.data?.data || [];
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   Templates found: ${templates.length}`);
        templates.forEach((template, index) => {
            console.log(`      ${index + 1}. ${template.name} (${template.category})`);
        });
        passedTests++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.data?.message || error.message}`);
        failedTests++;
    }
    console.log('');
    
    // Test 5: Get Admin Dashboard Stats
    try {
        console.log('🧪 Test 5: Admin Dashboard Statistics');
        const response = await request(`${BASE_URL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   Stats:`, response.data.data);
        passedTests++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.data?.message || error.message}`);
        failedTests++;
    }
    console.log('');
    
    // Test 6: Get Verification Status (should fail for admin)
    try {
        console.log('🧪 Test 6: Get Verification Status');
        const response = await request(`${BASE_URL}/verification/status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   Verification:`, response.data.data || 'None');
        passedTests++;
    } catch (error) {
        if (error.status === 404) {
            console.log(`   ℹ️  No verification found (expected for admin)`);
            passedTests++;
        } else {
            console.log(`   ❌ Failed: ${error.data?.message || error.message}`);
            failedTests++;
        }
    }
    console.log('');
    
    // Test 7: Invalid Login
    try {
        console.log('🧪 Test 7: Invalid Login (Security Check)');
        const response = await request(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@system.com',
                password: 'WrongPassword123!'
            })
        });
        console.log(`   ❌ Should have failed but got: ${response.status}`);
        failedTests++;
    } catch (error) {
        if (error.status === 400 || error.status === 401) {
            console.log(`   ✅ Correctly rejected invalid credentials`);
            passedTests++;
        } else {
            console.log(`   ⚠️  Unexpected error: ${error.message}`);
            failedTests++;
        }
    }
    console.log('');
    
    // Test 8: Unauthorized Access
    try {
        console.log('🧪 Test 8: Unauthorized Access Check');
        const response = await request(`${BASE_URL}/auth/profile`);
        console.log(`   ❌ Should have failed but got: ${response.status}`);
        failedTests++;
    } catch (error) {
        if (error.status === 401) {
            console.log(`   ✅ Correctly blocked unauthorized access`);
            passedTests++;
        } else {
            console.log(`   ⚠️  Unexpected error: ${error.message}`);
            failedTests++;
        }
    }
    console.log('');
    
    // Summary
    console.log('═══════════════════════════════════════════════');
    console.log('📊 BACKEND TEST SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    console.log('═══════════════════════════════════════════════\n');
}

checkBackend().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
});
