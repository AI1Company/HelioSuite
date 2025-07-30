/**
 * Client Management Utilities for HelioSuite
 * Core business logic for client and lead operations
 */

import { Client, Lead, UserRole } from '../types/database';
import { clientServiceExtended, leadService, activityLogServiceExtended } from '../services/database';

// Client management class
export class ClientManager {
  /**
   * Create a new client
   */
  static async createClient(
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'totalJobs' | 'totalRevenue'>,
    createdBy?: string
  ): Promise<string> {
    // Validate email uniqueness
    const existingClient = await clientServiceExtended.getByEmail(clientData.email);
    if (existingClient) {
      throw new Error('Client with this email already exists');
    }

    // Set default values
    const clientToCreate: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
      ...clientData,
      totalJobs: 0,
      totalRevenue: 0,
      tags: clientData.tags || [],
      notes: clientData.notes || '',
    };

    // Create client
    const clientId = await clientServiceExtended.create(clientToCreate, createdBy);

    // Log activity
    if (createdBy) {
      await activityLogServiceExtended.logActivity(
        'client_created',
        createdBy,
        `Created new client: ${clientData.firstName} ${clientData.lastName} (${clientData.email})`,
        {
          targetResourceId: clientId,
          targetResourceType: 'client',
          clientStatus: clientData.status,
          clientSource: clientData.source,
        }
      );
    }

