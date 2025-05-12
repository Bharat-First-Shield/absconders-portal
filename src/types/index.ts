export type Role = 'admin' | 'investigator' | 'viewer';
export type CaseStatus = 'active' | 'closed' | 'arrested';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  district?: string;
  state?: string;
  policeStation?: string;
}

export interface Criminal {
  _id: string;
  state: string;
  district: string;
  policeStation: string;
  firNumber: string;
  name: string;
  age: number;
  fatherName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  idProof: {
    type: 'aadhar' | 'pan' | 'voter';
    number: string;
  };
  identifiableMarks: string[];
  warrants: {
    id?: string;
    details: string;
    issuedDate: Date;
    isActive: boolean;
    court: string;
    caseNumber: string;
  }[];
  images: {
    url: string;
    type: 'profile' | 'identificationMark' | 'warrant';
    uploadedAt: Date;
  }[];
  status: CaseStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
  statusHistory?: StatusChange[];
}

export interface StatusChange {
  id: string;
  criminalId: string;
  previousStatus: CaseStatus;
  newStatus: CaseStatus;
  changedBy: string;
  changedByName: string;
  timestamp: Date;
  notes?: string;
}

export interface AuditLog {
  id: string;
  criminalId: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'view';
  field?: string;
  previousValue?: any;
  newValue?: any;
  performedBy: string;
  performedByName: string;
  timestamp: Date;
}

export interface CaseFilter {
  status?: CaseStatus;
  district?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
  hasWarrant?: boolean;
  sortBy?: 'name' | 'date' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  arrestedCases: number;
  activeWarrants: number;
  searchCount: number;
  districtCount: number;
}