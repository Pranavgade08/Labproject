const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Issue = require('./models/Issue');
const Computer = require('./models/Computer');
const Notification = require('./models/Notification');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/labproject');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Issue.deleteMany({});
    await Computer.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create Admins
    const adminUser = await User.create({
      name: 'System Administrator',
      identifier: 'admin',
      password: 'password123',
      role: 'admin',
    });

    const assistantUser = await User.create({
      name: 'Lab Assistant',
      identifier: 'assistant',
      password: 'password123',
      role: 'assistant',
    });

    // 2. Create Students
    const student1 = await User.create({
      name: 'John Doe',
      identifier: 'PRN001',
      password: 'password123',
      role: 'student',
      class: 'B.Sc IT',
      rollno: '01',
      year: 'Second Year',
    });

    const student2 = await User.create({
      name: 'Jane Smith',
      identifier: 'PRN002',
      password: 'password123',
      role: 'student',
      class: 'BCA',
      rollno: '02',
      year: 'First Year',
    });

    const student3 = await User.create({
      name: 'Mike Johnson',
      identifier: 'PRN003',
      password: 'password123',
      role: 'student',
      class: 'B.Sc CS',
      rollno: '03',
      year: 'Third Year',
    });

    // 3. Create Sample Computers
    const comp1 = await Computer.create({
      name: 'LAB1-PC-01',
      ipAddress: '192.168.1.101',
      macAddress: '00:1A:2B:3C:4D:01',
      labNumber: 'Lab 1',
      os: 'Windows 11 Pro',
      status: 'Online',
      installedSoftware: [
        { name: 'VS Code', version: '1.87.0' },
        { name: 'Node.js', version: '20.11.0' },
        { name: 'Google Chrome', version: '122.0.6261.95' },
      ],
      lastSeen: new Date(),
    });

    const comp2 = await Computer.create({
      name: 'LAB1-PC-02',
      ipAddress: '192.168.1.102',
      macAddress: '00:1A:2B:3C:4D:02',
      labNumber: 'Lab 1',
      os: 'Windows 10 Pro',
      status: 'Online',
      installedSoftware: [
        { name: 'VS Code', version: '1.87.0' },
        { name: 'Python', version: '3.11.4' },
      ],
      lastSeen: new Date(),
    });

    const comp3 = await Computer.create({
      name: 'LAB2-PC-15',
      ipAddress: '192.168.1.115',
      macAddress: '00:1A:2B:3C:4D:15',
      labNumber: 'Lab 2',
      os: 'Ubuntu Linux 22.04',
      status: 'Offline',
      lastSeen: new Date(Date.now() - 3600 * 1000 * 5),
    });

    // 4. Create Sample Issues
    await Issue.create([
      {
        student: student1._id,
        prn: 'PRN001',
        lab: 'Lab 1',
        systemNumber: 'PC-01',
        issueType: 'Hardware Issue',
        description: 'Monitor flickering and blacking out intermittently during lab sessions.',
        status: 'Pending',
        daysPending: 2,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        student: student2._id,
        prn: 'PRN002',
        lab: 'Lab 2',
        systemNumber: 'PC-15',
        issueType: 'Software Issue',
        description: 'VS Code cannot connect to compiler; PATH variable missing.',
        status: 'In Progress',
        adminNotes: 'Assigned to IT technician to re-install tools.',
        daysPending: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        student: student3._id,
        prn: 'PRN003',
        lab: 'Lab 3',
        systemNumber: 'PC-08',
        issueType: 'Network Issue',
        description: 'Ethernet cable clip broken, connection drops constantly.',
        status: 'Resolved',
        adminNotes: 'Replaced RJ-45 connector and tested ping response.',
        daysCompleted: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    // 5. Create Sample Notifications
    await Notification.create([
      {
        title: 'New Hardware Issue Reported',
        message: 'John Doe (PRN001) reported monitor issue in Lab 1 (PC-01)',
        type: 'issue',
        isRead: false,
      },
      {
        title: 'Software Issue In Progress',
        message: 'Jane Smith (PRN002) issue in Lab 2 updated to In Progress',
        type: 'issue',
        isRead: false,
      },
    ]);

    console.log('Database seeded successfully with default accounts and sample records!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin: admin / password123');
    console.log('Assistant: assistant / password123');
    console.log('Student 1: PRN001 / password123');
    console.log('Student 2: PRN002 / password123');
    console.log('Student 3: PRN003 / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
