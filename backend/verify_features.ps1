$baseUrl = "http://127.0.0.1:8000"

function Get-RandomPhone {
    return "9" + (Get-Random -Minimum 100000000 -Maximum 999999999).ToString()
}

$ownerParams = @{
    name = "Owner Auto"
    email = "owner_auto_$(Get-Random)@test.com"
    phone = Get-RandomPhone
    password = "password123"
    role = "owner"
    taluka = "Haveli"
    district = "Pune"
    village = "Wagholi"
    pincode = 412207
    state = "Maharashtra"
}
$adminParams = @{
    name = "Admin Auto"
    email = "admin_auto_$(Get-Random)@test.com"
    phone = Get-RandomPhone
    password = "password123"
    role = "admin"
    taluka = "Pune City"
    district = "Pune"
    village = "Shivajinagar"
    pincode = 411005
    state = "Maharashtra"
}
$farmerParams = @{
    name = "Farmer Auto"
    email = "farmer_auto_$(Get-Random)@test.com"
    phone = Get-RandomPhone
    password = "password123"
    role = "farmer"
    taluka = "Mulshi"
    district = "Pune"
    village = "Hinjewadi"
    pincode = 411057
    state = "Maharashtra"
}

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
    $root = Invoke-RestMethod -Method Get -Uri "$baseUrl/"
    Write-Host "Root Response: $root" -ForegroundColor Green
} catch {
    Write-Host "Root Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host "--- 1. Registering Users ---" -ForegroundColor Cyan
Test-Req -Method Post -Uri "$baseUrl/api/v1/users/register" -Body $ownerParams | Out-Null
Start-Sleep -Seconds 1
Test-Req -Method Post -Uri "$baseUrl/api/v1/users/register" -Body $adminParams | Out-Null
Start-Sleep -Seconds 1
Test-Req -Method Post -Uri "$baseUrl/api/v1/users/register" -Body $farmerParams | Out-Null
Start-Sleep -Seconds 1

Write-Host "--- 2. Logging In ---" -ForegroundColor Cyan
$ownerLogin = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/users/login" -Body @{ phone = $ownerParams.phone; password = $ownerParams.password }
$ownerToken = $ownerLogin.token
$ownerId = $ownerLogin.user_id
Write-Host "Owner Token Acquired: $($ownerToken -ne $null)"

$adminLogin = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/users/login" -Body @{ phone = $adminParams.phone; password = $adminParams.password }
$adminToken = $adminLogin.token
Write-Host "Admin Token Acquired: $($adminToken -ne $null)"

$farmerLogin = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/users/login" -Body @{ phone = $farmerParams.phone; password = $farmerParams.password }
$farmerToken = $farmerLogin.token
Write-Host "Farmer Token Acquired: $($farmerToken -ne $null)"

if (-not $ownerToken) { Write-Host "Skipping Owner actions (no token)"; exit }

Write-Host "--- 3. Owner Adds Equipment ---" -ForegroundColor Cyan
$equipData = @{
    owner_id = $ownerId
    equipment_name = "Auto Tractor XL"
    category = "Tractor"
    district = "Pune"
    price_per_hour = 500
    price_per_day = 5000
    description = "Best tractor"
    location = @{
        type = "Point"
        coordinates = @(73.8567, 18.5204)
    }
    location_label = "Pune City Center"
}
$equipRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/equipments/add" -Body $equipData -Token $ownerToken
$equipId = $equipRes.data._id
Write-Host "Equipment Added (ID: $equipId). Status: $($equipRes.data.approval_status)"

if (-not $equipId) { Write-Host "Equipment creation failed. Exiting."; exit }

Write-Host "--- 4. Admin Approves Equipment ---" -ForegroundColor Cyan
if (-not $adminToken) { Write-Host "Skipping Admin actions (no token)"; }
else {
    $adminUri = "$baseUrl/api/v1/admin/equipment/$equipId"
    $modBody = @{ approval_status = "approved" }
    $modRes = Test-Req -Method "PUT" -Uri $adminUri -Body $modBody -Token $adminToken
    Write-Host "Admin Modification Response: $($modRes.message)"
}

Write-Host "--- 5. Verify AI Features (Mocked) ---" -ForegroundColor Cyan
# Demand
$demandBody = @{ equipment = "Tractor"; month = "June"; district = "Pune" }
$demandRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/ai/predict-demand" -Body $demandBody
Write-Host "Usage Demand Prediction: $($demandRes.data.demand_score)/100 ($($demandRes.data.demand_level))"

# Pricing
$priceBody = @{ equipment = "Tractor"; district = "Pune" }
$priceRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/ai/smart-pricing" -Body $priceBody
Write-Host "Smart Pricing Recommendation: $($priceRes.data.suggested_price) (vs Market: $($priceRes.data.market_average))"

# Recommendations
$recBody = @{ crop = "Wheat"; land_size = 5 }
$recRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/ai/recommend" -Body $recBody
Write-Host "Recommendations Count: $($recRes.data.recommendations.Count)"

# Impact
$impBody = @{ hours_used = 50; equipment_type = "Tractor" }
$impRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/ai/impact-analytics" -Body $impBody
Write-Host "Impact Analytics: Saved $($impRes.data.cost_savings) INR"

Write-Host "--- 6. Verify Location Tracking ---" -ForegroundColor Cyan
$trackBody = @{
    lng = 73.9000
    lat = 18.6000
    location_label = "Updated Location"
}
$trackRes = Test-Req -Method "POST" -Uri "$baseUrl/api/v1/equipments/location/$equipId" -Body $trackBody -Token $ownerToken
Write-Host "Location Update Response: $($trackRes.message)"

$mapRes = Test-Req -Method "GET" -Uri "$baseUrl/api/v1/equipments/map?district=Pune" -Token $farmerToken
$mapItem = $mapRes.data | Where-Object { $_._id -eq $equipId }
if ($mapItem) {
    Write-Host "Verified: Location map updated to $($mapItem.location.coordinates -join ', ')" -ForegroundColor Green
} else {
    Write-Host "Error: Location mismatch or not found in map list." -ForegroundColor Red
}

Write-Host "--- TEST COMPLETE ---" -ForegroundColor Cyan
