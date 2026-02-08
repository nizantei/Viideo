@echo off
cd /d "%~dp0video-mixer" && npm run build && cd /d "%~dp0" && npx vercel --prod
