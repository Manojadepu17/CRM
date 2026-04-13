# Digital Documentation and Identity Verification System

A secure, full-stack web application for replacing paper-based agreements and manual identity verification with a fully digital workflow.

## Features

### User Features
- ✅ Secure registration and authentication
- ✅ Identity verification with document upload
- ✅ OTP verification via email
- ✅ Digital agreement creation from templates
- ✅ Electronic signature with canvas-based signature pad
- ✅ Document viewing, download, and tracking
- ✅ Real-time document status updates

### Admin Features
- ✅ Comprehensive dashboard with analytics
- ✅ Document template management
- ✅ Verification request monitoring
- ✅ Identity verification approval/rejection
- ✅ Document activity tracking
- ✅ System-wide statistics

### Security Features
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Encrypted document storage
- ✅ Secure API routes
- ✅ Input validation
- ✅ Rate limiting
- ✅ Helmet.js security headers

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **File Storage**: Local storage with encryption
- **Security**: bcryptjs, crypto-js, helmet

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration.

4. **Setup MySQL database**
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```

5. **Start the application**
   
   Development mode (both frontend and backend):
   ```bash
   npm run dev:full
   ```
   
   Or separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Credentials

### Admin Account
- Email: admin@system.com
- Password: Admin@123

### Test User Account
- Email: user@test.com
- Password: User@123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Identity Verification
- `POST /api/verification/upload` - Upload ID document
- `POST /api/verification/send-otp` - Send OTP
- `POST /api/verification/verify-otp` - Verify OTP
- `GET /api/verification/status` - Get verification status
- `PUT /api/verification/approve/:id` - Approve verification (Admin)
- `PUT /api/verification/reject/:id` - Reject verification (Admin)

### Documents
- `GET /api/documents` - Get user documents
- `POST /api/documents/create` - Create document
- `GET /api/documents/:id` - Get document details
- `POST /api/documents/:id/sign` - Sign document
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template (Admin)
- `PUT /api/templates/:id` - Update template (Admin)
- `DELETE /api/templates/:id` - Delete template (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/documents` - Get all documents
- `GET /api/admin/verifications` - Get all verifications

## Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── documentController.js
│   │   ├── verificationController.js
│   │   ├── templateController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   └── validateInput.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   ├── Verification.js
│   │   └── Template.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── verificationRoutes.js
│   │   ├── templateRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── encryption.js
│   │   ├── emailService.js
│   │   └── fileHandler.js
│   ├── database/
│   │   └── schema.sql
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── documents/
│   │   │   ├── verification/
│   │   │   └── admin/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── uploads/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Security Considerations

1. **Authentication**: All routes are protected with JWT authentication
2. **Authorization**: Role-based access control for user and admin routes
3. **Encryption**: Documents are encrypted before storage
4. **Input Validation**: All inputs are validated and sanitized
5. **Rate Limiting**: API rate limiting to prevent abuse
6. **Helmet**: Security headers for Express application
7. **HTTPS**: Use HTTPS in production
8. **Environment Variables**: Sensitive data stored in environment variables

## Future Enhancements

- Multi-factor authentication (MFA)
- Real-time notifications with WebSocket
- Advanced document analytics
- Blockchain integration for document verification
- Mobile application
- Third-party identity verification APIs
- Audit trail and compliance reporting
- Document version control

## License

MIT License

## Support

For support, email support@digitaldocs.com or create an issue in the repository.
