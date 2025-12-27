@echo off
echo ========================================
echo   Game Tracker API - Setup e Execucao
echo ========================================
echo.

REM Adicionar Node.js ao PATH temporariamente
set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo IMPORTANTE: Feche este terminal e abra um NOVO terminal
    echo para que o Node.js seja reconhecido.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js versao:
node --version
echo.

echo Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] npm nao encontrado!
    echo.
    echo IMPORTANTE: Feche este terminal e abra um NOVO terminal
    echo para que o npm seja reconhecido.
    echo.
    pause
    exit /b 1
)

echo [OK] npm versao:
npm --version
echo.

echo ========================================
echo   Instalando dependencias...
echo ========================================
echo.
echo Aguarde, isso pode demorar 2-3 minutos...
echo.

call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias!
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencias instaladas com sucesso!
echo.

echo ========================================
echo   Iniciando servidor...
echo ========================================
echo.
echo O servidor vai iniciar agora.
echo Para parar o servidor, pressione Ctrl+C
echo.
echo Apos iniciar, teste em: http://localhost:3000
echo.
pause

echo Iniciando...
echo.

call npm run dev

pause
