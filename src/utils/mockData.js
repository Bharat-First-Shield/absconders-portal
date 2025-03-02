// Mock data for the application
import { v4 as uuidv4 } from 'uuid';

export const mockCriminals = [
  {
    _id: '1',
    state: 'Maharashtra',
    district: 'Mumbai',
    policeStation: 'Central',
    firNumber: 'FIR001',
    name: 'John Doe',
    age: 32,
    fatherName: 'Richard Doe',
    gender: 'male',
    address: '123 Main St, Mumbai',
    idProof: {
      type: 'aadhar',
      number: 'XXXX-XXXX-1234'
    },
    identifiableMarks: ['Scar on left cheek', 'Tattoo on right arm'],
    warrants: [
      {
        id: 'w1',
        details: 'Wanted for theft',
        issuedDate: new Date('2023-01-15'),
        isActive: true,
        court: 'Mumbai District Court',
        caseNumber: 'CASE001'
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        type: 'profile',
        uploadedAt: new Date('2023-01-10')
      }
    ],
    status: 'active',
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-02-15'),
    createdBy: 'user1',
    lastUpdatedBy: 'user2',
    statusHistory: [
      {
        id: 'sh1',
        criminalId: '1',
        previousStatus: 'active',
        newStatus: 'active',
        changedBy: 'user1',
        changedByName: 'Admin User',
        timestamp: new Date('2023-01-10'),
        notes: 'Initial case creation'
      }
    ]
  },
  {
    _id: '2',
    state: 'Maharashtra',
    district: 'Pune',
    policeStation: 'Shivaji Nagar',
    firNumber: 'FIR002',
    name: 'Jane Smith',
    age: 28,
    fatherName: 'Robert Smith',
    gender: 'female',
    address: '456 Park Ave, Pune',
    idProof: {
      type: 'voter',
      number: 'VOTER-5678'
    },
    identifiableMarks: ['Mole on right cheek'],
    warrants: [
      {
        id: 'w2',
        details: 'Wanted for fraud',
        issuedDate: new Date('2023-02-20'),
        isActive: true,
        court: 'Pune District Court',
        caseNumber: 'CASE002'
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        type: 'profile',
        uploadedAt: new Date('2023-02-15')
      }
    ],
    status: 'active',
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-03-10'),
    createdBy: 'user1',
    lastUpdatedBy: 'user1',
    statusHistory: [
      {
        id: 'sh2',
        criminalId: '2',
        previousStatus: 'active',
        newStatus: 'active',
        changedBy: 'user1',
        changedByName: 'Admin User',
        timestamp: new Date('2023-02-15'),
        notes: 'Initial case creation'
      }
    ]
  },
  {
    _id: '3',
    state: 'Gujarat',
    district: 'Ahmedabad',
    policeStation: 'Navrangpura',
    firNumber: 'FIR003',
    name: 'Raj Patel',
    age: 35,
    fatherName: 'Suresh Patel',
    gender: 'male',
    address: '789 River Rd, Ahmedabad',
    idProof: {
      type: 'pan',
      number: 'PAN-9012'
    },
    identifiableMarks: ['Birthmark on neck'],
    warrants: [
      {
        id: 'w3',
        details: 'Wanted for assault',
        issuedDate: new Date('2023-03-25'),
        isActive: false,
        court: 'Ahmedabad District Court',
        caseNumber: 'CASE003'
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        type: 'profile',
        uploadedAt: new Date('2023-03-20')
      }
    ],
    status: 'arrested',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-04-05'),
    createdBy: 'user2',
    lastUpdatedBy: 'user3',
    statusHistory: [
      {
        id: 'sh3',
        criminalId: '3',
        previousStatus: 'active',
        newStatus: 'active',
        changedBy: 'user2',
        changedByName: 'Investigator User',
        timestamp: new Date('2023-03-20'),
        notes: 'Initial case creation'
      },
      {
        id: 'sh4',
        criminalId: '3',
        previousStatus: 'active',
        newStatus: 'arrested',
        changedBy: 'user2',
        changedByName: 'Investigator User',
        timestamp: new Date('2023-04-05'),
        notes: 'Suspect apprehended at Mumbai Central Station'
      }
    ]
  },
  {
    _id: '4',
    state: 'Rajasthan',
    district: 'Jaipur',
    policeStation: 'Jaipur Central',
    firNumber: 'FIR004',
    name: 'Priya Sharma',
    age: 30,
    fatherName: 'Vikram Sharma',
    gender: 'female',
    address: '101 Desert View, Jaipur',
    idProof: {
      type: 'aadhar',
      number: 'XXXX-XXXX-3456'
    },
    identifiableMarks: ['Scar on forehead'],
    warrants: [
      {
        id: 'w4',
        details: 'Wanted for robbery',
        issuedDate: new Date('2023-04-10'),
        isActive: true,
        court: 'Jaipur District Court',
        caseNumber: 'CASE004'
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        type: 'profile',
        uploadedAt: new Date('2023-04-05')
      }
    ],
    status: 'active',
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-05-01'),
    createdBy: 'user3',
    lastUpdatedBy: 'user3',
    statusHistory: [
      {
        id: 'sh5',
        criminalId: '4',
        previousStatus: 'active',
        newStatus: 'active',
        changedBy: 'user3',
        changedByName: 'Public User',
        timestamp: new Date('2023-04-05'),
        notes: 'Initial case creation'
      }
    ]
  },
  {
    _id: '5',
    state: 'Maharashtra',
    district: 'Nagpur',
    policeStation: 'Nagpur East',
    firNumber: 'FIR005',
    name: 'Amit Kumar',
    age: 40,
    fatherName: 'Rajesh Kumar',
    gender: 'male',
    address: '222 East St, Nagpur',
    idProof: {
      type: 'voter',
      number: 'VOTER-7890'
    },
    identifiableMarks: ['Tattoo on back'],
    warrants: [
      {
        id: 'w5',
        details: 'Wanted for extortion',
        issuedDate: new Date('2023-05-15'),
        isActive: true,
        court: 'Nagpur District Court',
        caseNumber: 'CASE005'
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        type: 'profile',
        uploadedAt: new Date('2023-05-10')
      }
    ],
    status: 'closed',
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-06-01'),
    createdBy: 'user2',
    lastUpdatedBy: 'user1',
    statusHistory: [
      {
        id: 'sh6',
        criminalId: '5',
        previousStatus: 'active',
        newStatus: 'active',
        changedBy: 'user2',
        changedByName: 'Investigator User',
        timestamp: new Date('2023-05-10'),
        notes: 'Initial case creation'
      },
      {
        id: 'sh7',
        criminalId: '5',
        previousStatus: 'active',
        newStatus: 'closed',
        changedBy: 'user1',
        changedByName: 'Admin User',
        timestamp: new Date('2023-06-01'),
        notes: 'Case closed due to insufficient evidence'
      }
    ]
  }
];

