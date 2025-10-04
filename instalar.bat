@echo off
echo 🚀 Instalando dependencias do BotConversa Dashboard...
echo.

cd backend
echo 📦 Instalando dependencias do backend...
npm install

echo.
echo ✅ Instalacao concluida!
echo.
echo Para iniciar o sistema:
echo   1. cd backend
echo   2. npm start
echo.
echo O painel estara disponivel em: http://localhost:3001
echo Webhook URL: http://localhost:3001/webhook/botconversa
echo.
pause