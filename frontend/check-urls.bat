@echo off
echo Verificando URLs incorrectas...
echo.

findstr /s /i "localhost:5000" src\*
if %errorlevel% equ 0 (
  echo.
  echo ⚠️  Se encontraron URLs locales! Revisa los archivos arriba.
) else (
  echo.
  echo ✅ No se encontraron URLs locales!
)

echo.
echo Verificando uso de configuración central...
findstr /s /i "API_URLS" src\* | find /c /v ""
echo archivos usan la configuracion central.

pause