export const mockUsers = [
  {
    _id: 'user1',
    email: 'admin@example.com',
    password: '$2a$10$X7aPHQh3Y5rMO1NYY9GFQeVWJg2hqIxGqZU1VsH5wY3NaSXJcQCFa', // hashed 'password123'
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    lastLogin: new Date('2023-06-01')
  },
  {
    _id: 'user2',
    email: 'investigator@example.com',
    password: '$2a$10$X7aPHQh3Y5rMO1NYY9GFQeVWJg2hqIxGqZU1VsH5wY3NaSXJcQCFa', // hashed 'password123'
    name: 'Investigator User',
    role: 'investigator',
    district: 'Mumbai',
    state: 'Maharashtra',
    policeStation: 'Central',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    lastLogin: new Date('2023-06-02')
  },
  {
    _id: 'user3',
    email: 'viewer@example.com',
    password: '$2a$10$X7aPHQh3Y5rMO1NYY9GFQeVWJg2hqIxGqZU1VsH5wY3NaSXJcQCFa', // hashed 'password123'
    name: 'Viewer User',
    role: 'viewer',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
    lastLogin: new Date('2023-06-03')
  }
];

export const mockActivities = [
  {
    id: 'act1',
    description: 'Added new criminal record for John Doe',
    timestamp: new Date('2023-06-01T10:30:00'),
    userId: 'user1',
    userName: 'Admin User',
    actionType: 'create'
  },
  {
    id: 'act2',
    description: 'Updated warrant status for Jane Smith',
    timestamp: new Date('2023-06-02T11:45:00'),
    userId: 'user2',
    userName: 'Investigator User',
    actionType: 'update'
  },
  {
    id: 'act3',
    description: 'Changed status from active to arrested for Raj Patel',
    timestamp: new Date('2023-06-03T09:15:00'),
    userId: 'user2',
    userName: 'Investigator User',
    actionType: 'status_change'
  },
  {
    id: 'act4',
    description: 'Added new warrant for Priya Sharma',
    timestamp: new Date('2023-06-04T14:20:00'),
    userId: 'user1',
    userName: 'Admin User',
    actionType: 'update'
  },
  {
    id: 'act5',
    description: 'Changed status from active to closed for Amit Kumar',
    timestamp: new Date('2023-06-05T16:10:00'),
    userId: 'user1',
    userName: 'Admin User',
    actionType: 'status_change'
  }
];

