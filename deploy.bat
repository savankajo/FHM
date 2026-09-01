@echo off
if "%DATABASE_URL%"=="" (
  echo DATABASE_URL must be supplied through the secure environment.
  exit /b 1
)
if "%JWT_SECRET%"=="" (
  echo JWT_SECRET must be supplied through the secure environment.
  exit /b 1
)
if "%NEXT_PUBLIC_APP_URL%"=="" set NEXT_PUBLIC_APP_URL=https://fhmapp.netlify.app

echo Starting Netlify deploy...
call netlify deploy --build --prod

echo Deployment command finished.
pause
