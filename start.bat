@echo off
echo ========================================
echo   Game Tracker API - Inicializacao
echo ========================================
echo.

REM Verifica se Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao esta instalado!
    echo.
    echo Por favor, instale o Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado:
node --version
echo.

REM Verifica se o .env existe
if not exist ".env" (
    echo [AVISO] Arquivo .env nao encontrado!
    echo.
    echo Copiando .env.example para .env...
    copy .env.example .env
    echo.
    echo [IMPORTANTE] Configure suas credenciais IGDB no arquivo .env
    echo Abra o arquivo .env e adicione:
    echo   IGDB_CLIENT_ID=seu_client_id
    echo   IGDB_CLIENT_SECRET=seu_client_secret
    echo.
    echo Obtenha em: https://dev.twitch.tv/console/apps
    echo.
    pause
    exit /b 1
)

REM Verifica se node_modules existe
if not exist "node_modules" (
    echo [INFO] Instalando dependencias pela primeira vez...
    echo Isso pode demorar alguns minutos...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas com sucesso!
    echo.
)

echo ========================================
echo   Iniciando servidor...
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Inicia o servidor em modo desenvolvimento
call npm run dev

pause