export const mockAuditLogs = [
  {
    id: 'audit1',
    criminalId: '1',
    action: 'create',
    performedBy: 'user1',
    performedByName: 'Admin User',
    timestamp: new Date('2023-01-10T09:30:00')
  },
  {
    id: 'audit2',
    criminalId: '1',
    action: 'update',
    field: 'address',
    previousValue: '123 Old St, Mumbai',
    newValue: '123 Main St, Mumbai',
    performedBy: 'user2',
    performedByName: 'Investigator User',
    timestamp: new Date('2023-02-15T14:20:00')
  },
  {
    id: 'audit3',
    criminalId: '3',
    action: 'status_change',
    field: 'status',
    previousValue: 'active',
    newValue: 'arrested',
    performedBy: 'user2',
    performedByName: 'Investigator User',
    timestamp: new Date('2023-04-05T11:45:00')
  },
  {
    id: 'audit4',
    criminalId: '5',
    action: 'status_change',
    field: 'status',
    previousValue: 'active',
    newValue: 'closed',
    performedBy: 'user1',
    performedByName: 'Admin User',
    timestamp: new Date('2023-06-01T16:30:00')
  },
  {
    id: 'audit5',
    criminalId: '2',
    action: 'view',
    performedBy: 'user3',
    performedByName: 'Viewer User',
    timestamp: new Date('2023-06-05T10:15:00')
  }
];

export const mockDistrictData = [
  { _id: 'Mumbai', totalCases: 25, activeWarrants: 15, activeCases: 18, closedCases: 2, arrestedCases: 5 },
  { _id: 'Pune', totalCases: 18, activeWarrants: 10, activeCases: 12, closedCases: 3, arrestedCases: 3 },
  { _id: 'Nagpur', totalCases: 12, activeWarrants: 8, activeCases: 7, closedCases: 2, arrestedCases: 3 },
  { _id: 'Thane', totalCases: 20, activeWarrants: 12, activeCases: 15, closedCases: 1, arrestedCases: 4 },
  { _id: 'Nashik', totalCases: 8, activeWarrants: 5, activeCases: 5, closedCases: 1, arrestedCases: 2 }
];

export const mockDistrictOverview = [
  { _id: 'Mumbai', caseCount: 25 },
  { _id: 'Pune', caseCount: 18 },
  { _id: 'Thane', caseCount: 20 },
  { _id: 'Nagpur', caseCount: 12 },
  { _id: 'Nashik', caseCount: 8 }
];

