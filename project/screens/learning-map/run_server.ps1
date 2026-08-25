# Simple PowerShell HTTP Server to serve ThinkBin Learning Map on localhost
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  ThinkBin Learning Map Local Server" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Menjalankan server di http://localhost:$port/" -ForegroundColor Cyan
Write-Host "Buka link di atas pada browser Anda untuk melihat proyek." -ForegroundColor Yellow
Write-Host "Tekan Ctrl+C di jendela ini untuk mematikan server." -ForegroundColor Red
Write-Host "-----------------------------------------"

try {
    $listener.Start()
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        if ($url -eq "/") { $url = "/index.html" }
        
        # Build path relative to script directory
        $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
        $filePath = [System.IO.Path]::Combine($scriptPath, $url.TrimStart('/'))
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Determine content type
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $url")
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    $listener.Stop()
}
