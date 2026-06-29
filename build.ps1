# 清除可能导致问题的环境变量
Remove-Item Env:SAFE_RM_ALLOWED_PATH -ErrorAction SilentlyContinue
Remove-Item Env:SAFE_RM_DENIED_PATH -ErrorAction SilentlyContinue
Remove-Item Env:SAFE_RM_AUTO_ADD_TEMP -ErrorAction SilentlyContinue
Remove-Item Env:SAFE_RM_PROTECTION_FLAG -ErrorAction SilentlyContinue

# 导航到项目目录
Set-Location "e:\FireFly\Firefly"

# 运行构建命令
npx astro build