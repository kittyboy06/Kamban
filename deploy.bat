@echo off
setlocal
echo =========================================
echo   Deploying Kanban Dashboard to GitHub Pages
echo =========================================

:: 1. Build the Vite project
echo.
echo [1/4] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Exiting...
    pause
    exit /b %errorlevel%
)

:: 2. Navigate to the build output directory
echo.
echo [2/4] Navigating to dist folder...
cd dist

:: 3. Create a clean git repository in the dist folder
echo.
echo [3/4] Initializing temporary git repository...
git init
git checkout -b main
git add -A
git commit -m "Auto-deploy to GitHub Pages"

:: 4. Get the remote origin URL from the parent directory and push
echo.
echo [4/4] Pushing to gh-pages branch...
FOR /F "tokens=*" %%g IN ('git -C .. config --get remote.origin.url') do (SET REPO_URL=%%g)

if defined REPO_URL (
    echo Found remote: %REPO_URL%
    git push -f %REPO_URL% main:gh-pages
    echo.
    echo =========================================
    echo   Deployment Complete!
    echo   Make sure GitHub Pages is set to use the 'gh-pages' branch.
    echo =========================================
    echo IMPORTANT: If your site is hosted at github.io/Repository-Name/
    echo you MUST add `base: '/Repository-Name/'` to your vite.config.js 
    echo before deploying to prevent blank screens.
    echo =========================================
) else (
    echo [Error] No remote 'origin' found in the parent directory.
    echo Please make sure you have committed this project and linked it to a GitHub repo first.
    echo Example: git remote add origin https://github.com/Username/Repo.git
)

cd ..
echo.
pause
