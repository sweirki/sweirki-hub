Write-Host " Scanning for BOM in all JSON files..." -ForegroundColor Cyan

Get-ChildItem -Path . -Recurse -Include *.json | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    # Rewrite file without BOM
    [System.IO.File]::WriteAllText($_.FullName, $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Host " Fixed (BOM removed):" $_.FullName -ForegroundColor Green
}

Write-Host "`n All JSON files rewritten without BOM." -ForegroundColor Yellow
