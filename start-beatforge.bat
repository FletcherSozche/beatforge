@echo off
title BeatForge
cd /d D:\AI\OpenCode\beatforge
cls
echo.
echo   ========================================
echo        BeatForge - Beat Studio
echo   ========================================
echo.
echo   Calistiriliyor: http://localhost:5173
echo   Durdurmak icin bu pencereyi kapat veya
echo   CTRL+C yap.
echo.

if not exist "node_modules" (
  echo [bilgi] node_modules yok, kurulum basliyor...
  call npm install
  if errorlevel 1 (
    echo.
    echo [hata] npm install basarisiz! Node.js yuklu mu?
    echo Indir: https://nodejs.org/
    pause
    exit /b 1
  )
)

start "" http://localhost:5173
call npm run dev
pause
