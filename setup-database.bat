@echo off
echo ========================================
echo Digital Documentation System
echo Database Setup Script
echo ========================================
echo.

REM Get MySQL credentials
set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASSWORD="Enter MySQL password: "

echo.
echo Creating database and tables...
echo.

REM Create database and run schema
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% < backend\database\schema.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database setup completed.
    echo ========================================
    echo.
    echo Database: digital_docs_db
    echo Tables created:
    echo   - users
    echo   - verifications
    echo   - templates
    echo   - documents
    echo   - document_signatures
    echo.
    echo Default admin account:
    echo   Email: admin@system.com
    echo   Password: Admin@123
    echo.
    echo Sample templates have been added.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR: Database setup failed!
    echo ========================================
    echo.
    echo Please check:
    echo   1. MySQL is running
    echo   2. Username and password are correct
    echo   3. You have permission to create databases
    echo.
)

pause
