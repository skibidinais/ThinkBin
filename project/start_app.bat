@echo off
title My Learning App Server
echo Starting My Learning App on http://localhost:3000 ...
start "" http://localhost:3000
node "%~dp0server.js"
pause
