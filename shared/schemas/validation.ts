/**
 * Validation Schemas for HelioSuite
 * Zod schemas for runtime validation of database documents
 */

import { z } from 'zod';
import { UserRole, Collections } from '../types/database';

// Base schema for all documents
const baseDocumentSchema = z.object({
  id: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

// Address schema (reusable)
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
});

// User validation schema
export const userSchema = baseDocumentSchema.extend({
  email: z.string().email('Invalid email format'),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    avatar: z.string().url().optional(),
    address: addressSchema.optional(),
  }),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean(),
    }),
    theme: z.enum(['light', 'dark']),
    language: z.string().min(2, 'Language code must be at least 2 characters'),
  }),
  lastLoginAt: z.date().optional(),
  deactivatedAt: z.date().optional(),
  deactivatedBy: z.string().optional(),
});

// Client validation schema
export const clientSchema = baseDocumentSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternatePhone: z.string().optional(),
  address: addressSchema,
  company: z.string().optional(),
  taxNumber: z.string().optional(),
  status: z.enum(['lead', 'prospect', 'customer', 'inactive']),
  source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other']),
  assignedSalesRep: z.string().optional(),
  tags: z.array(z.string()),
  notes: z.string(),
  creditRating: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  paymentTerms: z.string().optional(),
  totalJobs: z.number().min(0),
  totalRevenue: z.number().min(0),
  lastContactDate: z.date().optional(),
  nextFollowUpDate: z.date().optional(),
});

// Lead validation schema
export const leadSchema = clientSchema.omit({ status: true }).extend({
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatedValue: z.number().min(0).optional(),
  expectedCloseDate: z.date().optional(),
  lostReason: z.string().optional(),
  conversionDate: z.date().optional(),
});

// Job validation schema
export const jobSchema = baseDocumentSchema.extend({
  jobNumber: z.string().min(1, 'Job number is required'),
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(1, 'Job description is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTechnician: z.string().optional(),
  assignedSalesRep: z.string().optional(),
  scheduledDate: z.date().optional(),
  estimatedDuration: z.number().min(0).optional(),
  actualStartDate: z.date().optional(),
  actualEndDate: z.date().optional(),
  siteAddress: addressSchema.extend({
    accessInstructions: z.string().optional(),
  }),
  systemSize: z.number().min(0).optional(),
  panelCount: z.number().min(0).optional(),
  inverterType: z.string().optional(),
  roofType: z.string().optional(),
  roofCondition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  shadingIssues: z.boolean().optional(),
  electricalUpgradeRequired: z.boolean().optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  quotedPrice: z.number().min(0).optional(),
  finalPrice: z.number().min(0).optional(),
  fieldNotes: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  completionPhotos: z.array(z.string().url()).optional(),
  customerSignature: z.string().optional(),
  inspectionRequired: z.boolean().optional(),
  inspectionDate: z.date().optional(),
  inspectionPassed: z.boolean().optional(),
  inspectionNotes: z.string().optional(),
  permits: z.array(z.string().url()).optional(),
  warranties: z.array(z.string().url()).optional(),
  manuals: z.array(z.string().url()).optional(),
  customerRating: z.number().min(1).max(5).optional(),
  customerFeedback: z.string().optional(),
});

// Product validation schema
export const productSchema = baseDocumentSchema.extend({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Product description is required'),
  category: z.enum(['panel', 'inverter', 'battery', 'mounting', 'electrical', 'monitoring', 'other']),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  sku: z.string().min(1, 'SKU is required'),
  specifications: z.object({
    power: z.number().min(0).optional(),
    voltage: z.number().min(0).optional(),
    current: z.number().min(0).optional(),
    efficiency: z.number().min(0).max(100).optional(),
    warranty: z.number().min(0).optional(),
    dimensions: z.object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
      weight: z.number().min(0),
    }).optional(),
    certifications: z.array(z.string()).optional(),
  }),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  inStock: z.boolean(),
  stockQuantity: z.number().min(0).optional(),
  minimumStock: z.number().min(0).optional(),
  supplier: z.object({
    name: z.string().min(1, 'Supplier name is required'),
    contact: z.string().min(1, 'Supplier contact is required'),
    email: z.string().email('Invalid supplier email'),
    phone: z.string().min(10, 'Supplier phone must be at least 10 digits'),
  }),
  images: z.array(z.string().url()).optional(),
  datasheets: z.array(z.string().url()).optional(),
  isActive: z.boolean(),
  isDiscontinued: z.boolean().optional(),
  replacementProductId: z.string().optional(),
});

