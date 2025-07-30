/**
 * Job Management Utilities for HelioSuite
 * Core business logic for solar installation job operations
 */

import { Job, UserRole } from '../types/database';
import { jobServiceExtended, clientServiceExtended, activityLogServiceExtended, generateJobNumber } from '../services/database';

// Job management class
export class JobManager {
  /**
   * Create a new job
   */
  static async createJob(
    jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'jobNumber'>,
    createdBy?: string
  ): Promise<string> {
    // Validate client exists
    const client = await clientServiceExtended.getById(jobData.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Generate job number
    const jobNumber = await generateJobNumber();

    // Set default values
    const jobToCreate: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
      ...jobData,
      jobNumber,
      status: jobData.status || 'pending',
      priority: jobData.priority || 'medium',
    };

    // Create job
    const jobId = await jobServiceExtended.create(jobToCreate, createdBy);

    // Update client job count
    const clientJobs = await jobServiceExtended.getByClientId(jobData.clientId);
    await clientServiceExtended.update(jobData.clientId, {
      totalJobs: clientJobs.length + 1,
    });

    // Log activity
    if (createdBy) {
      await activityLogServiceExtended.logActivity(
        'job_created',
        createdBy,
        `Created new job: ${jobNumber} for ${client.firstName} ${client.lastName}`,
        {
          targetResourceId: jobId,
          targetResourceType: 'job',
          jobNumber,
          clientId: jobData.clientId,
          jobStatus: jobData.status,
        }
      );
    }

    return jobId;
  }

