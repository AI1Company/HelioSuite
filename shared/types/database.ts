/**
 * Database Schema Types for HelioSuite
 * Shared types for Firestore collections and documents
 */

// Base interface for all documents
export interface BaseDocument {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// User roles enum
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  SALES_REP = 'sales_rep',
  TECHNICIAN = 'technician',
  GUEST = 'guest'
}

// User document interface
export interface User extends BaseDocument {
  email: string;
  role: UserRole;
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: string;
    address?: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
  };
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    theme: 'light' | 'dark';
    language: string;
  };
  lastLoginAt?: Date;
  deactivatedAt?: Date;
  deactivatedBy?: string;
}

// Client/Customer document interface
export interface Client extends BaseDocument {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  
  // Address Information
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Business Information
  company?: string;
  taxNumber?: string;
  
  // CRM Information
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  source: 'website' | 'referral' | 'social_media' | 'advertisement' | 'cold_call' | 'other';
  assignedSalesRep?: string;
  tags: string[];
  notes: string;
  
  // Financial Information
  creditRating?: 'excellent' | 'good' | 'fair' | 'poor';
  paymentTerms?: string;
  
  // Relationship tracking
  totalJobs: number;
  totalRevenue: number;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
}

// Lead document interface (extends Client for lead-specific fields)
export interface Lead extends Omit<Client, 'status'> {
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedValue?: number;
  expectedCloseDate?: Date;
  lostReason?: string;
  conversionDate?: Date; // When lead became customer
}

// Job/Project document interface
export interface Job extends BaseDocument {
  // Basic Information
  jobNumber: string;
  title: string;
  description: string;
  clientId: string;
  
  // Status and Assignment
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTechnician?: string;
  assignedSalesRep?: string;
  
  // Scheduling
  scheduledDate?: Date;
  estimatedDuration?: number; // in hours
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Location
  siteAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    accessInstructions?: string;
  };
  
  // Technical Details
  systemSize?: number; // in kW
  panelCount?: number;
  inverterType?: string;
  roofType?: string;
  roofCondition?: 'excellent' | 'good' | 'fair' | 'poor';
  shadingIssues?: boolean;
  electricalUpgradeRequired?: boolean;
  
  // Financial
  estimatedCost?: number;
  actualCost?: number;
  quotedPrice?: number;
  finalPrice?: number;
  
  // Field Work
  fieldNotes?: string;
  photos?: string[]; // Firebase Storage URLs
  completionPhotos?: string[];
  customerSignature?: string;
  
  // Quality Control
  inspectionRequired?: boolean;
  inspectionDate?: Date;
  inspectionPassed?: boolean;
  inspectionNotes?: string;
  
  // Documentation
  permits?: string[]; // Document URLs
  warranties?: string[];
  manuals?: string[];
  
  // Customer Satisfaction
  customerRating?: number; // 1-5 stars
  customerFeedback?: string;
}

// Product/Equipment document interface
export interface Product extends BaseDocument {
  // Basic Information
  name: string;
  description: string;
  category: 'panel' | 'inverter' | 'battery' | 'mounting' | 'electrical' | 'monitoring' | 'other';
  manufacturer: string;
  model: string;
  sku: string;
  
  // Technical Specifications
  specifications: {
    power?: number; // Watts for panels
    voltage?: number;
    current?: number;
    efficiency?: number; // Percentage
    warranty?: number; // Years
    dimensions?: {
      length: number;
      width: number;
      height: number;
      weight: number;
    };
    certifications?: string[];
  };
  
  // Pricing and Availability
  costPrice: number;
  sellingPrice: number;
  currency: string;
  inStock: boolean;
  stockQuantity?: number;
  minimumStock?: number;
  
  // Supplier Information
  supplier: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  
  // Media
  images?: string[]; // Firebase Storage URLs
  datasheets?: string[];
  
  // Status
  isActive: boolean;
  isDiscontinued?: boolean;
  replacementProductId?: string;
}

// Proposal document interface
export interface Proposal extends BaseDocument {
  // Basic Information
  proposalNumber: string;
  title: string;
  clientId: string;
  jobId?: string;
  
  // Status
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  version: number;
  
  // Validity
  validUntil: Date;
  sentDate?: Date;
  viewedDate?: Date;
  responseDate?: Date;
  
  // System Design
  systemDesign: {
    totalCapacity: number; // kW
    panelCount: number;
    panelType: string;
    inverterType: string;
    batteryIncluded: boolean;
    batteryCapacity?: number; // kWh
    estimatedAnnualProduction: number; // kWh
    roofArea: number; // m²
  };
  
  // Financial Details
  pricing: {
    systemCost: number;
    installationCost: number;
    permitsCost: number;
    totalCost: number;
    taxAmount: number;
    finalAmount: number;
    currency: string;
    paymentTerms: string;
  };
  
  // Savings Analysis
  savingsAnalysis: {
    currentMonthlyBill: number;
    estimatedMonthlySavings: number;
    paybackPeriod: number; // months
    twentyYearSavings: number;
    environmentalImpact: {
      co2ReductionPerYear: number; // kg
      treesEquivalent: number;
    };
  };
  
