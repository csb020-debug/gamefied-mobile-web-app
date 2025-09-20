@echo off
echo 🔧 EcoQuest Environment Setup
echo ==============================
echo.

REM Check if .env.local exists
if exist ".env.local" (
    echo ✅ .env.local file already exists
    echo Current content:
    type .env.local
    echo.
    set /p overwrite="Do you want to overwrite it? (y/N): "
    if /i not "%overwrite%"=="y" (
        echo Setup cancelled.
        pause
        exit /b 0
    )
)

echo 📝 Creating .env.local file...
echo.

REM Get Supabase URL
echo Enter your Supabase Project URL:
echo Example: https://abcdefghijklmnop.supabase.co
set /p supabase_url="URL: "

REM Get Supabase Key
echo.
echo Enter your Supabase anon/public key:
echo Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
set /p supabase_key="Key: "

REM Create .env.local file
(
echo # Supabase Configuration
echo VITE_SUPABASE_URL=%supabase_url%
echo VITE_SUPABASE_ANON_KEY=%supabase_key%
) > .env.local

echo.
echo ✅ .env.local file created successfully!
echo.
echo 📋 Next steps:
echo 1. Restart your development server
echo 2. Refresh the page
echo 3. Run the Integration Test Suite
echo.
echo 🚀 To restart the server:
echo    npm run dev
echo    # or
echo    yarn dev
echo    # or
echo    bun dev
echo.
pause
