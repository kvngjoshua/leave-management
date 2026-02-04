# 🎓 University Leave Management System

A comprehensive web-based leave management system designed for universities and federal civil service institutions with hierarchical approval workflows.

## 📋 Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Default Credentials](#default-credentials)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- ✅ Multi-role authentication (Employee, HOD, Dean, HR, Admin)
- ✅ Hierarchical leave approval workflow
- ✅ Multiple leave types (Annual, Sick, Casual, Maternity, Paternity, Study)
- ✅ Automatic leave balance calculation
- ✅ Email notifications (configurable)
- ✅ Real-time status tracking
- ✅ Department-wise leave management
- ✅ Comprehensive reporting and analytics
- ✅ Activity logging and audit trail

### User Interfaces
- **Employee Dashboard**: Apply for leave, track requests, view balance
- **HOD Dashboard**: Review and approve department leave requests
- **Dean Dashboard**: Final approval for approved requests
- **HR Dashboard**: Process approved leaves, manage employees, generate reports
- **Admin Dashboard**: System configuration, user management, activity logs

## 💻 System Requirements

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **Browser**: Chrome, Firefox, Edge, or Safari (latest versions)
- **Memory**: Minimum 2GB RAM
- **Storage**: 500MB free disk space

## 🚀 Installation

### Step 1: Clone or Download

```bash
# If using Git
git clone https://github.com/yourusername/leave-management-system.git
cd leave-management-system

# Or download and extract the ZIP file
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- express
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- express-session
- nodemailer
- body-parser
- uuid
- nodemon (development)

### Step 3: Configure Environment

1. Rename `.env.example` to `.env` (or create new `.env` file)
2. Edit `.env` and update:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-unique-secret-key-here
JWT_SECRET=your-jwt-secret-key-here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 4: Initialize Database

```bash
node -e "require('./models/database').initializeDatabase()"
```

You should see:
```
✅ Database initialized successfully!

📝 Sample Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Employee: john.doe@university.edu.ng / password123
HOD:      sarah.j@university.edu.ng / password123
Dean:     m.okafor@university.edu.ng / password123
HR:       hr@university.edu.ng / password123
Admin:    admin@university.edu.ng / password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5: Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
leave-management-system/
├── views/                      # Frontend HTML files
│   ├── login.html             # Login page
│   ├── employee-dashboard.html
│   ├── hod-dashboard.html
│   ├── dean-dashboard.html
│   ├── hr-dashboard.html
│   └── admin-dashboard.html
├── routes/                     # API route handlers
│   ├── auth.js                # Authentication routes
│   ├── leave.js               # Leave management routes
│   ├── employee.js            # Employee routes
│   ├── hod.js                 # HOD routes
│   ├── dean.js                # Dean routes
│   ├── hr.js                  # HR routes
│   └── admin.js               # Admin routes
├── models/                     # Data models
│   └── database.js            # Database operations
├── middleware/                 # Express middleware
│   └── auth.js                # Authentication middleware
├── data/                       # JSON database files (auto-created)
│   ├── users.json
│   ├── employees.json
│   ├── leaves.json
│   ├── departments.json
│   ├── leaveTypes.json
│   ├── notifications.json
│   └── logs.json
├── public/                     # Static assets
│   ├── css/
│   └── js/
├── .env                        # Environment variables
├── package.json                # Dependencies
├── server.js                   # Main server file
└── README.md                   # This file
```

## 🔌 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login user
```json
{
  "email": "john.doe@university.edu.ng",
  "password": "password123",
  "role": "employee"
}
```

#### POST /api/auth/logout
Logout current user

#### GET /api/auth/me
Get current user profile

### Leave Management Endpoints

#### POST /api/leave/apply
Apply for leave
```json
{
  "leaveType": "Annual Leave",
  "startDate": "2025-02-10",
  "endDate": "2025-02-14",
  "totalDays": 5,
  "reason": "Family vacation",
  "contactAddress": "123 Main St",
  "contactPhone": "+234 801 234 5678"
}
```

#### GET /api/leave/my-leaves
Get current user's leave requests

#### GET /api/leave/:id
Get specific leave request

#### PUT /api/leave/:id/cancel
Cancel leave request

### HOD Endpoints

#### GET /api/hod/pending-leaves
Get pending leave requests

#### PUT /api/hod/approve/:id
Approve leave request

#### PUT /api/hod/reject/:id
Reject leave request

### Dean Endpoints

#### GET /api/dean/pending-leaves
Get leaves awaiting dean approval

#### PUT /api/dean/approve/:id
Give final approval

#### PUT /api/dean/reject/:id
Reject leave request

### HR Endpoints

#### GET /api/hr/approved-leaves
Get all approved leaves

#### PUT /api/hr/process/:id
Process approved leave

#### GET /api/hr/employees
Get all employees

#### GET /api/hr/statistics
Get leave statistics

### Admin Endpoints

#### GET /api/admin/users
Get all users

#### POST /api/admin/users
Create new user

#### PUT /api/admin/users/:id
Update user

#### DELETE /api/admin/users/:id
Delete user

#### GET /api/admin/departments
Get all departments

#### POST /api/admin/departments
Create department

#### GET /api/admin/leave-types
Get all leave types

#### POST /api/admin/leave-types
Create leave type

#### GET /api/admin/logs
Get activity logs

## 👥 User Roles

### 1. Employee
- Apply for leave
- View own leave requests
- Cancel pending requests
- Check leave balance
- View notifications

### 2. Head of Department (HOD)
- All employee features
- Review department leave requests
- Approve/reject leave requests
- View department statistics
- Forward approved requests to Dean

### 3. Dean
- All employee features
- Review HOD-approved requests
- Give final approval
- View faculty-wide statistics
- Override HOD decisions

### 4. Human Resources (HR)
- All employee features
- Process approved leaves
- Manage all employees
- Update leave balances
- Generate reports
- View system-wide statistics

### 5. System Administrator
- All HR features
- Manage users (CRUD)
- Configure leave types
- Manage departments
- View activity logs
- System configuration

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | john.doe@university.edu.ng | password123 |
| HOD | sarah.j@university.edu.ng | password123 |
| Dean | m.okafor@university.edu.ng | password123 |
| HR | hr@university.edu.ng | password123 |
| Admin | admin@university.edu.ng | password123 |

**⚠️ IMPORTANT**: Change these passwords after first login!

## 🎨 Screenshots

### Login Page
Clean, professional login interface with role selection.

### Employee Dashboard
- Leave balance overview
- Quick leave application
- Request history tracking

### HOD Dashboard
- Pending approvals
- Department statistics
- Approval workflow

### Dean Dashboard
- Faculty-wide overview
- Final approval authority
- Comprehensive analytics

### HR Dashboard
- Employee management
- Leave processing
- Report generation

### Admin Dashboard
- User management
- System configuration
- Activity monitoring

## 🔧 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Use different port in .env
PORT=3001
```

