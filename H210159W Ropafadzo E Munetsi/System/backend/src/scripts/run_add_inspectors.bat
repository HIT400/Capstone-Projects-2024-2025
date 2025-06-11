@echo off
echo Running Inspector Creation Script...
cd ..\..\
node --experimental-modules src/scripts/add_inspectors.js
pause
