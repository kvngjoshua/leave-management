# Leave Management System - Implementation Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A text editor (VS Code, Sublime Text, etc.)
- A web browser (Chrome, Firefox, Edge)

## 🚀 Step-by-Step Implementation

### Step 1: Create Project Structure

Create the following folder structure:

```
leave-management-system/
├── views/
│   ├── login.html
│   ├── employee-dashboard.html
│   ├── hod-dashboard.html
│   ├── dean-dashboard.html
│   ├── hr-dashboard.html
│   └── admin-dashboard.html
├── routes/
│   ├── auth.js
│   ├── leave.js
│   ├── employee.js
│   ├── hod.js
│   ├── dean.js
│   ├── hr.js
│   └── admin.js
├── models/
│   └── database.js
├── middleware/
│   └── auth.js
├── data/
│   (This folder will be auto-created)
├── public/
│   ├── css/
│   └── js/
├── .env
├── package.json
├── server.js
└── README.md
```

### Step 2: Install Dependencies

1. Open your terminal/command prompt
2. Navigate to your project folder:
   ```bash
   cd leave-management-system
   ```

3. Install all dependencies:
   ```bash
   npm install
   ```

   This will install:
   - express (Web framework)
   - bcryptjs (Password hashing)
   - jsonwebtoken (Authentication)
   - cors (Cross-origin requests)
   - dotenv (Environment variables)
   - express-session (Session management)
   - nodemailer (Email sending)
   - body-parser (Request parsing)
   - uuid (Unique ID generation)
   - nodemon (Development auto-reload)

### Step 3: Configure Environment Variables

Edit the `.env` file and update these settings:

```env
# REQUIRED: Change these for production
SESSION_SECRET=change-this-to-a-random-secret-key
JWT_SECRET=change-this-to-another-random-secret-key

# Email Configuration (Optional - for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Important:** 
- Generate strong random secrets for production
- For Gmail, you need to create an "App Password" (not your regular password)
- Go to: Google Account → Security → 2-Step Verification → App passwords

### Step 4: Initialize Database

1. Make sure all files are in place
2. Run the initialization:
   ```bash
   node -e "require('./models/database').initializeDatabase()"
   ```

   This will create:
   - `data/` folder
   - Sample users with default password: **password123**
   - Sample employees
   - Leave types configuration
   - Departments

### Step 5: Start the Server

**For Development (with auto-reload):**
```bash
npm run dev
```

**For Production:**
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🎓 Leave Management System Server                   ║
║                                                        ║
║   Server running on: http://localhost:3000            ║
║   Environment: development                            ║
║                                                        ║
║   Press Ctrl+C to stop the server                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

📝 Sample Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Employee: john.doe@university.edu.ng / password123
HOD:      sarah.j@university.edu.ng / password123
Dean:     m.okafor@university.edu.ng / password123
HR:       hr@university.edu.ng / password123
Admin:    admin@university.edu.ng / password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 6: Access the Application

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the login page
4. Use any of the sample credentials to login

## 🧪 Testing the System

### Test Employee Login:
1. Email: `john.doe@university.edu.ng`
2. Password: `password123`
3. Role: **Employee**
4. Click Login
5. You should be redirected to Employee Dashboard

### Test Leave Application:
1. Login as Employee
2. Click "Apply for Leave"
3. Fill in the form:
   - Leave Type: Annual Leave
   - Start Date: (3 days from today)
   - End Date: (5 days from start date)
   - Reason: "Family vacation"
4. Submit
5. Check "Leave Request History" table

### Test HOD Approval:
1. Logout
2. Login as HOD: `sarah.j@university.edu.ng / password123`
3. Go to "Pending Requests" tab
4. Click "View" on a leave request
5. Click "Approve" or "Reject"
6. Add comments and confirm

### Test Dean Approval:
1. Logout
2. Login as Dean: `m.okafor@university.edu.ng / password123`
3. View HOD-approved requests
4. Approve/Reject requests

### Test HR Processing:
1. Logout
2. Login as HR: `hr@university.edu.ng / password123`
3. View fully approved leaves
4. Click "Process" to finalize

### Test Admin Functions:
1. Logout
2. Login as Admin: `admin@university.edu.ng / password123`
3. Test:
   - Add new user
   - Edit user
   - Configure leave types
   - Add department
   - View activity logs

## 📁 File Locations

### Frontend Files:
All HTML files are in `views/` folder:
- `login.html` - Login page
- `employee-dashboard.html` - Employee interface
- `hod-dashboard.html` - HOD interface
- `dean-dashboard.html` - Dean interface
- `hr-dashboard.html` - HR interface
- `admin-dashboard.html` - Admin interface

### Backend Files:
- `server.js` - Main server file
- `routes/` - API endpoints
- `models/database.js` - Database operations
- `middleware/auth.js` - Authentication

### Data Storage:
- `data/` - JSON files (auto-created)
  - `users.json` - User accounts
  - `employees.json` - Employee records
  - `leaves.json` - Leave requests
  - `departments.json` - Departments
  - `leaveTypes.json` - Leave type configs
  - `notifications.json` - System notifications
  - `logs.json` - Activity logs

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module 'express'"
**Solution:** Run `npm install`

### Issue: "Port 3000 is already in use"
**Solution:** 
- Change PORT in `.env` file to 3001 or another port
- Or stop the process using port 3000

### Issue: "Cannot GET /"
**Solution:** Make sure `views/` folder contains all HTML files

### Issue: Login not working
**Solution:**
- Check that database was initialized
- Verify credentials from initialization output
- Check browser console for errors

### Issue: 404 errors
**Solution:**
- Ensure server is running
- Check that you're accessing http://localhost:3000
- Verify all route files exist

## 📧 Email Configuration (Optional)

To enable email notifications:

1. For Gmail:
   - Enable 2-Step Verification
   - Generate App Password
   - Update `.env`:
     ```env
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-16-digit-app-password
     ```

2. For other email providers:
   - Update `EMAIL_HOST` and `EMAIL_PORT` in `.env`
   - Consult your provider's SMTP settings

## 🔒 Security Notes

**For Production Deployment:**

1. **Change all secrets:**
   - Generate new SESSION_SECRET
   - Generate new JWT_SECRET
   - Use strong, random values

2. **Use HTTPS:**
   - Never use HTTP in production
   - Get SSL certificate (Let's Encrypt is free)

3. **Environment:**
   - Set `NODE_ENV=production` in `.env`
   - Never commit `.env` file to git

4. **Database:**
   - Migrate to PostgreSQL or MySQL
   - Use proper database with transactions
   - Regular backups

5. **File Uploads:**
   - Implement file upload validation
   - Scan uploaded files for viruses
   - Limit file sizes

## 📊 Migrating to Real Database

Currently using JSON files. To migrate to PostgreSQL:

1. Install PostgreSQL
2. Install pg module: `npm install pg`
3. Create database schema
4. Update `models/database.js`
5. Migrate data from JSON to PostgreSQL

## 🎯 Next Steps

1. ✅ Test all user roles
2. ✅ Test leave application workflow
3. ✅ Test approval process
4. ✅ Customize for your university
5. ✅ Add your university logo
6. ✅ Configure email settings
7. ✅ Deploy to production server

## 📞 Support

If you encounter issues:
1. Check this guide carefully
2. Review error messages in terminal
3. Check browser console (F12)
4. Verify all files are in correct locations

## 🎓 System Workflow

1. **Employee** applies for leave
2. **HOD** reviews and approves/rejects
3. **Dean** gives final approval (if HOD approved)
4. **HR** processes approved leave
5. System updates leave balance
6. Email notifications sent at each step

---

**Congratulations!** Your Leave Management System is now ready to use! 🎉