### Cannot login
- Verify database was initialized
- Check credentials match sample data
- Clear browser cache/cookies
- Check server console for errors

### Database errors
```bash
# Reinitialize database
node -e "require('./models/database').initializeDatabase()"
```

### Email not sending
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- For Gmail, use App Password, not regular password
- Check SMTP settings for your provider

## 🔐 Security Considerations

### For Production Deployment

1. **Change all default passwords**
2. **Use strong secrets** in .env
3. **Enable HTTPS** (use Let's Encrypt)
4. **Set NODE_ENV=production**
5. **Use real database** (PostgreSQL/MySQL)
6. **Implement rate limiting**
7. **Enable CORS properly**
8. **Regular security updates**
9. **Backup data regularly**
10. **Monitor activity logs**

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Step Verification
2. Create App Password:
   - Google Account → Security → 2-Step Verification → App passwords
3. Update .env:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

### Other Providers

Update .env with provider's SMTP settings:
```env
EMAIL_HOST=smtp.provider.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASSWORD=your-password
```

## 🗄️ Database Migration

Currently using JSON files. For production, migrate to:

### PostgreSQL
```bash
npm install pg
# Update models/database.js with PostgreSQL queries
```

### MySQL
```bash
npm install mysql2
# Update models/database.js with MySQL queries
```

## 🚀 Deployment

### Deploy to Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set NODE_ENV=production
```

### Deploy to VPS
```bash
# Install Node.js
# Clone repository
# Install dependencies
# Set up PM2 for process management
npm install -g pm2
pm2 start server.js --name leave-system
pm2 startup
pm2 save
```

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- Check this README
- Review IMPLEMENTATION_GUIDE.md
- Check server console logs
- Review browser console (F12)

## 🙏 Acknowledgments

- Built for Federal Universities
- Compliant with Civil Service Rules
- Modern web technologies
- Secure authentication

---

**Made with ❤️ for efficient leave management**

Version 1.0.0 | Last Updated: January 2025