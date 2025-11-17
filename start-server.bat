@echo off
echo 🚀 Starting JLPT N2 Practice App...
echo.

REM Check if we're in the right directory
if not exist "index.html" (
    echo ❌ Error: index.html not found. Please run this script from the n2-practice directory.
    pause
    exit /b 1
)

REM Check if data files exist
if not exist "data\n2-vocab.tsv" (
    echo ⚠️  Warning: data\n2-vocab.tsv is missing
)
if not exist "data\n2-kanji.tsv" (
    echo ⚠️  Warning: data\n2-kanji.tsv is missing
)
if not exist "data\n2-grammar.tsv" (
    echo ⚠️  Warning: data\n2-grammar.tsv is missing
)

set PORT=8000

echo 🔍 Looking for available server options...

REM Check for Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python found. Starting server...
    echo 📱 Open your browser and go to: http://localhost:%PORT%
    echo 🛑 Press Ctrl+C to stop the server
    echo.
    python -m http.server %PORT%
    goto :end
)

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js found. Starting server...
    echo 📱 Open your browser and go to: http://localhost:%PORT%
    echo 🛑 Press Ctrl+C to stop the server
    echo.
    npx http-server -p %PORT%
    goto :end
)

REM Check for PHP
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PHP found. Starting server...
    echo 📱 Open your browser and go to: http://localhost:%PORT%
    echo 🛑 Press Ctrl+C to stop the server
    echo.
    php -S localhost:%PORT%
    goto :end
)

REM No server options found
echo ❌ No suitable server found. Please install one of the following:
echo.
echo Option 1 - Python:
echo   Download from: https://www.python.org/downloads/
echo   Then run this script again
echo.
echo Option 2 - Node.js:
echo   Download from: https://nodejs.org/
echo   Then run this script again
echo.
echo ⚠️  Note: You cannot run this app by simply opening index.html in your browser
echo    due to browser security restrictions with local file access.
echo.

:end
pause
