# Absconders Portal Database Schema

## Collections Overview

### 1. Users Collection
```typescript
interface User {
  _id: ObjectId;
  email: string;          // Unique email for login
  password: string;       // Hashed password
  name: string;          
  role: 'admin' | 'investigator' | 'public';
  district?: string;      // Required for investigators
  state?: string;        // Required for investigators
  policeStation?: string; // Required for investigators
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

// Indexes:
// - email: unique
// - role: 1
// - district: 1
// - state: 1
```

### 2. Criminals Collection
```typescript
interface Criminal {
  _id: ObjectId;
  state: string;
  district: string;
  policeStation: string;
  firNumber: string;      // Unique within a police station
  name: string;
  age: number;
  fatherName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  idProof: {
    type: 'aadhar' | 'pan' | 'voter';
    number: string;      // Encrypted
  };
  identifiableMarks: string[];
  warrants: [{
    details: string;
    issuedDate: Date;
    isActive: boolean;
    court: string;
    caseNumber: string;
  }];
  images: [{
    url: string;        // GridFS file ID
    type: 'profile' | 'identificationMark' | 'warrant';
    uploadedAt: Date;
  }];
  status: 'active' | 'arrested' | 'deceased';
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId;  // Reference to Users collection
  lastUpdatedBy: ObjectId; // Reference to Users collection
}

// Indexes:
// - firNumber: 1
// - name: "text"
// - state: 1
// - district: 1
// - policeStation: 1
// - status: 1
// - "idProof.number": 1
// - createdAt: 1
```

### 3. AuditLogs Collection
```typescript
interface AuditLog {
  _id: ObjectId;
  action: 'create' | 'update' | 'delete' | 'view';
  collectionName: string;
  documentId: ObjectId;
  userId: ObjectId;      // Reference to Users collection
  userRole: string;
  changes: {
    before: object;
    after: object;
  };
  timestamp: Date;
  ipAddress: string;
}

// Indexes:
// - timestamp: 1
// - userId: 1
// - action: 1
// - documentId: 1
```

### 4. Files Collection (GridFS)
```typescript
// Using MongoDB GridFS for storing files
interface FileMetadata {
  originalName: string;
  contentType: string;
  size: number;
  uploadedBy: ObjectId;  // Reference to Users collection
  criminalId: ObjectId;  // Reference to Criminals collection
  type: 'profile' | 'identificationMark' | 'warrant';
  uploadedAt: Date;
}
```

### 5. Analytics Collection
```typescript
interface Analytics {
  _id: ObjectId;
  type: 'daily' | 'weekly' | 'monthly';
  date: Date;
  metrics: {
    totalCases: number;
    activeWarrants: number;
    arrestedCount: number;
    searchCount: number;
    newCases: number;
    byDistrict: {
      [district: string]: {
        cases: number;
        warrants: number;
      }
    };
    byState: {
      [state: string]: {
        cases: number;
        warrants: number;
      }
    };
  };
}

// Indexes:
// - type: 1
// - date: 1
```

## Security Considerations

1. **Data Encryption**
   - ID proof numbers are encrypted at rest
   - Sensitive personal information is encrypted
   - Images are stored securely in GridFS

2. **Access Control**
   - Role-based access control (RBAC) implemented at the application level
   - District-level data isolation for investigators
   - Audit logging for all operations

3. **Data Integrity**
   - Timestamps for all modifications
   - User tracking for all changes
   - Complete audit trail

## Relationships

1. **Users → Criminals**
   - One-to-many: Users can create/update multiple criminal records
   - Role-based access control determines read/write permissions

2. **Criminals → Files**
   - One-to-many: Each criminal can have multiple images
   - Files stored in GridFS with metadata linking to criminal

3. **Users → AuditLogs**
   - One-to-many: Each user action is logged
   - Comprehensive tracking of all system interactions

## Validation Rules

1. **Users Collection**
   - Email must be unique and valid format
   - Password must be hashed
   - Role must be one of the specified values
   - District/State/Police Station required for investigators

2. **Criminals Collection**
   - FIR number must be unique within a police station
   - Age must be a positive number
   - At least one image required
   - Valid status values

3. **AuditLogs Collection**
   - Valid action types
   - Required user and document references
   - Timestamp cannot be in future

## Performance Optimization

1. **Indexes**
   - Compound indexes for common queries
   - Text indexes for search functionality
   - Date-based indexes for analytics

2. **Data Distribution**
   - Sharding strategy based on state/district
   - Efficient data access patterns