export const mockAnalyticsData = [
  { _id: '2023-06-01', newCases: 5, activeWarrants: 12, activeCases: 70, closedCases: 5, arrestedCases: 8 },
  { _id: '2023-06-02', newCases: 3, activeWarrants: 14, activeCases: 68, closedCases: 6, arrestedCases: 9 },
  { _id: '2023-06-03', newCases: 7, activeWarrants: 15, activeCases: 72, closedCases: 6, arrestedCases: 10 },
  { _id: '2023-06-04', newCases: 2, activeWarrants: 16, activeCases: 70, closedCases: 7, arrestedCases: 11 },
  { _id: '2023-06-05', newCases: 4, activeWarrants: 18, activeCases: 68, closedCases: 8, arrestedCases: 12 },
  { _id: '2023-06-06', newCases: 6, activeWarrants: 20, activeCases: 65, closedCases: 9, arrestedCases: 15 },
  { _id: '2023-06-07', newCases: 3, activeWarrants: 19, activeCases: 63, closedCases: 9, arrestedCases: 16 }
];

export const mockDashboardStats = {
  totalCases: 83,
  activeCases: 63,
  closedCases: 9,
  arrestedCases: 11,
  activeWarrants: 60,
  searchCount: 145,
  districtCount: 12
};

// Helper functions for mock data manipulation
export const updateMockCriminal = (id, updatedData) => {
  const index = mockCriminals.findIndex(c => c._id === id);
  if (index === -1) return null;
  
  const oldData = { ...mockCriminals[index] };
  mockCriminals[index] = { ...oldData, ...updatedData, updatedAt: new Date() };
  
  return mockCriminals[index];
};

export const addStatusChange = (criminalId, previousStatus, newStatus, userId, userName, notes) => {
  const statusChange = {
    id: uuidv4(),
    criminalId,
    previousStatus,
    newStatus,
    changedBy: userId,
    changedByName: userName,
    timestamp: new Date(),
    notes
  };
  
  const criminal = mockCriminals.find(c => c._id === criminalId);
  if (!criminal) return null;
  
  if (!criminal.statusHistory) {
    criminal.statusHistory = [];
  }
  
  criminal.statusHistory.push(statusChange);
  criminal.status = newStatus;
  criminal.updatedAt = new Date();
  criminal.lastUpdatedBy = userId;
  
  // Add to audit logs
  const auditLog = {
    id: uuidv4(),
    criminalId,
    action: 'status_change',
    field: 'status',
    previousValue: previousStatus,
    newValue: newStatus,
    performedBy: userId,
    performedByName: userName,
    timestamp: new Date()
  };
  
  mockAuditLogs.push(auditLog);
  
  // Add to activities
  const activity = {
    id: uuidv4(),
    description: `Changed status from ${previousStatus} to ${newStatus} for ${criminal.name}`,
    timestamp: new Date(),
    userId,
    userName,
    actionType: 'status_change'
  };
  
  mockActivities.unshift(activity);
  
  return statusChange;
};

export const addAuditLog = (criminalId, action, field, previousValue, newValue, userId, userName) => {
  const auditLog = {
    id: uuidv4(),
    criminalId,
    action,
    field,
    previousValue,
    newValue,
    performedBy: userId,
    performedByName: userName,
    timestamp: new Date()
  };
  
  mockAuditLogs.push(auditLog);
  return auditLog;
};

export const getStatusHistory = (criminalId) => {
  const criminal = mockCriminals.find(c => c._id === criminalId);
  if (!criminal || !criminal.statusHistory) return [];
  
  return criminal.statusHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const getAuditLogs = (criminalId, actionType) => {
  let logs = mockAuditLogs.filter(log => log.criminalId === criminalId);
  
  if (actionType) {
    logs = logs.filter(log => log.action === actionType);
  }
  
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const getCasesByStatus = (status) => {
  return mockCriminals.filter(c => c.status === status);
};