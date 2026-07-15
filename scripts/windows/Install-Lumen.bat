@echo off
setlocal

set "SOURCE_DIR=%~dp0Lumen"
set "TARGET_DIR=%LOCALAPPDATA%\Programs\Lumen"
set "DESKTOP_LINK=%USERPROFILE%\Desktop\Lumen Browser.lnk"
set "START_MENU_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Lumen"
set "START_MENU_LINK=%START_MENU_DIR%\Lumen Browser.lnk"

if not exist "%SOURCE_DIR%\Lumen.exe" (
  echo Lumen.exe was not found.
  echo Make sure this installer is next to the Lumen folder.
  pause
  exit /b 1
)

echo Installing Lumen Browser...

if exist "%TARGET_DIR%" (
  rmdir /s /q "%TARGET_DIR%"
)

mkdir "%TARGET_DIR%" >nul 2>nul
xcopy "%SOURCE_DIR%\*" "%TARGET_DIR%\" /E /I /Y >nul

mkdir "%START_MENU_DIR%" >nul 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command "$desktop='%DESKTOP_LINK%'; $start='%START_MENU_LINK%'; $target='%TARGET_DIR%\Lumen.exe'; $work='%TARGET_DIR%'; $shell=New-Object -ComObject WScript.Shell; foreach ($path in @($desktop,$start)) { $shortcut=$shell.CreateShortcut($path); $shortcut.TargetPath=$target; $shortcut.WorkingDirectory=$work; $shortcut.IconLocation=$target + ',0'; $shortcut.Save() }"

echo Lumen Browser installed.
start "" "%TARGET_DIR%\Lumen.exe"
endlocal
