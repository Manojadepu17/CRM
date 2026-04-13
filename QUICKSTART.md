# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Configure Database
1. Create a `.env` file from `.env.example`
2. Update MySQL credentials in `.env`

### Step 3: Setup Database
**Windows:**
```bash
setup-database.bat
```

**Manual:**
```bash
mysql -u root -p < backend/database/schema.sql
```

### Step 4: Start Application
```bash
npm run dev:full
```

### Step 5: Open Browser
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Default Login
```
Admin:
  Email: admin@system.com
  Password: Admin@123
```

## 📁 Project Structure

```
project/
├── backend/              # Node.js/Express backend
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, RBAC
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Encryption, email, files
│   └── server.js        # Entry point
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Auth context
│   │   ├── services/    # API services
│   │   └── index.js     # Entry point
│   └── package.json
└── README.md
```

## 📝 Key Features

### For Users
- ✓ Register & Login
- ✓ Identity Verification
- ✓ Create Documents
- ✓ Electronic Signatures
- ✓ Document Management

### For Admins
- ✓ Dashboard Analytics
- ✓ User Management
- ✓ Verification Approval
- ✓ Document Oversight
- ✓ Template Management

## 🔧 Common Commands

```bash
# Install all dependencies
npm run install:all

# Start backend only
npm run dev

# Start frontend only
npm run client

# Start both (recommended)
npm run dev:full

# Build frontend
cd frontend && npm run build
```

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify `.env` credentials
- Ensure database exists

### Frontend won't connect
- Backend must be running on port 5000
- Check `proxy` in frontend/package.json

### Database errors
- Run setup script again
- Check MySQL user permissions
- Verify database name

## 📚 Documentation

See `SETUP_GUIDE.md` for detailed setup instructions.

## 🎯 Next Steps

1. Register a new user account
2. Complete identity verification
3. Login as admin to approve verification
4. Create your first document
5. Sign the document digitally

## 📫 Support

For detailed setup, see `SETUP_GUIDE.md`
