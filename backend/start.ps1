# VetCore Backend Başlatma Scripti
# PowerShell 5.1 ve üzeri için tasarlanmıştır

param(
    [string]$Port = "8000",
    [switch]$InstallDeps,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
VetCore Backend Başlatma Scripti

Kullanım:
  .\start.ps1 [Seçenekler]

Seçenekler:
  -Port <numarası>      Backend port'u (varsayılan: 8000)
  -InstallDeps          Bağımlılıkları tekrar yükle
  -Help                 Bu yardım mesajını göster

Örnekler:
  .\start.ps1                          # Varsayılan ayarlarla başlat
  .\start.ps1 -Port 9000              # 9000 portunda başlat
  .\start.ps1 -InstallDeps            # Bağımlılıkları yükleyerek başlat
"@
    exit 0
}

# Renkler
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Status {
    param([string]$Message, [string]$Color = $InfoColor)
    Write-Host "► $Message" -ForegroundColor $Color
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $ErrorColor
}

function Write-Success-Message {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $SuccessColor
}

# İlk adım: Script dizinini kontrol et
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPath = Join-Path $BackendDir "venv"
$AppPath = Join-Path $BackendDir "app"
$EnvFile = Join-Path $BackendDir ".env"

Write-Status "VetCore Backend Başlatılıyor..." $InfoColor
Write-Host ""

# 1. Virtual Environment kontrol
if (Test-Path $VenvPath) {
    Write-Status "Virtual environment bulundu"
} else {
    Write-Status "Virtual environment oluşturuluyor..."
    try {
        python -m venv $VenvPath
        Write-Success-Message "Virtual environment oluşturuldu"
    } catch {
        Write-Error-Message "Virtual environment oluşturulamadı: $_"
        exit 1
    }
}

# 2. Virtual Environment'i aktive et
$ActivateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
if (Test-Path $ActivateScript) {
    try {
        & $ActivateScript
        Write-Success-Message "Virtual environment aktive edildi"
    } catch {
        Write-Error-Message "Virtual environment aktive edilemedi: $_"
        exit 1
    }
} else {
    Write-Error-Message "Activation script bulunamadı"
    exit 1
}

# 3. .env dosyası kontrol
if (-not (Test-Path $EnvFile)) {
    Write-Status ".env dosyası oluşturuluyor..."
    $EnvContent = @"
# Database Configuration
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/vetcore_db

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0
DEBUG=True

# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production

# Email Configuration (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# RAG/ChromaDB Configuration
CHROMA_DB_PATH=./chroma_db
"@
    Set-Content -Path $EnvFile -Value $EnvContent
    Write-Status "Lütfen .env dosyasını düzenleyerek konfigürasyonu yapılandırın"
} else {
    Write-Status ".env dosyası bulundu"
}

# 4. Bağımlılıkları yükle
$RequirementsFile = Join-Path $BackendDir "requirements.txt"
if ($InstallDeps -or $true) {
    if (Test-Path $RequirementsFile) {
        Write-Status "Bağımlılıklar yükleniyor..."
        try {
            pip install -q -r $RequirementsFile
            Write-Success-Message "Bağımlılıklar yüklendi"
        } catch {
            Write-Error-Message "Bağımlılıklar yüklenemedi: $_"
            exit 1
        }
    }
}

# 5. Veritabanı bağlantısını kontrol et
Write-Status "Veritabanı bağlantısı kontrol ediliyor..."
try {
    python -c @"
import sys
import os
sys.path.insert(0, r'$BackendDir')
from app.core.database import engine
with engine.connect() as conn:
    print('OK')
"@
    Write-Success-Message "Veritabanı bağlantısı başarılı"
} catch {
    Write-Host ""
    Write-Status "⚠️ Veritabanı bağlantısı başarısız" $WarningColor
    Write-Host "   Lütfen .env dosyasındaki DATABASE_URL'i kontrol edin" -ForegroundColor $WarningColor
    Write-Host "   Database ayarlarını yapılandırıp tekrar deneyebilirsiniz" -ForegroundColor $WarningColor
}

# 6. Backend'i başlat
Write-Host ""
Write-Status "FastAPI server başlatılıyor..." $InfoColor
Write-Status "Port: $Port" $WarningColor
Write-Status "URL: http://localhost:$Port" $InfoColor
Write-Status "API Docs: http://localhost:$Port/docs" $InfoColor
Write-Host ""

try {
    cd $BackendDir
    uvicorn app.main:app --host 0.0.0.0 --port $Port --reload
} catch {
    Write-Error-Message "Server başlatılamadı: $_"
    exit 1
}
