# Backend API Verification Script
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "⚙️  BACKEND API VERIFICATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan

$BASE_URL = "http://localhost:5000/api"
$token = $null
$passedTests = 0
$failedTests = 0

# Test 1: Server Health
Write-Host "🧪 Test 1: Server Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -ErrorAction Stop
    Write-Host "   ✅ Status: Success" -ForegroundColor Green
    Write-Host "   Response: $($response.message)" -ForegroundColor Gray
    $passedTests++
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}
Write-Host ""

# Test 2: Admin Login
Write-Host "🧪 Test 2: Admin Login" -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@system.com"
        password = "Admin@123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Status: Success" -ForegroundColor Green
    Write-Host "   User: $($response.data.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($response.data.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($response.data.token.Substring(0, 30))..." -ForegroundColor Gray
    $token = $response.data.token
    $passedTests++
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}
Write-Host ""

if (-not $token) {
    Write-Host "⚠️  Cannot continue tests without authentication token`n" -ForegroundColor Yellow
    exit
}

# Test 3: Get Profile
Write-Host "🧪 Test 3: Get User Profile" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/profile" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Status: Success" -ForegroundColor Green
    Write-Host "   Email: $($response.data.email)" -ForegroundColor Gray
    Write-Host "   Name: $($response.data.full_name)" -ForegroundColor Gray
    Write-Host "   Role: $($response.data.role)" -ForegroundColor Gray
    $passedTests++
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}
Write-Host ""

# Test 4: Get Templates
Write-Host "🧪 Test 4: Get Templates" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$BASE_URL/templates" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Status: Success" -ForegroundColor Green
    Write-Host "   Templates found: $($response.data.Count)" -ForegroundColor Gray
    foreach ($template in $response.data) {
        Write-Host "      - $($template.name) ($($template.category))" -ForegroundColor Gray
    }
    $passedTests++
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}
Write-Host ""

# Test 5: Admin Dashboard Stats
Write-Host "🧪 Test 5: Admin Dashboard Statistics" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/dashboard" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Status: Success" -ForegroundColor Green
    Write-Host "   Total Users: $($response.data.totalUsers)" -ForegroundColor Gray
    Write-Host "   Total Documents: $($response.data.totalDocuments)" -ForegroundColor Gray
    Write-Host "   Pending Verifications: $($response.data.pendingVerifications)" -ForegroundColor Gray
    $passedTests++
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}
Write-Host ""

# Test 6: Invalid Login (Security Check)
Write-Host "🧪 Test 6: Invalid Login (Security Check)" -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@system.com"
        password = "WrongPassword123!"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ❌ Should have failed but succeeded" -ForegroundColor Red
    $failedTests++
} catch {
    Write-Host "   ✅ Correctly rejected invalid credentials" -ForegroundColor Green
    $passedTests++
}
Write-Host ""

# Test 7: Unauthorized Access
Write-Host "🧪 Test 7: Unauthorized Access Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/profile" -Method Get -ErrorAction Stop
    Write-Host "   ❌ Should have failed but succeeded" -ForegroundColor Red
    $failedTests++
} catch {
    Write-Host "   ✅ Correctly blocked unauthorized access" -ForegroundColor Green
    $passedTests++
}
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 BACKEND TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Passed: $passedTests" -ForegroundColor Green
Write-Host "❌ Failed: $failedTests" -ForegroundColor Red
$successRate = [math]::Round(($passedTests / ($passedTests + $failedTests)) * 100, 1)
Write-Host "📈 Success Rate: $successRate%" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan
