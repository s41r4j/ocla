# OCLA Development Server - Windows PowerShell
# Usage: .\scripts\dev.ps1

Write-Host "🔧 OCLA Development Server" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if node is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Navigate to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host ""
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check for .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  No .env.local found. Creating..." -ForegroundColor Yellow
    if (Test-Path ".env.local.example") {
        Copy-Item ".env.local.example" ".env.local"
        Write-Host "✅ Created .env.local from example" -ForegroundColor Green
    } else {
        "DATABASE_URL=" | Out-File -FilePath ".env.local" -Encoding utf8
        Write-Host "✅ Created empty .env.local" -ForegroundColor Green
    }
    Write-Host ""
}

# Generate Prisma client
Write-Host "🔨 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host ""

# Start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "   Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host ""
npm run dev
