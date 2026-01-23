$baseUrl = "http://localhost:8000"

# Credentials provided by user
$ownerParams = @{ phone = "2222222222"; password = "123"; role = "owner"; name="Owner"; taluka="Pune"; district="Pune"; village="Pune"; pincode=411000; state="MH"; email="owner@test.com" }
$adminParams = @{ phone = "3333333333"; password = "123"; role = "admin"; name="Admin"; taluka="Pune"; district="Pune"; village="Pune"; pincode=411000; state="MH"; email="admin@test.com" }
$farmerParams = @{ phone = "1111111111"; password = "123"; role = "farmer"; name="Farmer"; taluka="Pune"; district="Pune"; village="Pune"; pincode=411000; state="MH"; email="farmer@test.com" }

function Test-Req {
    param($Method, $Uri, $Body, $Token)
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $contentType = "application/json"
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -ContentType $contentType
        } else {
            $jsonBody = $Body | ConvertTo-Json -Depth 5
            $response = Invoke-RestMethod -Method $Method -Uri $Uri -Body $jsonBody -Headers $headers -ContentType $contentType
        }
        return $response
    } catch {
        Write-Host "Error calling $Uri" -ForegroundColor Red
        Write-Host $_.Exception.Message
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                Write-Host "Response Body: $($reader.ReadToEnd())"
            }
        }
        return $null
    }
}

Write-Host "--- 0. Connectivity Check ---" -ForegroundColor Cyan
try {
    $root = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/activate" -ErrorAction Stop
    Write-Host "Server Active. Response: $($root.message)" -ForegroundColor Green
} catch {
    Write-Host "Localhost failed, trying 127.0.0.1"
    $baseUrl = "http://127.0.0.1:8000"
    try {
        $root = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/activate" -ErrorAction Stop
        Write-Host "Server Active at 127.0.0.1. Response: $($root.message)" -ForegroundColor Green
    } catch {
        Write-Host "FATAL: Server not reachable." -ForegroundColor Red
        exit
    }
}

function Login-Or-Register {
    param($UserParams)
    Write-Host "Attempting Login for $($UserParams.role)..." -NoNewline
    $loginRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/users/login" -Body @{ phone = $UserParams.phone; password = $UserParams.password }
    
    if ($loginRes.token) {
        Write-Host " [SUCCESS]" -ForegroundColor Green
        return $loginRes
    } 
    
    Write-Host " [FAILED]. Attempting Registration..."
    $regRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/users/register" -Body $UserParams
    if ($regRes.message -match "success") {
        Write-Host "Registration Success. Retrying Login..."
        $loginRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/users/login" -Body @{ phone = $UserParams.phone; password = $UserParams.password }
        if ($loginRes.token) {
            Write-Host "Login [SUCCESS]" -ForegroundColor Green
            return $loginRes
        }
    }
    
    Write-Host "FATAL: Could not login or register $($UserParams.role)" -ForegroundColor Red
    return $null
}

$ownerAuth = Login-Or-Register -UserParams $ownerParams
$adminAuth = Login-Or-Register -UserParams $adminParams
$farmerAuth = Login-Or-Register -UserParams $farmerParams

if (-not ($ownerAuth -and $adminAuth -and $farmerAuth)) { exit }

Write-Host "--- 3. Owner Adds Equipment ---" -ForegroundColor Cyan
# Create unique equipment name to avoid duplicates if re-running
$equipName = "Tractor $(Get-Random)"
$equipData = @{
    owner_id = $ownerAuth.user_id
    equipment_name = $equipName
    category = "Tractor"
    district = "Pune"
    price_per_hour = 500
    price_per_day = 5000
    description = "Test Tractor"
    location = @{
        type = "Point"
        coordinates = @(73.8567, 18.5204)
    }
    location_label = "Model Colony"
}
$equipRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/equipments/add" -Body $equipData -Token $ownerAuth.token
$equipId = $equipRes.data._id
Write-Host "Equipment Added: $equipName (ID: $equipId). Status: $($equipRes.data.approval_status)"

if (-not $equipId) { Write-Host "Equipment creation failed."; exit }

Write-Host "--- 4. Admin Approves Equipment ---" -ForegroundColor Cyan
$adminUri = "$baseUrl/api/v1/admin/equipment/$equipId"
$modBody = @{ approval_status = "approved" }
$modRes = Test-Req -Method "PUT" -Uri $adminUri -Body $modBody -Token $adminAuth.token
Write-Host "Admin Approved: $($modRes.message)"

Write-Host "--- 5. Verify AI Features ---" -ForegroundColor Cyan
$demandRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/ai/predict-demand" -Body @{ equipment = "Tractor"; month = "June"; district = "Pune" }
Write-Host "Demand Prediction: $($demandRes.data.demand_score)"

$priceRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/ai/smart-pricing" -Body @{ equipment = "Tractor"; district = "Pune" }
Write-Host "Smart Pricing: $($priceRes.data.suggested_price)"

$recRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/ai/recommend" -Body @{ crop = "Wheat"; land_size = 5 }
Write-Host "Recommendations: $(($recRes.data.recommendations).Count) items found"

$impRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/ai/impact-analytics" -Body @{ hours_used = 50; equipment_type = "Tractor" }
Write-Host "Impact Savings: $($impRes.data.cost_savings)"

Write-Host "--- 6. Verify Location Tracking ---" -ForegroundColor Cyan
$trackBody = @{ lng = 73.9999; lat = 18.9999; location_label = "Live Update" }
$trackRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/equipments/location/$equipId" -Body $trackBody -Token $ownerAuth.token
Write-Host "Location Pushed: $($trackRes.message)"

$mapRes = Test-Req -Method "GET" -Uri "$baseUrl/api/v1/equipments/map?district=Pune" -Token $farmerAuth.token
$found = $null
foreach ($item in $mapRes.data) {
    if ($item._id -eq $equipId) { $found = $item }
}

if ($found) {
    if ($found.location.coordinates[0] -eq 73.9999) {
        Write-Host "SUCCESS: Location Map Verified!" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Location coordinates mismatch" -ForegroundColor Red
    }
} else {
    Write-Host "FAIL: Equipment not found in Map Listing" -ForegroundColor Red
}

Write-Host "--- ALL TESTS COMPLETED ---"
