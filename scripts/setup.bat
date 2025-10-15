@echo off
REM CRM Mobile App Setup Script for Windows

echo 🚀 Setting up CRM Mobile App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "src\__tests__" mkdir "src\__tests__"
if not exist "src\components" mkdir "src\components"
if not exist "src\contexts" mkdir "src\contexts"
if not exist "src\navigation" mkdir "src\navigation"
if not exist "src\screens\auth" mkdir "src\screens\auth"
if not exist "src\screens\customers" mkdir "src\screens\customers"
if not exist "src\screens\leads" mkdir "src\screens\leads"
if not exist "src\screens\main" mkdir "src\screens\main"
if not exist "src\services" mkdir "src\services"
if not exist "src\store\slices" mkdir "src\store\slices"
if not exist "src\theme" mkdir "src\theme"
if not exist "src\utils" mkdir "src\utils"
if not exist "src\types" mkdir "src\types"

echo ✅ Directories created

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Start Metro bundler: npm start
echo 2. Run on Android: npm run android
echo 3. Run tests: npm test
echo.
echo Happy coding! 🚀
pause
