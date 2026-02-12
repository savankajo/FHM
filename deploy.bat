@echo off
echo Setting environment variables...
set DATABASE_URL=postgresql://postgres.ormlsuvowlqqbmzidrqg:MySecurePassword2024@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
set JWT_SECRET=x7d9f2k4m5n8p1q3r6t8v9w2z4x7c8v9b1n2m3k4j5h6g7f8d9s0a
set NEXT_PUBLIC_APP_URL=https://fhmapp.netlify.app

echo Starting Netlify deploy...
call netlify deploy --build --prod

echo Deployment command finished.
pause
