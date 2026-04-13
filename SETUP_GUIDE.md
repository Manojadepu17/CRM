# Digital Documentation and Identity Verification System
## Complete Setup Guide

This guide will walk you through setting up the complete application from scratch.

---

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** (v8 or higher) - [Download here](https://dev.mysql.com/downloads/)
3. **npm** or **yarn** - Comes with Node.js
4. **Git** (optional) - For version control

---

## Step 1: Environment Setup

### 1.1 Create Environment File

Navigate to the project root directory and create a `.env` file:

```bash
cd c:/Users/DELL/Desktop/project
copy .env.example .env
```

### 1.2 Configure Environment Variables

Open the `.env` file and update the following values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=digital_docs_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_EXPIRE=7d

# Encryption Key (must be 32 characters)
ENCRYPTION_KEY=12345678901234567890123456789012

# Email Configuration (for OTP - Optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important Notes:**
- Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password
- For production, change `JWT_SECRET` and `ENCRYPTION_KEY` to secure random strings
- Email configuration is optional for development (OTPs will be logged to console)

---

## Step 2: Database Setup

### 2.1 Start MySQL Server

Ensure MySQL is running. On Windows:
- Open Services (Win + R, type `services.msc`)
- Find MySQL service and start it if not running

Or use MySQL Workbench to start the server.

### 2.2 Create Database and Tables

**Option A: Using MySQL Command Line**

```bash
mysql -u root -p < backend/database/schema.sql
```

Enter your MySQL password when prompted.

**Option B: Using MySQL Workbench**

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Go to File → Open SQL Script
4. Select `backend/database/schema.sql`
5. Click Execute

**Option C: Manual Method**

1. Open MySQL Command Line Client or Workbench
2. Run:
```sql
CREATE DATABASE IF NOT EXISTS digital_docs_db;
USE digital_docs_db;
```
3. Copy and paste the entire content of `backend/database/schema.sql`
4. Execute the script

### 2.3 Update Admin Password

The default admin password hash needs to be updated. Run this in MySQL:

```sql
USE digital_docs_db;

-- Update admin password (Password: Admin@123)
UPDATE users 
SET password = '$2a$10$8JHVzxhjx.QGYqvXz7Z0qeKhN1qN7xN5fYP5xTXpNYU5vYGHYQ7J2' 
WHERE email = 'admin@system.com';
```

---

## Step 3: Install Dependencies

### 3.1 Install Backend Dependencies

```bash
npm install
```

This will install all backend dependencies including:
- express, mysql2, bcryptjs, jsonwebtoken
- cors, dotenv, multer, crypto-js
- nodemailer, helmet, express-rate-limit, etc.

### 3.2 Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install all frontend dependencies including:
- react, react-dom, react-router-dom
- axios, react-signature-canvas
- tailwindcss, recharts, lucide-react, etc.

### 3.3 Return to Project Root

```bash
cd ..
```

---

## Step 4: Start the Application

You have two options to start the application:

### Option A: Start Both Servers Together (Recommended)

```bash
npm run dev:full
```

This will start both backend (port 5000) and frontend (port 3000) simultaneously.

### Option B: Start Servers Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

---

## Step 5: Access the Application

Once both servers are running:

- **Frontend**: Open browser and go to `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/health`

---

## Step 6: Test the Application

### 6.1 Default Login Credentials

**Admin Account:**
- Email: `admin@system.com`
- Password: `Admin@123`

**Test User Account** (you'll need to create this):
- Register a new user at `/register`

### 6.2 Testing Workflow

1. **Register a New User**
   - Go to Register page
   - Fill in the form
   - Submit registration

2. **Login**
   - Use the credentials you just created
   - You'll be redirected to the dashboard

3. **Complete Identity Verification**
   - Click on "Verify Identity" in the navbar
   - Upload an ID document (any image file for testing)
   - Request OTP (check console logs for OTP in development mode)
   - Enter OTP code
   - Wait for admin approval

4. **Login as Admin**
   - Logout and login with admin credentials
   - Go to Admin Dashboard
   - Approve the pending verification

5. **Create a Document**
   - Login back as the user
   - Go to Documents → Create New
   - Select a template or start from scratch
   - Fill in the details and create

6. **Sign a Document**
   - Open the created document
   - Click "Sign Document"
   - Draw your signature
   - Confirm signature

---

## Troubleshooting

### Issue: Backend won't start

**Solution:**
1. Check if MySQL is running
2. Verify database credentials in `.env`
3. Ensure database is created: `SHOW DATABASES;`
4. Check if port 5000 is available

### Issue: Frontend won't start

**Solution:**
1. Delete `node_modules` in frontend folder
2. Run `npm install` again
3. Clear cache: `npm start -- --reset-cache`

### Issue: Database connection fails

**Solution:**
1. Verify MySQL is running
2. Check username/password in `.env`
3. Test connection: `mysql -u root -p`
4. Ensure database exists: `USE digital_docs_db;`

### Issue: Email OTP not sending

**Solution:**
- In development mode, OTPs are logged to console
- Check backend terminal for OTP codes
- For production, configure email settings with app-specific password

### Issue: CORS errors

**Solution:**
1. Ensure frontend is running on port 3000
2. Check `FRONTEND_URL` in `.env`
3. Restart both servers

---

## Production Deployment

### Security Checklist

1. ✅ Change `JWT_SECRET` to a strong random string
2. ✅ Change `ENCRYPTION_KEY` to a secure 32-character string
3. ✅ Update database credentials
4. ✅ Enable HTTPS
5. ✅ Configure proper CORS origins
6. ✅ Set `NODE_ENV=production`
7. ✅ Configure email service with valid credentials
8. ✅ Enable rate limiting
9. ✅ Regular database backups
10. ✅ Use environment variables, never commit `.env`

### Build Frontend for Production

```bash
cd frontend
npm run build
```

### Deploy Backend

- Use PM2 or similar process manager
- Configure reverse proxy (nginx/Apache)
- Use environment variables
- Enable SSL certificates

---

## Features Overview

### User Features
- ✅ Secure registration and login
- ✅ Identity verification with document upload
- ✅ OTP verification via email
- ✅ Browse and use document templates
- ✅ Create custom documents
- ✅ Digital signature with canvas
- ✅ Document management (view, download, delete)
- ✅ Real-time status tracking

### Admin Features
- ✅ Dashboard with statistics
- ✅ User management
- ✅ Document oversight
- ✅ Verification approval/rejection
- ✅ Analytics and charts
- ✅ Template management
- ✅ Activity monitoring

### Security Features
- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ Document encryption
- ✅ Role-based access control
- ✅ Input validation
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ SQL injection protection

---

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Document Endpoints

- `GET /api/documents` - Get all user documents
- `POST /api/documents/create` - Create document
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/sign` - Sign document
- `GET /api/documents/:id/download` - Download document

### Verification Endpoints

- `POST /api/verification/upload` - Upload ID document
- `POST /api/verification/send-otp` - Send OTP
- `POST /api/verification/verify-otp` - Verify OTP
- `GET /api/verification/status` - Get verification status
- `PUT /api/verification/:id/approve` - Approve verification (Admin)
- `PUT /api/verification/:id/reject` - Reject verification (Admin)

### Template Endpoints

- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create template (Admin)
- `PUT /api/templates/:id` - Update template (Admin)
- `DELETE /api/templates/:id` - Delete template (Admin)

### Admin Endpoints

- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/documents` - Get all documents
- `GET /api/admin/activity-logs` - Get activity logs

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in terminal
3. Check MySQL connection
4. Verify all environment variables

---

## License

This project is licensed under the MIT License.

---

**Congratulations! Your Digital Documentation System is now ready to use! 🎉**
