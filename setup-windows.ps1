# setup-windows.ps1 — One-shot installer for GHOST S1 on Windows
# Usage: right-click → "Run with PowerShell" or: .\setup-windows.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  GHOST S1 Setup (Windows)            " -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

$MODEL_BASE = "qwen2.5:1.5b"
$MODEL_NAME = "ghost-s1"
$OLLAMA_EXE = "ollama"

# ── 1. Check Ollama ──
Write-Host "[1/5] Checking Ollama..." -ForegroundColor Cyan
$ollamaFound = $false
try {
    $ver = & $OLLAMA_EXE --version 2>$null
    if ($ver) { $ollamaFound = $true }
} catch {}

if (-not $ollamaFound) {
    # Check common install paths
    $candidates = @(
        "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe",
        "$env:PROGRAMFILES\Ollama\ollama.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) {
            $OLLAMA_EXE = $c
            $ollamaFound = $true
            Write-Host "  Found Ollama at: $c"
            break
        }
    }
}

if (-not $ollamaFound) {
    Write-Host ""
    Write-Host "  Ollama NOT found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Please install Ollama manually:" -ForegroundColor Yellow
    Write-Host "    https://ollama.com/download/windows" -ForegroundColor White
    Write-Host ""
    Write-Host "  After installing, re-run this script."
    pause
    exit 1
}

Write-Host "  Ollama is installed." -ForegroundColor Green

# ── 2. Start Ollama ──
Write-Host ""
Write-Host "[2/5] Checking Ollama server..." -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:11434" -Method Get -ErrorAction Stop -TimeoutSec 3
    Write-Host "  Ollama server is running." -ForegroundColor Green
} catch {
    Write-Host "  Starting Ollama server..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:11434" -Method Get -ErrorAction Stop -TimeoutSec 5
        Write-Host "  Ollama server is now running." -ForegroundColor Green
    } catch {
        Write-Host "  Ollama server does not appear to be running." -ForegroundColor Red
        Write-Host "  Try starting it manually:" -ForegroundColor Yellow
        Write-Host "    $OLLAMA_EXE serve"
        Write-Host ""
        pause
        exit 1
    }
}

# ── 3. Pull base model ──
Write-Host ""
Write-Host "[3/5] Pulling base model ($MODEL_BASE)..." -ForegroundColor Cyan
Write-Host "  This may take a few minutes (downloading ~986 MB)..." -ForegroundColor Gray
& $OLLAMA_EXE pull $MODEL_BASE
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Model pull failed. Check your internet connection." -ForegroundColor Red
    pause
    exit 1
}

# ── 4. Create custom model ──
Write-Host ""
Write-Host "[4/5] Creating custom model '$MODEL_NAME'..." -ForegroundColor Cyan
if (-not (Test-Path "Modelfile-ghost")) {
    Write-Host "  ERROR: Modelfile-ghost not found in this directory." -ForegroundColor Red
    pause
    exit 1
}
& $OLLAMA_EXE create $MODEL_NAME -f Modelfile-ghost
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Model creation failed." -ForegroundColor Red
    pause
    exit 1
}
Write-Host "  Model '$MODEL_NAME' created." -ForegroundColor Green

# ── 5. Initialize database ──
Write-Host ""
Write-Host "[5/5] Checking SQLite database..." -ForegroundColor Cyan

$PHP_EXE = "php"
$phpFound = $false
try { $v = & $PHP_EXE -v 2>$null; if ($v) { $phpFound = $true } } catch {}

if (-not $phpFound) {
    $phpCandidates = @(
        "C:\xampp\php\php.exe",
        "C:\wamp64\bin\php\php.exe",
        "C:\laragon\bin\php\php.exe",
        "$env:ProgramFiles\php\php.exe"
    )
    foreach ($c in $phpCandidates) {
        if (Test-Path $c) {
            $PHP_EXE = $c
            $phpFound = $true
            Write-Host "  Found PHP at: $c"
            break
        }
    }
}

if (-not $phpFound) {
    Write-Host ""
    Write-Host "  PHP NOT found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Install PHP first, then re-run this script. Recommended:" -ForegroundColor Yellow
    Write-Host "    XAMPP: https://www.apachefriends.org/" -ForegroundColor White
    Write-Host "    Or standalone: https://windows.php.net/download/" -ForegroundColor White
    Write-Host ""
    Write-Host "  After installing, make sure 'php' is available in your PATH."
    pause
    exit 1
}

# Initialize SQLite DB
& $PHP_EXE -r "`$db = new PDO('sqlite:chats.db'); `$db->exec('CREATE TABLE IF NOT EXISTS chats (id INTEGER PRIMARY KEY, title TEXT, model TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'); `$db->exec('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, chat_id INTEGER, role TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');"
Write-Host "  Database ready." -ForegroundColor Green

# ── Done ──
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!                       " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Start the project:"
Write-Host "  cd $(Get-Location)"
Write-Host "  $PHP_EXE -S 0.0.0.0:8080"
Write-Host ""
Write-Host "Open in browser:"
Write-Host "  http://localhost:8080"
Write-Host ""
Write-Host "NOTE: If using XAMPP, you may also place this folder in"
Write-Host "      C:\xampp\htdocs\ghost-s1"
Write-Host "      and visit http://localhost/ghost-s1/"
Write-Host ""
pause
