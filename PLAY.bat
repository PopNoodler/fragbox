@echo off
title FragBox Server — close this window to stop the game
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run FragBox. Install it free from https://nodejs.org and run this again.
  pause
  exit /b 1
)
echo Starting FragBox at http://localhost:8080 ...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8080"
node server\server.mjs