  /**
   * Update job information
   */
  static async updateJob(
    jobId: string,
    updates: Partial<Omit<Job, 'id' | 'createdAt' | 'jobNumber' | 'clientId'>>,
    updatedBy?: string
  ): Promise<void> {
    const existingJob = await jobServiceExtended.getById(jobId);
    if (!existingJob) {
      throw new Error('Job not found');
    }

    // Track changes for activity log
    const changes: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      const oldValue = (existingJob as any)[key];
      const newValue = (updates as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    // Update job
    await jobServiceExtended.update(jobId, updates, updatedBy);

    // Log activity
    if (updatedBy && Object.keys(changes).length > 0) {
      await activityLogServiceExtended.logActivity(
        'job_updated',
        updatedBy,
        `Updated job: ${existingJob.jobNumber}`,
        {
          targetResourceId: jobId,
          targetResourceType: 'job',
          changes,
        }
      );
    }
  }

  /**
   * Update job status with automatic field updates
   */
  static async updateJobStatus(
    jobId: string,
    newStatus: Job['status'],
    updatedBy?: string,
    notes?: string
  ): Promise<void> {
    const job = await jobServiceExtended.getById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const oldStatus = job.status;
    const updates: Partial<Job> = { status: newStatus };
    const now = new Date();

    // Add automatic field updates based on status
    switch (newStatus) {
      case 'in_progress':
        if (!job.actualStartDate) {
          updates.actualStartDate = now;
        }
        break;
      case 'completed':
        if (!job.actualEndDate) {
          updates.actualEndDate = now;
        }
        break;
      case 'cancelled':
      case 'on_hold':
        // No automatic field updates for these statuses
        break;
    }

    await jobServiceExtended.update(jobId, updates, updatedBy);

    // Update client revenue if job is completed
    if (newStatus === 'completed' && job.finalPrice) {
      await this.updateClientRevenue(job.clientId);
    }

    // Log activity
    if (updatedBy) {
      await activityLogServiceExtended.logActivity(
        'job_updated',
        updatedBy,
        `Updated job status: ${job.jobNumber} from ${oldStatus} to ${newStatus}${notes ? ` - ${notes}` : ''}`,
        {
          targetResourceId: jobId,
          targetResourceType: 'job',
          oldStatus,
          newStatus,
          notes,
        }
      );

      if (newStatus === 'completed') {
        await activityLogServiceExtended.logActivity(
          'job_completed',
          updatedBy,
          `Completed job: ${job.jobNumber}`,
          {
            targetResourceId: jobId,
            targetResourceType: 'job',
            completionDate: now,
            finalPrice: job.finalPrice,
          }
        );
      }
    }
  }

  /**
   * Assign technician to job
   */
  static async assignTechnician(
    jobId: string,
    technicianId: string,
    assignedBy?: string
  ): Promise<void> {
    const job = await jobServiceExtended.getById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const oldTechnician = job.assignedTechnician;
    await jobServiceExtended.update(jobId, {
      assignedTechnician: technicianId,
    }, assignedBy);

    // Log activity
    if (assignedBy) {
      await activityLogServiceExtended.logActivity(
        'job_updated',
        assignedBy,
        `Assigned technician to job: ${job.jobNumber}`,
        {
          targetResourceId: jobId,
          targetResourceType: 'job',
          oldTechnician,
          newTechnician: technicianId,
        }
      );
    }
  }

  /**
   * Schedule job
   */
  static async scheduleJob(
    jobId: string,
    scheduledDate: Date,
    estimatedDuration?: number,
    scheduledBy?: string
  ): Promise<void> {
    const job = await jobServiceExtended.getById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const updates: Partial<Job> = {
      scheduledDate,
      status: 'scheduled',
    };

    if (estimatedDuration) {
      updates.estimatedDuration = estimatedDuration;
    }

    await jobServiceExtended.update(jobId, updates, scheduledBy);

    // Log activity
    if (scheduledBy) {
      await activityLogServiceExtended.logActivity(
        'job_updated',
        scheduledBy,
        `Scheduled job: ${job.jobNumber} for ${scheduledDate.toLocaleDateString()}`,
        {
          targetResourceId: jobId,
          targetResourceType: 'job',
          scheduledDate,
          estimatedDuration,
        }
      );
    }
  }

  /**
   * Add field notes and photos
   */
  static async addFieldWork(
    jobId: string,
    fieldNotes?: string,
    photos?: string[],
    completionPhotos?: string[],
    updatedBy?: string
  ): Promise<void> {
    const job = await jobServiceExtended.getById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const updates: Partial<Job> = {};

    if (fieldNotes) {
      updates.fieldNotes = fieldNotes;
    }

    if (photos && photos.length > 0) {
      updates.photos = [...(job.photos || []), ...photos];
    }

    if (completionPhotos && completionPhotos.length > 0) {
      updates.completionPhotos = [...(job.completionPhotos || []), ...completionPhotos];
    }

    if (Object.keys(updates).length > 0) {
      await jobServiceExtended.update(jobId, updates, updatedBy);

      // Log activity
      if (updatedBy) {
        await activityLogServiceExtended.logActivity(
          'job_updated',
          updatedBy,
          `Added field work to job: ${job.jobNumber}`,
          {
            targetResourceId: jobId,
            targetResourceType: 'job',
            fieldNotesAdded: !!fieldNotes,
            photosAdded: photos?.length || 0,
            completionPhotosAdded: completionPhotos?.length || 0,
          }
        );
      }
    }
  }

  /**
   * Update job pricing
   */
  static async updateJobPricing(
    jobId: string,
    pricing: {
      estimatedCost?: number;
      actualCost?: number;
      quotedPrice?: number;
      finalPrice?: number;
    },
    updatedBy?: string
  ): Promise<void> {
    const job = await jobServiceExtended.getById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    await jobServiceExtended.update(jobId, pricing, updatedBy);

    // Update client revenue if final price is set
    if (pricing.finalPrice && job.status === 'completed') {
      await this.updateClientRevenue(job.clientId);
    }

    // Log activity
    if (updatedBy) {
      await activityLogServiceExtended.logActivity(
        'job_updated',
        updatedBy,
        `Updated pricing for job: ${job.jobNumber}`,
        {
          targetResourceId: jobId,
          targetResourceType: 'job',
          pricingUpdates: pricing,
        }
      );
    }
  }

  /**
   * Record customer feedback
   */
  static async recordCustomerFeedback(
    jobId: string,
    rating: number,
    feedback?: string,
    customerSignature?: string,
    recordedBy?: string
  ): Promise<void> {
    const job = await jobServiceExtended.getById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updates: Partial<Job> = {
      customerRating: rating,
    };

    if (feedback) {
      updates.customerFeedback = feedback;
    }

    if (customerSignature) {
      updates.customerSignature = customerSignature;
    }

    await jobServiceExtended.update(jobId, updates, recordedBy);

    // Log activity
    if (recordedBy) {
      await activityLogServiceExtended.logActivity(
        'job_updated',
        recordedBy,
        `Recorded customer feedback for job: ${job.jobNumber} (${rating}/5 stars)`,
        {
          targetResourceId: jobId,
          targetResourceType: 'job',
          customerRating: rating,
          feedbackProvided: !!feedback,
          signatureProvided: !!customerSignature,
        }
      );
    }
  }

  /**
   * Get jobs by date range
   */
  static async getJobsByDateRange(
    startDate: Date,
    endDate: Date,
    field: 'scheduledDate' | 'actualStartDate' | 'actualEndDate' = 'scheduledDate'
  ): Promise<Job[]> {
    return jobServiceExtended.query([
      {
        type: 'where',
        field,
        operator: '>=',
        value: startDate,
      },
      {
        type: 'where',
        field,
        operator: '<=',
        value: endDate,
      },
      {
        type: 'orderBy',
        field,
        direction: 'asc',
      },
    ]);
  }

  /**
   * Get technician workload
   */
  static async getTechnicianWorkload(technicianId: string): Promise<{
    activeJobs: Job[];
    scheduledJobs: Job[];
    completedThisMonth: Job[];
    totalHours: number;
  }> {
    const allJobs = await jobServiceExtended.getByTechnician(technicianId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const activeJobs = allJobs.filter(job => 
      job.status === 'in_progress' || job.status === 'scheduled'
    );

    const scheduledJobs = allJobs.filter(job => 
      job.status === 'scheduled' && job.scheduledDate && job.scheduledDate >= now
    );

    const completedThisMonth = allJobs.filter(job => 
      job.status === 'completed' && 
      job.actualEndDate && 
      job.actualEndDate >= monthStart && 
      job.actualEndDate <= monthEnd
    );

    const totalHours = allJobs.reduce((total, job) => {
      if (job.actualStartDate && job.actualEndDate) {
        const hours = (job.actualEndDate.getTime() - job.actualStartDate.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }
      return total + (job.estimatedDuration || 0);
    }, 0);

    return {
      activeJobs,
      scheduledJobs,
      completedThisMonth,
      totalHours,
    };
  }

  /**
   * Get job statistics
   */
  static async getJobStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    totalRevenue: number;
    averageJobValue: number;
    completionRate: number;
    averageRating: number;
  }> {
    const allJobs = await jobServiceExtended.getAll();
    
    const stats = {
      total: allJobs.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      totalRevenue: 0,
      averageJobValue: 0,
      completionRate: 0,
      averageRating: 0,
    };

    let completedJobs = 0;
    let totalRating = 0;
    let ratedJobs = 0;

    allJobs.forEach(job => {
      // Status counts
      stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;
      
      // Priority counts
      stats.byPriority[job.priority] = (stats.byPriority[job.priority] || 0) + 1;
      
      // Revenue calculation
      if (job.finalPrice) {
        stats.totalRevenue += job.finalPrice;
      }
      
      // Completion tracking
      if (job.status === 'completed') {
        completedJobs++;
      }
      
      // Rating calculation
      if (job.customerRating) {
        totalRating += job.customerRating;
        ratedJobs++;
      }
    });

    stats.averageJobValue = allJobs.length > 0 ? stats.totalRevenue / allJobs.length : 0;
    stats.completionRate = allJobs.length > 0 ? (completedJobs / allJobs.length) * 100 : 0;
    stats.averageRating = ratedJobs > 0 ? totalRating / ratedJobs : 0;

    return stats;
  }

  /**
   * Search jobs with advanced filters
   */
  static async searchJobs(filters: {
    searchTerm?: string;
    status?: string;
    priority?: string;
    clientId?: string;
    assignedTechnician?: string;
    assignedSalesRep?: string;
    startDate?: Date;
    endDate?: Date;
    minValue?: number;
    maxValue?: number;
  }): Promise<Job[]> {
    let jobs = await jobServiceExtended.getAll();

    // Apply filters
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      jobs = jobs.filter(job => 
        job.jobNumber.toLowerCase().includes(term) ||
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term)
      );
    }

    if (filters.status) {
      jobs = jobs.filter(job => job.status === filters.status);
    }

    if (filters.priority) {
      jobs = jobs.filter(job => job.priority === filters.priority);
    }

    if (filters.clientId) {
      jobs = jobs.filter(job => job.clientId === filters.clientId);
    }

    if (filters.assignedTechnician) {
      jobs = jobs.filter(job => job.assignedTechnician === filters.assignedTechnician);
    }

    if (filters.assignedSalesRep) {
      jobs = jobs.filter(job => job.assignedSalesRep === filters.assignedSalesRep);
    }

    if (filters.startDate && filters.endDate) {
      jobs = jobs.filter(job => 
        job.scheduledDate && 
        job.scheduledDate >= filters.startDate! && 
        job.scheduledDate <= filters.endDate!
      );
    }

    if (filters.minValue !== undefined) {
      jobs = jobs.filter(job => 
        (job.finalPrice && job.finalPrice >= filters.minValue!) ||
        (job.quotedPrice && job.quotedPrice >= filters.minValue!)
      );
    }

    if (filters.maxValue !== undefined) {
      jobs = jobs.filter(job => 
        (job.finalPrice && job.finalPrice <= filters.maxValue!) ||
        (job.quotedPrice && job.quotedPrice <= filters.maxValue!)
      );
    }

    return jobs;
  }