    return clientId;
  }

  /**
   * Update client information
   */
  static async updateClient(
    clientId: string,
    updates: Partial<Omit<Client, 'id' | 'createdAt' | 'totalJobs' | 'totalRevenue'>>,
    updatedBy?: string
  ): Promise<void> {
    const existingClient = await clientServiceExtended.getById(clientId);
    if (!existingClient) {
      throw new Error('Client not found');
    }

    // If email is being updated, check uniqueness
    if (updates.email && updates.email !== existingClient.email) {
      const emailExists = await clientServiceExtended.getByEmail(updates.email);
      if (emailExists) {
        throw new Error('Another client with this email already exists');
      }
    }

    // Track changes for activity log
    const changes: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      const oldValue = (existingClient as any)[key];
      const newValue = (updates as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    // Update client
    await clientServiceExtended.update(clientId, updates, updatedBy);

    // Log activity
    if (updatedBy && Object.keys(changes).length > 0) {
      await activityLogServiceExtended.logActivity(
        'client_updated',
        updatedBy,
        `Updated client: ${existingClient.firstName} ${existingClient.lastName}`,
        {
          targetResourceId: clientId,
          targetResourceType: 'client',
          changes,
        }
      );
    }
  }

  /**
   * Convert lead to client
   */
  static async convertLeadToClient(
    leadId: string,
    convertedBy: string
  ): Promise<string> {
    const lead = await leadService.getById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.status === 'won') {
      throw new Error('Lead has already been converted');
    }

    // Create client from lead data
    const clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'totalJobs' | 'totalRevenue'> = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      alternatePhone: lead.alternatePhone,
      address: lead.address,
      company: lead.company,
      taxNumber: lead.taxNumber,
      status: 'customer',
      source: lead.source,
      assignedSalesRep: lead.assignedSalesRep,
      tags: lead.tags,
      notes: lead.notes,
      creditRating: lead.creditRating,
      paymentTerms: lead.paymentTerms,
      lastContactDate: new Date(),
      nextFollowUpDate: lead.nextFollowUpDate,
    };

    const clientId = await this.createClient(clientData, convertedBy);

    // Update lead status
    await leadService.update(leadId, {
      status: 'won',
      conversionDate: new Date(),
    }, convertedBy);

    // Log activity
    await activityLogServiceExtended.logActivity(
      'client_created',
      convertedBy,
      `Converted lead to client: ${lead.firstName} ${lead.lastName}`,
      {
        targetResourceId: clientId,
        targetResourceType: 'client',
        originalLeadId: leadId,
        conversionDate: new Date(),
      }
    );

    return clientId;
  }

  /**
   * Update client statistics (jobs and revenue)
   */
  static async updateClientStats(
    clientId: string,
    jobCount: number,
    totalRevenue: number
  ): Promise<void> {
    await clientServiceExtended.update(clientId, {
      totalJobs: jobCount,
      totalRevenue: totalRevenue,
    });
  }

  /**
   * Add tags to client
   */
  static async addClientTags(
    clientId: string,
    newTags: string[],
    updatedBy?: string
  ): Promise<void> {
    const client = await clientServiceExtended.getById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const uniqueTags = Array.from(new Set([...client.tags, ...newTags]));
    await clientServiceExtended.update(clientId, { tags: uniqueTags }, updatedBy);
  }

  /**
   * Remove tags from client
   */
  static async removeClientTags(
    clientId: string,
    tagsToRemove: string[],
    updatedBy?: string
  ): Promise<void> {
    const client = await clientServiceExtended.getById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const filteredTags = client.tags.filter(tag => !tagsToRemove.includes(tag));
    await clientServiceExtended.update(clientId, { tags: filteredTags }, updatedBy);
  }

  /**
   * Update client contact information
   */
  static async updateLastContact(
    clientId: string,
    nextFollowUpDate?: Date,
    updatedBy?: string
  ): Promise<void> {
    const updates: Partial<Client> = {
      lastContactDate: new Date(),
    };

    if (nextFollowUpDate) {
      updates.nextFollowUpDate = nextFollowUpDate;
    }

    await clientServiceExtended.update(clientId, updates, updatedBy);
  }

  /**
   * Get clients requiring follow-up
   */
  static async getClientsRequiringFollowUp(): Promise<Client[]> {
    const allClients = await clientServiceExtended.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allClients.filter(client => 
      client.nextFollowUpDate && 
      client.nextFollowUpDate <= today &&
      client.status !== 'inactive'
    );
  }

  /**
   * Get client statistics
   */
  static async getClientStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    totalRevenue: number;
    averageRevenue: number;
    topClients: Client[];
  }> {
    const allClients = await clientServiceExtended.getAll();
    
    const stats = {
      total: allClients.length,
      byStatus: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      totalRevenue: 0,
      averageRevenue: 0,
      topClients: [] as Client[],
    };

    // Count by status and source
    allClients.forEach(client => {
      // Status counts
      stats.byStatus[client.status] = (stats.byStatus[client.status] || 0) + 1;
      
      // Source counts
      stats.bySource[client.source] = (stats.bySource[client.source] || 0) + 1;
      
      // Revenue totals
      stats.totalRevenue += client.totalRevenue;
    });

    // Calculate average revenue
    stats.averageRevenue = allClients.length > 0 ? stats.totalRevenue / allClients.length : 0;

    // Get top clients by revenue
    stats.topClients = allClients
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return stats;
  }

  /**
   * Search clients with advanced filters
   */
  static async searchClients(filters: {
    searchTerm?: string;
    status?: string;
    source?: string;
    assignedSalesRep?: string;
    tags?: string[];
    minRevenue?: number;
    maxRevenue?: number;
  }): Promise<Client[]> {
    let clients = await clientServiceExtended.getAll();

    // Apply filters
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      clients = clients.filter(client => 
        client.firstName.toLowerCase().includes(term) ||
        client.lastName.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        (client.company && client.company.toLowerCase().includes(term))
      );
    }

    if (filters.status) {
      clients = clients.filter(client => client.status === filters.status);
    }

    if (filters.source) {
      clients = clients.filter(client => client.source === filters.source);
    }

    if (filters.assignedSalesRep) {
      clients = clients.filter(client => client.assignedSalesRep === filters.assignedSalesRep);
    }

    if (filters.tags && filters.tags.length > 0) {
      clients = clients.filter(client => 
        filters.tags!.some(tag => client.tags.includes(tag))
      );
    }

    if (filters.minRevenue !== undefined) {
      clients = clients.filter(client => client.totalRevenue >= filters.minRevenue!);
    }

    if (filters.maxRevenue !== undefined) {
      clients = clients.filter(client => client.totalRevenue <= filters.maxRevenue!);
    }

    return clients;
  }

  /**
   * Validate client data
   */
  static validateClientData(clientData: Partial<Client>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    if (clientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (clientData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(clientData.phone)) {
      errors.push('Invalid phone number format');
    }

    // Name validation
    if (clientData.firstName && clientData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (clientData.lastName && clientData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    // Address validation
    if (clientData.address) {
      if (!clientData.address.street || clientData.address.street.trim().length < 5) {
        errors.push('Street address must be at least 5 characters');
      }
      if (!clientData.address.city || clientData.address.city.trim().length < 2) {
        errors.push('City must be at least 2 characters');
      }
      if (!clientData.address.postalCode || !/^[A-Za-z0-9\s\-]{3,10}$/.test(clientData.address.postalCode)) {
        errors.push('Invalid postal code format');
      }
    }

    // Status validation
    const validStatuses = ['lead', 'prospect', 'customer', 'inactive'];
    if (clientData.status && !validStatuses.includes(clientData.status)) {
      errors.push('Invalid client status');
    }

    // Source validation
    const validSources = ['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other'];
    if (clientData.source && !validSources.includes(clientData.source)) {
      errors.push('Invalid client source');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check user permissions for client operations
   */
  static canManageClient(userRole: UserRole, clientAssignedTo?: string, userId?: string): boolean {
    // Owners and admins can manage all clients
    if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
      return true;
    }

    // Sales reps can manage their assigned clients
    if (userRole === UserRole.SALES_REP) {
      return !clientAssignedTo || clientAssignedTo === userId;
    }

    // Technicians and guests cannot manage clients
    return false;
  }

  /**
   * Get client activity history
   */
  static async getClientActivity(clientId: string): Promise<any[]> {
    return activityLogServiceExtended.getByResourceId(clientId, 'client');
  }
}

// Lead management class
export class LeadManager {
  /**
   * Create a new lead
   */
  static async createLead(
    leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'totalJobs' | 'totalRevenue'>,
    createdBy?: string
  ): Promise<string> {
    // Validate email uniqueness
    const existingLead = await leadService.query([{
      type: 'where',
      field: 'email',
      operator: '==',
      value: leadData.email,
    }]);
    
    if (existingLead.length > 0) {
      throw new Error('Lead with this email already exists');
    }

    // Set default values
    const leadToCreate: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      ...leadData,
      totalJobs: 0,
      totalRevenue: 0,
      tags: leadData.tags || [],
      notes: leadData.notes || '',
      status: leadData.status || 'new',
      priority: leadData.priority || 'medium',
    };

    // Create lead
    const leadId = await leadService.create(leadToCreate, createdBy);

    // Log activity
    if (createdBy) {
      await activityLogServiceExtended.logActivity(
        'client_created',
        createdBy,
        `Created new lead: ${leadData.firstName} ${leadData.lastName} (${leadData.email})`,
        {
          targetResourceId: leadId,
          targetResourceType: 'client',
          leadStatus: leadData.status,
          leadPriority: leadData.priority,
        }
      );
    }

    return leadId;
  }

  /**
   * Update lead status
   */
  static async updateLeadStatus(
    leadId: string,
    newStatus: Lead['status'],
    updatedBy?: string,
    notes?: string
  ): Promise<void> {
    const lead = await leadService.getById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const oldStatus = lead.status;
    const updates: Partial<Lead> = { status: newStatus };

    // Add specific fields based on status
    if (newStatus === 'lost' && notes) {
      updates.lostReason = notes;
    }

    await leadService.update(leadId, updates, updatedBy);

    // Log activity
    if (updatedBy) {
      await activityLogServiceExtended.logActivity(
        'client_updated',
        updatedBy,
        `Updated lead status: ${lead.firstName} ${lead.lastName} from ${oldStatus} to ${newStatus}`,
        {
          targetResourceId: leadId,
          targetResourceType: 'client',
          oldStatus,
          newStatus,
          notes,
        }
      );
    }
  }

  /**
   * Get leads by status
   */
  static async getLeadsByStatus(status: Lead['status']): Promise<Lead[]> {
    return leadService.query([{
      type: 'where',
      field: 'status',
      operator: '==',
      value: status,
    }]);
  }

  /**
   * Get leads by priority
   */
  static async getLeadsByPriority(priority: Lead['priority']): Promise<Lead[]> {
    return leadService.query([{
      type: 'where',
      field: 'priority',
      operator: '==',
      value: priority,
    }]);
  }

  /**
   * Get lead conversion statistics
   */
  static async getLeadStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    conversionRate: number;
    averageValue: number;
  }> {
    const allLeads = await leadService.getAll();
    
    const stats = {
      total: allLeads.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      conversionRate: 0,
      averageValue: 0,
    };

    let totalValue = 0;
    let convertedLeads = 0;

    allLeads.forEach(lead => {
      // Status counts
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
      
      // Priority counts
      stats.byPriority[lead.priority] = (stats.byPriority[lead.priority] || 0) + 1;
      
      // Value and conversion tracking
      if (lead.estimatedValue) {
        totalValue += lead.estimatedValue;
      }
      
      if (lead.status === 'won') {
        convertedLeads++;
      }
    });

    stats.conversionRate = allLeads.length > 0 ? (convertedLeads / allLeads.length) * 100 : 0;
    stats.averageValue = allLeads.length > 0 ? totalValue / allLeads.length : 0;

    return stats;
  }
}

// Export utility functions
export const createClient = ClientManager.createClient.bind(ClientManager);
export const updateClient = ClientManager.updateClient.bind(ClientManager);
export const convertLeadToClient = ClientManager.convertLeadToClient.bind(ClientManager);
export const updateClientStats = ClientManager.updateClientStats.bind(ClientManager);
export const addClientTags = ClientManager.addClientTags.bind(ClientManager);
export const removeClientTags = ClientManager.removeClientTags.bind(ClientManager);
export const updateLastContact = ClientManager.updateLastContact.bind(ClientManager);
export const getClientsRequiringFollowUp = ClientManager.getClientsRequiringFollowUp.bind(ClientManager);
export const getClientStats = ClientManager.getClientStats.bind(ClientManager);
export const searchClients = ClientManager.searchClients.bind(ClientManager);
export const validateClientData = ClientManager.validateClientData.bind(ClientManager);
export const canManageClient = ClientManager.canManageClient.bind(ClientManager);
export const getClientActivity = ClientManager.getClientActivity.bind(ClientManager);

export const createLead = LeadManager.createLead.bind(LeadManager);
export const updateLeadStatus = LeadManager.updateLeadStatus.bind(LeadManager);
export const getLeadsByStatus = LeadManager.getLeadsByStatus.bind(LeadManager);
export const getLeadsByPriority = LeadManager.getLeadsByPriority.bind(LeadManager);
export const getLeadStats = LeadManager.getLeadStats.bind(LeadManager);