// Proposal validation schema
export const proposalSchema = baseDocumentSchema.extend({
  proposalNumber: z.string().min(1, 'Proposal number is required'),
  title: z.string().min(1, 'Proposal title is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  jobId: z.string().optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired']),
  version: z.number().min(1),
  validUntil: z.date(),
  sentDate: z.date().optional(),
  viewedDate: z.date().optional(),
  responseDate: z.date().optional(),
  systemDesign: z.object({
    totalCapacity: z.number().min(0),
    panelCount: z.number().min(0),
    panelType: z.string().min(1),
    inverterType: z.string().min(1),
    batteryIncluded: z.boolean(),
    batteryCapacity: z.number().min(0).optional(),
    estimatedAnnualProduction: z.number().min(0),
    roofArea: z.number().min(0),
  }),
  pricing: z.object({
    systemCost: z.number().min(0),
    installationCost: z.number().min(0),
    permitsCost: z.number().min(0),
    totalCost: z.number().min(0),
    taxAmount: z.number().min(0),
    finalAmount: z.number().min(0),
    currency: z.string().length(3),
    paymentTerms: z.string().min(1),
  }),
  savingsAnalysis: z.object({
    currentMonthlyBill: z.number().min(0),
    estimatedMonthlySavings: z.number().min(0),
    paybackPeriod: z.number().min(0),
    twentyYearSavings: z.number().min(0),
    environmentalImpact: z.object({
      co2ReductionPerYear: z.number().min(0),
      treesEquivalent: z.number().min(0),
    }),
  }),
  lineItems: z.array(z.object({
    productId: z.string().min(1),
    productName: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
    description: z.string().optional(),
  })),
  terms: z.object({
    warrantyPeriod: z.number().min(0),
    maintenanceIncluded: z.boolean(),
    installationTimeline: z.string().min(1),
    specialConditions: z.array(z.string()).optional(),
  }),
  aiGenerated: z.boolean(),
  aiModel: z.string().optional(),
  generationPrompt: z.string().optional(),
  generationDate: z.date().optional(),
  pdfUrl: z.string().url().optional(),
  presentationUrl: z.string().url().optional(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// Activity Log validation schema
export const activityLogSchema = baseDocumentSchema.extend({
  type: z.enum([
    'user_created', 'user_updated', 'role_changed', 'user_deactivated',
    'client_created', 'client_updated', 'job_created', 'job_updated', 'job_completed',
    'proposal_generated', 'proposal_sent', 'proposal_accepted', 'proposal_rejected',
    'login', 'logout', 'password_changed', 'file_uploaded', 'file_deleted',
    'system_backup', 'data_export', 'settings_changed', 'other'
  ]),
  userId: z.string().min(1, 'User ID is required'),
  targetUserId: z.string().optional(),
  targetResourceId: z.string().optional(),
  targetResourceType: z.enum(['user', 'client', 'job', 'proposal', 'product']).optional(),
  description: z.string().min(1, 'Description is required'),
  metadata: z.record(z.any()).optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
});

// Notification validation schema
export const notificationSchema = baseDocumentSchema.extend({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['info', 'success', 'warning', 'error']),
  category: z.enum(['system', 'job', 'proposal', 'client', 'reminder', 'security']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  read: z.boolean(),
  readAt: z.date().optional(),
  actionUrl: z.string().url().optional(),
  actionText: z.string().optional(),
  relatedResourceId: z.string().optional(),
  relatedResourceType: z.enum(['job', 'proposal', 'client', 'user']).optional(),
  channels: z.array(z.enum(['app', 'email', 'sms'])),
  emailSent: z.boolean().optional(),
  smsSent: z.boolean().optional(),
  scheduledFor: z.date().optional(),
  expiresAt: z.date().optional(),
});

// File Metadata validation schema
export const fileMetadataSchema = baseDocumentSchema.extend({
  fileName: z.string().min(1, 'File name is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().min(0, 'File size must be positive'),
  storagePath: z.string().min(1, 'Storage path is required'),
  downloadUrl: z.string().url('Invalid download URL'),
  uploadedBy: z.string().min(1, 'Uploaded by is required'),
  uploadedAt: z.date(),
  category: z.enum(['photo', 'document', 'proposal', 'manual', 'certificate', 'other']),
  tags: z.array(z.string()),
  jobId: z.string().optional(),
  clientId: z.string().optional(),
  proposalId: z.string().optional(),
  processed: z.boolean(),
  processingError: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  imageMetadata: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }).optional(),
    capturedAt: z.date().optional(),
    cameraModel: z.string().optional(),
  }).optional(),
});

