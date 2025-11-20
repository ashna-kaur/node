# create-events.ps1
param()

$ErrorActionPreference = 'Stop'

$base       = 'http://localhost:5000'
$loginUrl   = "$base/api/auth/login"
$eventsUrl  = "$base/api/events"

Write-Host 'Login admin...'
$adminResp  = Invoke-RestMethod -Method POST -Uri $loginUrl `
              -Body (@{ email='admin@example.com'; password='nodeEvent' } | ConvertTo-Json) `
              -ContentType 'application/json'
$adminToken = $adminResp.token
Write-Host 'Admin token obtained'

Write-Host 'Login user...'
$userResp   = Invoke-RestMethod -Method POST -Uri $loginUrl `
              -Body (@{ email='user@example.com'; password='password123' } | ConvertTo-Json) `
              -ContentType 'application/json'
$userToken  = $userResp.token
Write-Host 'User token obtained'

$categories = @('Music','Sports','Art','Food','Technology','Business','Health','Education','Other')
$idx = 1
foreach ($cat in $categories) {
    for ($i = 1; $i -le 3; $i++) {
        $body = @{
            title       = "$cat Event $i"
            description = "Description for $cat event $i"
            date        = (Get-Date).AddDays($idx).ToString('o') # ISO 8601 format
            location    = "City $idx"
            capacity    = 100
            category    = $cat
        } | ConvertTo-Json

        # First event overall created by admin, others by user
        if ($idx -eq 1) {
            $token = $adminToken
        } else {
            $token = $userToken
        }

        $role = if ($idx -eq 1) { 'admin' } else { 'user' }
        Write-Host "Creating $cat event $i (index $idx) as $role ..."
        Invoke-RestMethod -Method POST -Uri $eventsUrl `
            -Headers @{ 'x-auth-token' = $token } `
            -Body $body -ContentType 'application/json'

        $idx++
    }
}

Write-Host 'Event generation completed successfully'