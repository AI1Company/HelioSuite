/**
 * Database Service Utilities for HelioSuite
 * Firestore operations with type safety and validation
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentReference,
  CollectionReference,
  Query,
  WhereFilterOp,
  OrderByDirection,
} from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import {
  User,
  Client,
  Lead,
  Job,
  Product,
  Proposal,
  ActivityLog,
  Notification,
  FileMetadata,
  CompanySettings,
  Collections,
  BaseDocument,
} from '../types/database';

// Generic database service class
export class DatabaseService<T extends BaseDocument> {
  private collectionRef: CollectionReference;

  constructor(private collectionName: string) {
    this.collectionRef = collection(db, collectionName);
  }

  // Convert Firestore timestamp to Date
  private convertTimestamps(data: any): any {
    if (!data) return data;
    
    const converted = { ...data };
    
    // Convert Firestore Timestamps to Date objects
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      } else if (typeof converted[key] === 'object' && converted[key] !== null) {
        converted[key] = this.convertTimestamps(converted[key]);
      }
    });
    
    return converted;
  }

  // Convert Date objects to Firestore timestamps for writing
  private convertDatesToTimestamps(data: any): any {
    if (!data) return data;
    
    const converted = { ...data };
    
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Date) {
        converted[key] = Timestamp.fromDate(converted[key]);
      } else if (typeof converted[key] === 'object' && converted[key] !== null && !Array.isArray(converted[key])) {
        converted[key] = this.convertDatesToTimestamps(converted[key]);
      }
    });
    
    return converted;
  }

  // Create a new document
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<string> {
    const now = new Date();
    const documentData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      ...(userId && { createdBy: userId, updatedBy: userId }),
    };

    const convertedData = this.convertDatesToTimestamps(documentData);
    const docRef = await addDoc(this.collectionRef, convertedData);
    return docRef.id;
  }

  // Get a document by ID
  async getById(id: string): Promise<T | null> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...this.convertTimestamps(data),
      } as T;
    }
    
    return null;
  }

  // Update a document
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>, userId?: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    const updateData = {
      ...data,
      updatedAt: new Date(),
      ...(userId && { updatedBy: userId }),
    };

    const convertedData = this.convertDatesToTimestamps(updateData);
    await updateDoc(docRef, convertedData);
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await deleteDoc(docRef);
  }

  // Get all documents
  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(this.collectionRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...this.convertTimestamps(doc.data()),
    })) as T[];
  }

  // Query documents with filters
  async query(filters: QueryFilter[]): Promise<T[]> {
    let q: Query = this.collectionRef;

    filters.forEach(filter => {
      switch (filter.type) {
        case 'where':
          q = query(q, where(filter.field, filter.operator, filter.value));
          break;
        case 'orderBy':
          q = query(q, orderBy(filter.field, filter.direction));
          break;
        case 'limit':
          q = query(q, limit(filter.value));
          break;
      }
    });

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...this.convertTimestamps(doc.data()),
    })) as T[];
  }

  // Paginated query
  async queryPaginated(
    filters: QueryFilter[],
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{ data: T[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    let q: Query = this.collectionRef;

    filters.forEach(filter => {
      switch (filter.type) {
        case 'where':
          q = query(q, where(filter.field, filter.operator, filter.value));
          break;
        case 'orderBy':
          q = query(q, orderBy(filter.field, filter.direction));
          break;
      }
    });

    q = query(q, limit(pageSize + 1)); // Get one extra to check if there are more

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;
    
    if (hasMore) {
      docs.pop(); // Remove the extra document
    }

    const data = docs.map(doc => ({
      id: doc.id,
      ...this.convertTimestamps(doc.data()),
    })) as T[];

    return {
      data,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
      hasMore,
    };
  }
}

// Query filter interface
export interface QueryFilter {
  type: 'where' | 'orderBy' | 'limit';
  field: string;
  operator?: WhereFilterOp;
  value?: any;
  direction?: OrderByDirection;
}

// Service instances for each collection
export const userService = new DatabaseService<User>(Collections.USERS);
export const clientService = new DatabaseService<Client>(Collections.CLIENTS);
export const leadService = new DatabaseService<Lead>(Collections.LEADS);
export const jobService = new DatabaseService<Job>(Collections.JOBS);
export const productService = new DatabaseService<Product>(Collections.PRODUCTS);
export const proposalService = new DatabaseService<Proposal>(Collections.PROPOSALS);
export const activityLogService = new DatabaseService<ActivityLog>(Collections.ACTIVITY_LOGS);
export const notificationService = new DatabaseService<Notification>(Collections.NOTIFICATIONS);
export const fileMetadataService = new DatabaseService<FileMetadata>(Collections.FILE_METADATA);
export const companySettingsService = new DatabaseService<CompanySettings>(Collections.COMPANY_SETTINGS);

// Specialized service methods
export class UserService extends DatabaseService<User> {
  constructor() {
    super(Collections.USERS);
  }

  async getByEmail(email: string): Promise<User | null> {
    const users = await this.query([{
      type: 'where',
      field: 'email',
      operator: '==',
      value: email,
    }]);
    return users.length > 0 ? users[0] : null;
  }

  async getActiveUsers(): Promise<User[]> {
    return this.query([{
      type: 'where',
      field: 'isActive',
      operator: '==',
      value: true,
    }]);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.query([{
      type: 'where',
      field: 'role',
      operator: '==',
      value: role,
    }]);
  }
}

export class ClientService extends DatabaseService<Client> {
  constructor() {
    super(Collections.CLIENTS);
  }

  async getByEmail(email: string): Promise<Client | null> {
    const clients = await this.query([{
      type: 'where',
      field: 'email',
      operator: '==',
      value: email,
    }]);
    return clients.length > 0 ? clients[0] : null;
  }

  async getByStatus(status: string): Promise<Client[]> {
    return this.query([{
      type: 'where',
      field: 'status',
      operator: '==',
      value: status,
    }]);
  }

  async getByAssignedSalesRep(salesRepId: string): Promise<Client[]> {
    return this.query([{
      type: 'where',
      field: 'assignedSalesRep',
      operator: '==',
      value: salesRepId,
    }]);
  }

  async searchClients(searchTerm: string): Promise<Client[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation that searches by name prefix
    const clients = await this.getAll();
    const term = searchTerm.toLowerCase();
    
    return clients.filter(client => 
      client.firstName.toLowerCase().includes(term) ||
      client.lastName.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      (client.company && client.company.toLowerCase().includes(term))
    );
  }
}

export class JobService extends DatabaseService<Job> {
  constructor() {
    super(Collections.JOBS);
  }

  async getByClientId(clientId: string): Promise<Job[]> {
    return this.query([{
      type: 'where',
      field: 'clientId',
      operator: '==',
      value: clientId,
    }]);
  }

  async getByStatus(status: string): Promise<Job[]> {
    return this.query([{
      type: 'where',
      field: 'status',
      operator: '==',
      value: status,
    }]);
  }

  async getByTechnician(technicianId: string): Promise<Job[]> {
    return this.query([{
      type: 'where',
      field: 'assignedTechnician',
      operator: '==',
      value: technicianId,
    }]);
  }

  async getScheduledJobs(startDate: Date, endDate: Date): Promise<Job[]> {
    return this.query([
      {
        type: 'where',
        field: 'scheduledDate',
        operator: '>=',
        value: startDate,
      },
      {
        type: 'where',
        field: 'scheduledDate',
        operator: '<=',
        value: endDate,
      },
      {
        type: 'orderBy',
        field: 'scheduledDate',
        direction: 'asc',
      },
    ]);
  }
}

export class ProposalService extends DatabaseService<Proposal> {
  constructor() {
    super(Collections.PROPOSALS);
  }

  async getByClientId(clientId: string): Promise<Proposal[]> {
    return this.query([{
      type: 'where',
      field: 'clientId',
      operator: '==',
      value: clientId,
    }]);
  }

  async getByStatus(status: string): Promise<Proposal[]> {
    return this.query([{
      type: 'where',
      field: 'status',
      operator: '==',
      value: status,
    }]);
  }

  async getExpiredProposals(): Promise<Proposal[]> {
    return this.query([{
      type: 'where',
      field: 'validUntil',
      operator: '<',
      value: new Date(),
    }]);
  }

  async generateProposalNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const proposals = await this.query([{
      type: 'orderBy',
      field: 'createdAt',
      direction: 'desc',
    }, {
      type: 'limit',
      value: 1,
    }]);

    let nextNumber = 1;
    if (proposals.length > 0) {
      const lastProposal = proposals[0];
      const lastNumber = parseInt(lastProposal.proposalNumber.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `PROP-${year}-${nextNumber.toString().padStart(4, '0')}`;
  }
}

export class ActivityLogService extends DatabaseService<ActivityLog> {
  constructor() {
    super(Collections.ACTIVITY_LOGS);
  }

  async getByUserId(userId: string, limitCount: number = 50): Promise<ActivityLog[]> {
    return this.query([
      {
        type: 'where',
        field: 'userId',
        operator: '==',
        value: userId,
      },
      {
        type: 'orderBy',
        field: 'createdAt',
        direction: 'desc',
      },
      {
        type: 'limit',
        value: limitCount,
      },
    ]);
  }

  async getByResourceId(resourceId: string, resourceType: string): Promise<ActivityLog[]> {
    return this.query([
      {
        type: 'where',
        field: 'targetResourceId',
        operator: '==',
        value: resourceId,
      },
      {
        type: 'where',
        field: 'targetResourceType',
        operator: '==',
        value: resourceType,
      },
      {
        type: 'orderBy',
        field: 'createdAt',
        direction: 'desc',
      },
    ]);
  }

  async logActivity(
    type: ActivityLog['type'],
    userId: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.create({
      type,
      userId,
      description,
      metadata,
    });
  }
}

export class ProductService extends DatabaseService<Product> {
  constructor() {
    super(Collections.PRODUCTS);
  }

  async getByCategory(category: string): Promise<Product[]> {
    return this.query([{
      type: 'where',
      field: 'category',
      operator: '==',
      value: category,
    }]);
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.query([{
      type: 'where',
      field: 'isActive',
      operator: '==',
      value: true,
    }]);
  }

  async getBySKU(sku: string): Promise<Product | null> {
    const products = await this.query([{
      type: 'where',
      field: 'sku',
      operator: '==',
      value: sku,
    }]);
    return products.length > 0 ? products[0] : null;
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    const products = await this.getAll();
    const term = searchTerm.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  }
}

// Export specialized service instances
export const userServiceExtended = new UserService();
export const clientServiceExtended = new ClientService();
export const jobServiceExtended = new JobService();
export const proposalServiceExtended = new ProposalService();
export const activityLogServiceExtended = new ActivityLogService();
export const productServiceExtended = new ProductService();

// Utility functions
export const generateJobNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  const jobs = await jobService.query([{
    type: 'orderBy',
    field: 'createdAt',
    direction: 'desc',
  }, {
    type: 'limit',
    value: 1,
  }]);

  let nextNumber = 1;
  if (jobs.length > 0) {
    const lastJob = jobs[0];
    const lastNumber = parseInt(lastJob.jobNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }

  return `JOB-${year}${month}-${nextNumber.toString().padStart(4, '0')}`;
};

export const generateClientNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  
  const clients = await clientService.query([{
    type: 'orderBy',
    field: 'createdAt',
    direction: 'desc',
  }, {
    type: 'limit',
    value: 1,
  }]);

  let nextNumber = 1;
  if (clients.length > 0) {
    const lastClient = clients[0];
    // Assuming client has an ID pattern, adjust as needed
    nextNumber = clients.length + 1;
  }

  return `CLIENT-${year}-${nextNumber.toString().padStart(4, '0')}`;
};

export const generateProductSKU = async (category: string): Promise<string> => {
  const categoryPrefix = category.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `${categoryPrefix}-${year}-`;
  
  // Get existing SKUs for this category and year
  const existingProducts = await productService.query([{
    type: 'orderBy',
    field: 'createdAt',
    direction: 'desc',
  }, {
    type: 'limit',
    value: 1,
  }]);
  
  let nextNumber = 1;
  if (existingProducts.length > 0) {
    const lastProduct = existingProducts[0];
    if (lastProduct.sku && lastProduct.sku.startsWith(categoryPrefix)) {
      const parts = lastProduct.sku.split('-');
      if (parts.length >= 3) {
        const lastNumber = parseInt(parts[2]);
        nextNumber = lastNumber + 1;
      }
    }
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};