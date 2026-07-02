@echo off
title FragBox Server — close this window to stop the game
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run FragBox. Install it free from https://nodejs.org and run this again.
  pause
  exit /b 1
)
rem Stop any FragBox server still holding port 8080 (stale from an earlier session)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do taskkill /f /pid %%p >nul 2>nul
rem Pass any flags through to the server, e.g.:  PLAY.bat --mode=tdm --map=depot
echo Starting FragBox at http://localhost:8080  %*
node server\server.mjs --open %*
