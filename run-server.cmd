@echo off
cd /d "%~dp0"
echo Starting Biweis local server...
echo URL: http://127.0.0.1:4173
"C:\Program Files\nodejs\node.exe" server.js
echo.
echo Server stopped. Keep this window open while using the app.
pause
