const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database file paths
const DB_FILES = {
    users: path.join(DATA_DIR, 'users.json'),
    employees: path.join(DATA_DIR, 'employees.json'),
    leaves: path.join(DATA_DIR, 'leaves.json'),
    departments: path.join(DATA_DIR, 'departments.json'),
    leaveTypes: path.join(DATA_DIR, 'leaveTypes.json'),
    notifications: path.join(DATA_DIR, 'notifications.json'),
    logs: path.join(DATA_DIR, 'logs.json')
};

// Helper functions
const readDB = (file) => {
    try {
        if (!fs.existsSync(file)) {
            return [];
        }
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${file}:`, error);
        return [];
    }
};

const writeDB = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${file}:`, error);
        return false;
    }
};

// Initialize database with sample data
const initializeDatabase = async () => {
    console.log('Initializing database...');

    // Initialize Leave Types
    const leaveTypes = [
        {
            id: 'LT-001',
            name: 'Annual Leave',
            defaultDays: 18,
            requiresDocument: false,
            maxConsecutiveDays: 30,
            advanceNoticeDays: 3,
            status: 'active'
        },
        {
            id: 'LT-002',
            name: 'Sick Leave',
            defaultDays: 12,
            requiresDocument: true,
            maxConsecutiveDays: 14,
            advanceNoticeDays: 0,
            status: 'active'
        },
        {
            id: 'LT-003',
            name: 'Casual Leave',
            defaultDays: 8,
            requiresDocument: false,
            maxConsecutiveDays: 5,
            advanceNoticeDays: 3,
            status: 'active'
        },
        {
            id: 'LT-004',
            name: 'Maternity Leave',
            defaultDays: 90,
            requiresDocument: true,
            maxConsecutiveDays: 90,
            advanceNoticeDays: 30,
            status: 'active'
        },
        {
            id: 'LT-005',
            name: 'Paternity Leave',
            defaultDays: 10,
            requiresDocument: true,
            maxConsecutiveDays: 10,
            advanceNoticeDays: 7,
            status: 'active'
        },
        {
            id: 'LT-006',
            name: 'Study Leave',
            defaultDays: 30,
            requiresDocument: true,
            maxConsecutiveDays: 365,
            advanceNoticeDays: 60,
            status: 'active'
        }
    ];
    writeDB(DB_FILES.leaveTypes, leaveTypes);

    // Initialize Departments
    const departments = [
        {
            id: 'DEPT-001',
            code: 'CS',
            name: 'Computer Science',
            faculty: 'Faculty of Science',
            hodId: 'EMP-2024-002',
            totalStaff: 24,
            status: 'active'
        },
        {
            id: 'DEPT-002',
            code: 'MATH',
            name: 'Mathematics',
            faculty: 'Faculty of Science',
            hodId: 'EMP-2024-010',
            totalStaff: 18,
            status: 'active'
        },
        {
            id: 'DEPT-003',
            code: 'PHY',
            name: 'Physics',
            faculty: 'Faculty of Science',
            hodId: 'EMP-2024-020',
            totalStaff: 20,
            status: 'active'
        },
        {
            id: 'DEPT-004',
            code: 'CHEM',
            name: 'Chemistry',
            faculty: 'Faculty of Science',
            hodId: 'EMP-2024-030',
            totalStaff: 16,
            status: 'active'
        }
    ];
    writeDB(DB_FILES.departments, departments);

    // Hash password for sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Initialize Sample Users
    const users = [
        {
            id: 'USR-001',
            employeeId: 'EMP-2024-001',
            email: 'john.doe@university.edu.ng',
            password: hashedPassword,
            role: 'employee',
            status: 'active',
            lastLogin: null,
            createdAt: new Date().toISOString()
        },
        {
            id: 'USR-002',
            employeeId: 'EMP-2024-002',
            email: 'sarah.j@university.edu.ng',
            password: hashedPassword,
            role: 'hod',
            status: 'active',
            lastLogin: null,
            createdAt: new Date().toISOString()
        },
        {
            id: 'USR-003',
            employeeId: 'EMP-2024-003',
            email: 'm.okafor@university.edu.ng',
            password: hashedPassword,
            role: 'dean',
            status: 'active',
            lastLogin: null,
            createdAt: new Date().toISOString()
        },
        {
            id: 'USR-004',
            employeeId: 'EMP-2024-004',
            email: 'hr@university.edu.ng',
            password: hashedPassword,
            role: 'hr',
            status: 'active',
            lastLogin: null,
            createdAt: new Date().toISOString()
        },
        {
            id: 'USR-005',
            employeeId: 'EMP-2024-005',
            email: 'admin@university.edu.ng',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            lastLogin: null,
            createdAt: new Date().toISOString()
        }
    ];
    writeDB(DB_FILES.users, users);

    // Initialize Sample Employees
    const employees = [
        {
            id: 'EMP-2024-001',
            name: 'John Doe',
            email: 'john.doe@university.edu.ng',
            phone: '+234 801 234 5678',
            department: 'DEPT-001',
            position: 'Lecturer II',
            gradeLevel: '12',
            joinDate: '2020-01-15',
            gender: 'male',
            leaveBalance: {
                annual: { total: 18, used: 5, remaining: 13 },
                sick: { total: 12, used: 0, remaining: 12 },
                casual: { total: 8, used: 2, remaining: 6 },
                maternity: { total: 0, used: 0, remaining: 0 },
                paternity: { total: 10, used: 0, remaining: 10 },
                study: { total: 30, used: 0, remaining: 30 }
            },
            status: 'active'
        },
        {
            id: 'EMP-2024-002',
            name: 'Dr. Sarah Johnson',
            email: 'sarah.j@university.edu.ng',
            phone: '+234 802 345 6789',
            department: 'DEPT-001',
            position: 'Senior Lecturer / HOD',
            gradeLevel: '14',
            joinDate: '2018-03-10',
            gender: 'female',
            leaveBalance: {
                annual: { total: 18, used: 3, remaining: 15 },
                sick: { total: 12, used: 0, remaining: 12 },
                casual: { total: 8, used: 1, remaining: 7 },
                maternity: { total: 90, used: 0, remaining: 90 },
                paternity: { total: 0, used: 0, remaining: 0 },
                study: { total: 30, used: 0, remaining: 30 }
            },
            status: 'active'
        },
        {
            id: 'EMP-2024-003',
            name: 'Prof. Michael Okafor',
            email: 'm.okafor@university.edu.ng',
            phone: '+234 803 456 7890',
            department: 'DEPT-001',
            position: 'Professor / Dean',
            gradeLevel: '15',
            joinDate: '2015-08-20',
            gender: 'male',
            leaveBalance: {
                annual: { total: 18, used: 0, remaining: 18 },
                sick: { total: 12, used: 0, remaining: 12 },
                casual: { total: 8, used: 0, remaining: 8 },
                maternity: { total: 0, used: 0, remaining: 0 },
                paternity: { total: 10, used: 0, remaining: 10 },
                study: { total: 30, used: 0, remaining: 30 }
            },
            status: 'active'
        },
        {
            id: 'EMP-2024-004',
            name: 'Mrs. Chioma Okonkwo',
            email: 'hr@university.edu.ng',
            phone: '+234 804 567 8901',
            department: 'HR',
            position: 'HR Manager',
            gradeLevel: '13',
            joinDate: '2019-05-15',
            gender: 'female',
            leaveBalance: {
                annual: { total: 18, used: 4, remaining: 14 },
                sick: { total: 12, used: 2, remaining: 10 },
                casual: { total: 8, used: 3, remaining: 5 },
                maternity: { total: 90, used: 0, remaining: 90 },
                paternity: { total: 0, used: 0, remaining: 0 },
                study: { total: 30, used: 0, remaining: 30 }
            },
            status: 'active'
        }
    ];
    writeDB(DB_FILES.employees, employees);

    // Initialize empty arrays for other collections
    writeDB(DB_FILES.leaves, []);
    writeDB(DB_FILES.notifications, []);
    writeDB(DB_FILES.logs, []);

    console.log('✅ Database initialized successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Employee: john.doe@university.edu.ng / password123');
    console.log('HOD:      sarah.j@university.edu.ng / password123');
    console.log('Dean:     m.okafor@university.edu.ng / password123');
    console.log('HR:       hr@university.edu.ng / password123');
    console.log('Admin:    admin@university.edu.ng / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// Database operations
const db = {
    // Users
    users: {
        getAll: () => readDB(DB_FILES.users),
        getById: (id) => readDB(DB_FILES.users).find(u => u.id === id),
        getByEmail: (email) => readDB(DB_FILES.users).find(u => u.email === email),
        getByEmployeeId: (employeeId) => readDB(DB_FILES.users).find(u => u.employeeId === employeeId),
        create: (user) => {
            const users = readDB(DB_FILES.users);
            users.push(user);
            writeDB(DB_FILES.users, users);
            return user;
        },
        update: (id, updates) => {
            const users = readDB(DB_FILES.users);
            const index = users.findIndex(u => u.id === id);
            if (index !== -1) {
                users[index] = { ...users[index], ...updates };
                writeDB(DB_FILES.users, users);
                return users[index];
            }
            return null;
        },
        delete: (id) => {
            const users = readDB(DB_FILES.users);
            const filtered = users.filter(u => u.id !== id);
            writeDB(DB_FILES.users, filtered);
            return filtered.length < users.length;
        }
    },

    // Employees
    employees: {
        getAll: () => readDB(DB_FILES.employees),
        getById: (id) => readDB(DB_FILES.employees).find(e => e.id === id),
        getByDepartment: (deptId) => readDB(DB_FILES.employees).filter(e => e.department === deptId),
        create: (employee) => {
            const employees = readDB(DB_FILES.employees);
            employees.push(employee);
            writeDB(DB_FILES.employees, employees);
            return employee;
        },
        update: (id, updates) => {
            const employees = readDB(DB_FILES.employees);
            const index = employees.findIndex(e => e.id === id);
            if (index !== -1) {
                employees[index] = { ...employees[index], ...updates };
                writeDB(DB_FILES.employees, employees);
                return employees[index];
            }
            return null;
        },
        delete: (id) => {
            const employees = readDB(DB_FILES.employees);
            const filtered = employees.filter(e => e.id !== id);
            writeDB(DB_FILES.employees, filtered);
            return filtered.length < employees.length;
        }
    },

    // Leave Requests
    leaves: {
        getAll: () => readDB(DB_FILES.leaves),
        getById: (id) => readDB(DB_FILES.leaves).find(l => l.id === id),
        getByEmployeeId: (employeeId) => readDB(DB_FILES.leaves).filter(l => l.employeeId === employeeId),
        getByStatus: (status) => readDB(DB_FILES.leaves).filter(l => l.status === status),
        getByDepartment: (deptId) => {
            const leaves = readDB(DB_FILES.leaves);
            const employees = readDB(DB_FILES.employees);
            return leaves.filter(l => {
                const emp = employees.find(e => e.id === l.employeeId);
                return emp && emp.department === deptId;
            });
        },
        create: (leave) => {
            const leaves = readDB(DB_FILES.leaves);
            leaves.push(leave);
            writeDB(DB_FILES.leaves, leaves);
            return leave;
        },
        update: (id, updates) => {
            const leaves = readDB(DB_FILES.leaves);
            const index = leaves.findIndex(l => l.id === id);
            if (index !== -1) {
                leaves[index] = { ...leaves[index], ...updates };
                writeDB(DB_FILES.leaves, leaves);
                return leaves[index];
            }
            return null;
        },
        delete: (id) => {
            const leaves = readDB(DB_FILES.leaves);
            const filtered = leaves.filter(l => l.id !== id);
            writeDB(DB_FILES.leaves, filtered);
            return filtered.length < leaves.length;
        }
    },

    // Departments
    departments: {
        getAll: () => readDB(DB_FILES.departments),
        getById: (id) => readDB(DB_FILES.departments).find(d => d.id === id),
        getByFaculty: (faculty) => readDB(DB_FILES.departments).filter(d => d.faculty === faculty),
        create: (department) => {
            const departments = readDB(DB_FILES.departments);
            departments.push(department);
            writeDB(DB_FILES.departments, departments);
            return department;
        },
        update: (id, updates) => {
            const departments = readDB(DB_FILES.departments);
            const index = departments.findIndex(d => d.id === id);
            if (index !== -1) {
                departments[index] = { ...departments[index], ...updates };
                writeDB(DB_FILES.departments, departments);
                return departments[index];
            }
            return null;
        }
    },

    // Leave Types
    leaveTypes: {
        getAll: () => readDB(DB_FILES.leaveTypes),
        getById: (id) => readDB(DB_FILES.leaveTypes).find(lt => lt.id === id),
        create: (leaveType) => {
            const leaveTypes = readDB(DB_FILES.leaveTypes);
            leaveTypes.push(leaveType);
            writeDB(DB_FILES.leaveTypes, leaveTypes);
            return leaveType;
        },
        update: (id, updates) => {
            const leaveTypes = readDB(DB_FILES.leaveTypes);
            const index = leaveTypes.findIndex(lt => lt.id === id);
            if (index !== -1) {
                leaveTypes[index] = { ...leaveTypes[index], ...updates };
                writeDB(DB_FILES.leaveTypes, leaveTypes);
                return leaveTypes[index];
            }
            return null;
        }
    },

    // Notifications
    notifications: {
        getAll: () => readDB(DB_FILES.notifications),
        getByUserId: (userId) => readDB(DB_FILES.notifications).filter(n => n.userId === userId),
        create: (notification) => {
            const notifications = readDB(DB_FILES.notifications);
            notifications.push(notification);
            writeDB(DB_FILES.notifications, notifications);
            return notification;
        },
        markAsRead: (id) => {
            const notifications = readDB(DB_FILES.notifications);
            const index = notifications.findIndex(n => n.id === id);
            if (index !== -1) {
                notifications[index].read = true;
                writeDB(DB_FILES.notifications, notifications);
                return notifications[index];
            }
            return null;
        }
    },

    // Activity Logs
    logs: {
        getAll: () => readDB(DB_FILES.logs),
        create: (log) => {
            const logs = readDB(DB_FILES.logs);
            logs.push(log);
            writeDB(DB_FILES.logs, logs);
            return log;
        }
    }
};

module.exports = {
    db,
    initializeDatabase
};