@echo off
echo Reemplazando localhost:5000 por variable de entorno...

REM Reemplaza en todos los archivos .js y .jsx
for /r src %%f in (*.js *.jsx) do (
  powershell -Command "(gc %%f) -replace 'http://localhost:5000/api', process.env.REACT_APP_API_URL ? '%%{process.env.REACT_APP_API_URL}/api' : 'http://localhost:5000/api' | sc %%f"
)

echo ¡Listo! Revisa los cambios.
pause