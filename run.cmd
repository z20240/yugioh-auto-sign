@echo on
echo.

call npm install

node %cd%\index.js

echo "Done"