  // Products/Line Items
  lineItems: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description?: string;
  }[];
  
  // Terms and Conditions
  terms: {
    warrantyPeriod: number; // years
    maintenanceIncluded: boolean;
    installationTimeline: string;
    specialConditions?: string[];
  };
  
  // AI Generation Metadata
  aiGenerated: boolean;
  aiModel?: string;
  generationPrompt?: string;
  generationDate?: Date;
  
  // Document URLs
  pdfUrl?: string;
  presentationUrl?: string;
  
  // Customer Interaction
  customerNotes?: string;
  internalNotes?: string;
  rejectionReason?: string;
}

// Activity Log document interface
export interface ActivityLog extends BaseDocument {
  type: 'user_created' | 'user_updated' | 'role_changed' | 'user_deactivated' |
        'client_created' | 'client_updated' | 'job_created' | 'job_updated' | 'job_completed' |
        'proposal_generated' | 'proposal_sent' | 'proposal_accepted' | 'proposal_rejected' |
        'login' | 'logout' | 'password_changed' | 'file_uploaded' | 'file_deleted' |
        'system_backup' | 'data_export' | 'settings_changed' | 'other';
  
  userId: string;
  targetUserId?: string;
  targetResourceId?: string;
  targetResourceType?: 'user' | 'client' | 'job' | 'proposal' | 'product';
  
  description: string;
  metadata?: Record<string, any>;
  
  // Request Information
  ip?: string;
  userAgent?: string;
  
  // Old/New Values for updates
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

// Notification document interface
export interface Notification extends BaseDocument {
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'job' | 'proposal' | 'client' | 'reminder' | 'security';
  
  title: string;
  message: string;
  
  // Status
  read: boolean;
  readAt?: Date;
  
  // Action
  actionUrl?: string;
  actionText?: string;
  
  // Related Resources
  relatedResourceId?: string;
  relatedResourceType?: 'job' | 'proposal' | 'client' | 'user';
  
  // Delivery
  channels: ('app' | 'email' | 'sms')[];
  emailSent?: boolean;
  smsSent?: boolean;
  
  // Scheduling
  scheduledFor?: Date;
  expiresAt?: Date;
}

// File Metadata document interface
export interface FileMetadata extends BaseDocument {
  // Basic Information
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number; // bytes
  
  // Storage Information
  storagePath: string;
  downloadUrl: string;
  
  // Upload Information
  uploadedBy: string;
  uploadedAt: Date;
  
  // Classification
  category: 'photo' | 'document' | 'proposal' | 'manual' | 'certificate' | 'other';
  tags: string[];
  
  // Related Resources
  jobId?: string;
  clientId?: string;
  proposalId?: string;
  
  // Processing Status
  processed: boolean;
  processingError?: string;
  
  // Metadata
  description?: string;
  isPublic: boolean;
  
  // Image-specific metadata
  imageMetadata?: {
    width: number;
    height: number;
    location?: {
      latitude: number;
      longitude: number;
    };
    capturedAt?: Date;
    cameraModel?: string;
  };
}

// Company Settings document interface
export interface CompanySettings extends BaseDocument {
  // Company Information
  companyName: string;
  registrationNumber?: string;
  taxNumber?: string;
  
  // Contact Information
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  
  // Branding
  logo?: string; // Firebase Storage URL
  primaryColor: string;
  secondaryColor: string;
  
  // Business Settings
  currency: string;
  timezone: string;
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  
  // Proposal Settings
  proposalSettings: {
    defaultWarrantyPeriod: number; // years
    defaultPaymentTerms: string;
    includeEnvironmentalImpact: boolean;
    autoGenerateProposalNumbers: boolean;
    proposalValidityDays: number;
  };
  
  // Notification Settings
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    emailProvider?: 'sendgrid' | 'mailgun' | 'ses';
    smsProvider?: 'twilio' | 'clickatell';
  };
  
  // Integration Settings
  integrations: {
    openaiApiKey?: string;
    weatherApiKey?: string;
    mapsApiKey?: string;
    accountingSystem?: 'quickbooks' | 'xero' | 'sage' | 'none';
  };
  
  // Security Settings
  securitySettings: {
    passwordMinLength: number;
    requireTwoFactor: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
  };
}

// Collection names enum for type safety
export enum Collections {
  USERS = 'users',
  CLIENTS = 'clients',
  LEADS = 'leads',
  JOBS = 'jobs',
  PRODUCTS = 'products',
  PROPOSALS = 'proposals',
  ACTIVITY_LOGS = 'activity_logs',
  NOTIFICATIONS = 'notifications',
  FILE_METADATA = 'file_metadata',
  COMPANY_SETTINGS = 'company_settings'
}

// Type guards for runtime type checking
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.email === 'string' && typeof obj.role === 'string';
};

export const isClient = (obj: any): obj is Client => {
  return obj && typeof obj.firstName === 'string' && typeof obj.lastName === 'string';
};

export const isJob = (obj: any): obj is Job => {
  return obj && typeof obj.jobNumber === 'string' && typeof obj.clientId === 'string';
};

export const isProposal = (obj: any): obj is Proposal => {
  return obj && typeof obj.proposalNumber === 'string' && typeof obj.clientId === 'string';
};