// Company Settings validation schema
export const companySettingsSchema = baseDocumentSchema.extend({
  companyName: z.string().min(1, 'Company name is required'),
  registrationNumber: z.string().optional(),
  taxNumber: z.string().optional(),
  address: addressSchema,
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email format'),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
  businessHours: z.object({
    monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  }),
  proposalSettings: z.object({
    defaultWarrantyPeriod: z.number().min(0),
    defaultPaymentTerms: z.string().min(1),
    includeEnvironmentalImpact: z.boolean(),
    autoGenerateProposalNumbers: z.boolean(),
    proposalValidityDays: z.number().min(1),
  }),
  notificationSettings: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    emailProvider: z.enum(['sendgrid', 'mailgun', 'ses']).optional(),
    smsProvider: z.enum(['twilio', 'clickatell']).optional(),
  }),
  integrations: z.object({
    openaiApiKey: z.string().optional(),
    weatherApiKey: z.string().optional(),
    mapsApiKey: z.string().optional(),
    accountingSystem: z.enum(['quickbooks', 'xero', 'sage', 'none']).optional(),
  }),
  securitySettings: z.object({
    passwordMinLength: z.number().min(8).max(128),
    requireTwoFactor: z.boolean(),
    sessionTimeoutMinutes: z.number().min(5).max(1440),
    maxLoginAttempts: z.number().min(3).max(10),
  }),
});

// Input schemas for creating/updating documents (without auto-generated fields)
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  lastLoginAt: true,
});

export const updateUserSchema = createUserSchema.partial();

export const createClientSchema = clientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  totalJobs: true,
  totalRevenue: true,
});

export const updateClientSchema = createClientSchema.partial();

export const createJobSchema = jobSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updateJobSchema = createJobSchema.partial();

export const createProposalSchema = proposalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  sentDate: true,
  viewedDate: true,
  responseDate: true,
});

export const updateProposalSchema = createProposalSchema.partial();

export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updateProductSchema = createProductSchema.partial();

// Validation helper functions
export const validateDocument = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
};

export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};

// Export all schemas for easy access
export const schemas = {
  user: userSchema,
  client: clientSchema,
  lead: leadSchema,
  job: jobSchema,
  product: productSchema,
  proposal: proposalSchema,
  activityLog: activityLogSchema,
  notification: notificationSchema,
  fileMetadata: fileMetadataSchema,
  companySettings: companySettingsSchema,
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  createClient: createClientSchema,
  updateClient: updateClientSchema,
  createJob: createJobSchema,
  updateJob: updateJobSchema,
  createProposal: createProposalSchema,
  updateProposal: updateProposalSchema,
  createProduct: createProductSchema,
  updateProduct: updateProductSchema,
};