  /**
   * Validate job data
   */
  static validateJobData(jobData: Partial<Job>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Title validation
    if (jobData.title && jobData.title.trim().length < 5) {
      errors.push('Job title must be at least 5 characters');
    }

    // Description validation
    if (jobData.description && jobData.description.trim().length < 10) {
      errors.push('Job description must be at least 10 characters');
    }

    // System size validation
    if (jobData.systemSize && jobData.systemSize <= 0) {
      errors.push('System size must be greater than 0');
    }

    // Panel count validation
    if (jobData.panelCount && jobData.panelCount <= 0) {
      errors.push('Panel count must be greater than 0');
    }

    // Pricing validation
    if (jobData.estimatedCost && jobData.estimatedCost < 0) {
      errors.push('Estimated cost cannot be negative');
    }

    if (jobData.actualCost && jobData.actualCost < 0) {
      errors.push('Actual cost cannot be negative');
    }

    if (jobData.quotedPrice && jobData.quotedPrice < 0) {
      errors.push('Quoted price cannot be negative');
    }

    if (jobData.finalPrice && jobData.finalPrice < 0) {
      errors.push('Final price cannot be negative');
    }

    // Date validation
    if (jobData.scheduledDate && jobData.scheduledDate < new Date()) {
      errors.push('Scheduled date cannot be in the past');
    }

    if (jobData.actualStartDate && jobData.actualEndDate && 
        jobData.actualStartDate > jobData.actualEndDate) {
      errors.push('Start date cannot be after end date');
    }

    // Rating validation
    if (jobData.customerRating && (jobData.customerRating < 1 || jobData.customerRating > 5)) {
      errors.push('Customer rating must be between 1 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check user permissions for job operations
   */
  static canManageJob(
    userRole: UserRole, 
    jobAssignedTechnician?: string, 
    jobAssignedSalesRep?: string, 
    userId?: string
  ): boolean {
    // Owners and admins can manage all jobs
    if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
      return true;
    }

    // Sales reps can manage jobs they're assigned to
    if (userRole === UserRole.SALES_REP) {
      return !jobAssignedSalesRep || jobAssignedSalesRep === userId;
    }

    // Technicians can manage jobs they're assigned to
    if (userRole === UserRole.TECHNICIAN) {
      return !jobAssignedTechnician || jobAssignedTechnician === userId;
    }

    // Guests cannot manage jobs
    return false;
  }

  /**
   * Update client revenue based on completed jobs
   */
  private static async updateClientRevenue(clientId: string): Promise<void> {
    const clientJobs = await jobServiceExtended.getByClientId(clientId);
    const completedJobs = clientJobs.filter(job => job.status === 'completed');
    const totalRevenue = completedJobs.reduce((sum, job) => sum + (job.finalPrice || 0), 0);

    await clientServiceExtended.update(clientId, {
      totalRevenue,
      totalJobs: clientJobs.length,
    });
  }

  /**
   * Get job activity history
   */
  static async getJobActivity(jobId: string): Promise<any[]> {
    return activityLogServiceExtended.getByResourceId(jobId, 'job');
  }
}

// Export utility functions
export const createJob = JobManager.createJob.bind(JobManager);
export const updateJob = JobManager.updateJob.bind(JobManager);
export const updateJobStatus = JobManager.updateJobStatus.bind(JobManager);
export const assignTechnician = JobManager.assignTechnician.bind(JobManager);
export const scheduleJob = JobManager.scheduleJob.bind(JobManager);
export const addFieldWork = JobManager.addFieldWork.bind(JobManager);
export const updateJobPricing = JobManager.updateJobPricing.bind(JobManager);
export const recordCustomerFeedback = JobManager.recordCustomerFeedback.bind(JobManager);
export const getJobsByDateRange = JobManager.getJobsByDateRange.bind(JobManager);
export const getTechnicianWorkload = JobManager.getTechnicianWorkload.bind(JobManager);
export const getJobStats = JobManager.getJobStats.bind(JobManager);
export const searchJobs = JobManager.searchJobs.bind(JobManager);
export const validateJobData = JobManager.validateJobData.bind(JobManager);
export const canManageJob = JobManager.canManageJob.bind(JobManager);
export const getJobActivity = JobManager.getJobActivity.bind(JobManager);