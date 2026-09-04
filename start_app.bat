@echo off
title Akhi Homeo Hall - Secure Database Server
echo ================================================================
echo    Akhi Homeo Hall (আঁখি হোমিও হল) - Secure Notebook Server
echo    Database: SQLite (akhi_homeo.db)
echo ================================================================
echo Starting backend server on http://localhost:3000 ...
start /B node server.js
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
echo Server is running in background. You can close this window anytime.
pause
