@echo off
cd e:\FireFly\Firefly
set SAFE_RM_ALLOWED_PATH=
set SAFE_RM_DENIED_PATH=
set SAFE_RM_AUTO_ADD_TEMP=
set SAFE_RM_PROTECTION_FLAG=
npx astro build
pause