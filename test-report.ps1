Param()

$ErrorActionPreference = 'Stop'

$base = "http://localhost:5000/api"

Write-Host "=== LOGIN USER ==="
$userResp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body (@{
    email = 'user@example.com'
    password = 'password123'
} | ConvertTo-Json) -ContentType 'application/json'
$userToken = $userResp.token
Write-Host "User token obtained"

Write-Host "=== FETCH EVENTS ==="
$events = Invoke-RestMethod -Method Get -Uri "$base/events"
if ($events.events.Count -eq 0) {
    Write-Error "No events found; cannot continue test."
    exit 1
}
$eventId = $events.events[0]._id
Write-Host "Using event id $eventId"

Write-Host "=== CREATE REPORT ==="
$reportResp = Invoke-RestMethod -Method Post -Uri "$base/reports" -Headers @{ 'x-auth-token' = $userToken } -Body (@{
    eventId = $eventId
    reason = 'Test report from automation'
} | ConvertTo-Json) -ContentType 'application/json'
$reportId = $reportResp._id
Write-Host "Report created with id $reportId"

Write-Host "=== LOGIN ADMIN ==="
$adminResp = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body (@{
    email = 'admin@example.com'
    password = 'nodeEvent'
} | ConvertTo-Json) -ContentType 'application/json'
$adminToken = $adminResp.token
Write-Host "Admin token obtained"

Write-Host "=== FETCH ALL REPORTS (ADMIN) ==="
$reports = Invoke-RestMethod -Method Get -Uri "$base/reports/all" -Headers @{ 'x-auth-token' = $adminToken }
$reportCount = if ($reports -is [System.Array]) { $reports.Count } else { if ($null -ne $reports) { 1 } else { 0 } }
Write-Host "Reports count:" $reportCount

Write-Host "=== RESOLVE REPORT ==="
$resolveResp = Invoke-RestMethod -Method Put -Uri "$base/reports/$reportId/resolve" -Headers @{ 'x-auth-token' = $adminToken }
Write-Host "Resolved status:" $resolveResp.status

Write-Host "=== TEST COMPLETED SUCCESSFULLY ==="