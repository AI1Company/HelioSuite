/**
 * Product Management Utilities for HelioSuite
 * Core business logic for solar equipment and inventory operations
 */

import { Product, UserRole } from '../types/database';
import { productServiceExtended, activityLogServiceExtended, generateProductSKU } from '../services/database';

// Product management class
export class ProductManager {
  /**
   * Create a new product
   */
  static async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sku'>,
    createdBy?: string
  ): Promise<string> {
    // Validate required fields
    if (!productData.name || productData.name.trim().length < 2) {
      throw new Error('Product name must be at least 2 characters');
    }

    if (!productData.category) {
      throw new Error('Product category is required');
    }

    if (productData.sellingPrice < 0) {
      throw new Error('Product price cannot be negative');
    }

    // Generate SKU
    const sku = await generateProductSKU(productData.category);

    // Set default values
    const productToCreate: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      ...productData,
      sku,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      stockQuantity: productData.stockQuantity || 0,
      minimumStock: productData.minimumStock || 10,
    };

    // Create product
    const productId = await productServiceExtended.create(productToCreate, createdBy);

    // Log activity
    if (createdBy) {
      await activityLogServiceExtended.logActivity(
        'other',
        createdBy,
        `Created new product: ${productData.name} (${sku})`,
        {
          targetResourceId: productId,
          targetResourceType: 'product',
          productSku: sku,
          productCategory: productData.category,
          productPrice: productData.sellingPrice,
        }
      );
    }

    return productId;
  }

  /**
   * Update product information
   */
  static async updateProduct(
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'createdAt' | 'sku'>>,
    updatedBy?: string
  ): Promise<void> {
    const existingProduct = await productServiceExtended.getById(productId);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Validate updates
    if (updates.name && updates.name.trim().length < 2) {
      throw new Error('Product name must be at least 2 characters');
    }

    if (updates.sellingPrice !== undefined && updates.sellingPrice < 0) {
      throw new Error('Product price cannot be negative');
    }

    if (updates.stockQuantity !== undefined && updates.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    // Track changes for activity log
    const changes: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      const oldValue = (existingProduct as any)[key];
      const newValue = (updates as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    // Update product
    await productServiceExtended.update(productId, updates, updatedBy);

    // Log activity
    if (updatedBy && Object.keys(changes).length > 0) {
      await activityLogServiceExtended.logActivity(
        'other',
        updatedBy,
        `Updated product: ${existingProduct.name} (${existingProduct.sku})`,
        {
          targetResourceId: productId,
          targetResourceType: 'product',
          changes,
        }
      );
    }
  }

  /**
   * Update product stock
   */
  static async updateStock(
    productId: string,
    quantity: number,
    operation: 'add' | 'subtract' | 'set',
    reason?: string,
    updatedBy?: string
  ): Promise<void> {
    const product = await productServiceExtended.getById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const oldQuantity = product.stockQuantity;
    let newQuantity: number;

    switch (operation) {
      case 'add':
        newQuantity = oldQuantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, oldQuantity - quantity);
        break;
      case 'set':
        newQuantity = Math.max(0, quantity);
        break;
      default:
        throw new Error('Invalid operation. Must be add, subtract, or set');
    }

    await productServiceExtended.update(productId, {
      stockQuantity: newQuantity,
    }, updatedBy);

    // Log activity
    if (updatedBy) {
      await activityLogServiceExtended.logActivity(
        'stock_updated',
        updatedBy,
        `Updated stock for ${product.name}: ${oldQuantity} → ${newQuantity} (${operation} ${quantity})${reason ? ` - ${reason}` : ''}`,
        {
          targetResourceId: productId,
          targetResourceType: 'product',
          oldQuantity,
          newQuantity,
          operation,
          quantityChanged: quantity,
          reason,
        }
      );

      // Alert if stock is low
      if (newQuantity <= (product.minimumStock || 0) && oldQuantity > (product.minimumStock || 0)) {
        await activityLogServiceExtended.logActivity(
          'other',
          'system',
          `Low stock alert: ${product.name} (${product.sku}) - ${newQuantity} remaining`,
          {
            targetResourceId: productId,
            targetResourceType: 'product',
            currentStock: newQuantity,
            threshold: product.minimumStock,
          }
        );
      }
    }
  }

  /**
   * Deactivate/activate product
   */
  static async toggleProductStatus(
    productId: string,
    isActive: boolean,
    updatedBy?: string
  ): Promise<void> {
    const product = await productServiceExtended.getById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    await productServiceExtended.update(productId, {
      isActive,
    }, updatedBy);

    // Log activity
    if (updatedBy) {
      await activityLogServiceExtended.logActivity(
        'other',
        updatedBy,
        `${isActive ? 'Activated' : 'Deactivated'} product: ${product.name} (${product.sku})`,
        {
          targetResourceId: productId,
          targetResourceType: 'product',
          statusChange: isActive ? 'activated' : 'deactivated',
        }
      );
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(category: string): Promise<Product[]> {
    return productServiceExtended.query([
      {
        type: 'where',
        field: 'category',
        operator: '==',
        value: category,
      },
      {
        type: 'orderBy',
        field: 'name',
        direction: 'asc',
      },
    ]);
  }

  /**
   * Get active products only
   */
  static async getActiveProducts(): Promise<Product[]> {
    return productServiceExtended.query([
      {
        type: 'where',
        field: 'isActive',
        operator: '==',
        value: true,
      },
      {
        type: 'orderBy',
        field: 'name',
        direction: 'asc',
      },
    ]);
  }

  /**
   * Get low stock products
   */
  static async getLowStockProducts(): Promise<Product[]> {
    const allProducts = await productServiceExtended.getAll();
    return allProducts.filter(product => 
      product.isActive && (product.stockQuantity || 0) <= (product.minimumStock || 0)
    );
  }

  /**
   * Search products
   */
  static async searchProducts(filters: {
    searchTerm?: string;
    category?: string;
    manufacturer?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    isActive?: boolean;
  }): Promise<Product[]> {
    let products = await productServiceExtended.getAll();

    // Apply filters
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.manufacturer?.toLowerCase().includes(term)
      );
    }

    if (filters.category) {
      products = products.filter(product => product.category === filters.category);
    }

    if (filters.manufacturer) {
      products = products.filter(product => product.manufacturer === filters.manufacturer);
    }

    if (filters.minPrice !== undefined) {
      products = products.filter(product => product.sellingPrice >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      products = products.filter(product => product.sellingPrice <= filters.maxPrice!);
    }

    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        products = products.filter(product => (product.stockQuantity || 0) > 0);
      } else {
        products = products.filter(product => (product.stockQuantity || 0) === 0);
      }
    }

    if (filters.isActive !== undefined) {
      products = products.filter(product => product.isActive === filters.isActive);
    }

    return products;
  }

  /**
   * Get product statistics
   */
  static async getProductStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCategory: Record<string, number>;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    averagePrice: number;
  }> {
    const allProducts = await productServiceExtended.getAll();
    
    const stats = {
      total: allProducts.length,
      active: 0,
      inactive: 0,
      byCategory: {} as Record<string, number>,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
      averagePrice: 0,
    };

    allProducts.forEach(product => {
      // Active/inactive counts
      if (product.isActive) {
        stats.active++;
      } else {
        stats.inactive++;
      }
      
      // Category counts
      stats.byCategory[product.category] = (stats.byCategory[product.category] || 0) + 1;
      
      // Stock status
      const stockQty = product.stockQuantity || 0;
      const minStock = product.minimumStock || 0;
      if (stockQty === 0) {
        stats.outOfStock++;
      } else if (stockQty <= minStock) {
        stats.lowStock++;
      }
      
      // Value calculation
      stats.totalValue += product.sellingPrice * stockQty;
    });

    stats.averagePrice = allProducts.length > 0 ? 
      allProducts.reduce((sum, p) => sum + p.sellingPrice, 0) / allProducts.length : 0;

    return stats;
  }

  /**
   * Get inventory valuation
   */
  static async getInventoryValuation(): Promise<{
    totalValue: number;
    byCategory: Record<string, { quantity: number; value: number }>;
    lowStockValue: number;
  }> {
    const allProducts = await productServiceExtended.getAll();
    
    const valuation = {
      totalValue: 0,
      byCategory: {} as Record<string, { quantity: number; value: number }>,
      lowStockValue: 0,
    };

    allProducts.forEach(product => {
      const stockQty = product.stockQuantity || 0;
      const productValue = product.sellingPrice * stockQty;
      valuation.totalValue += productValue;
      
      // Category breakdown
      if (!valuation.byCategory[product.category]) {
        valuation.byCategory[product.category] = { quantity: 0, value: 0 };
      }
      valuation.byCategory[product.category].quantity += stockQty;
      valuation.byCategory[product.category].value += productValue;
      
      // Low stock value
      if (stockQty <= (product.minimumStock || 0)) {
        valuation.lowStockValue += productValue;
      }
    });

    return valuation;
  }

  /**
   * Generate stock report
   */
  static async generateStockReport(): Promise<{
    summary: {
      totalProducts: number;
      totalValue: number;
      lowStockItems: number;
      outOfStockItems: number;
    };
    categories: Record<string, {
      products: number;
      totalQuantity: number;
      totalValue: number;
      lowStockItems: number;
    }>;
    lowStockProducts: Product[];
    outOfStockProducts: Product[];
  }> {
    const allProducts = await productServiceExtended.getAll();
    const lowStockProducts: Product[] = [];
    const outOfStockProducts: Product[] = [];
    const categories: Record<string, any> = {};
    
    let totalValue = 0;

    allProducts.forEach(product => {
      const stockQty = product.stockQuantity || 0;
      const productValue = product.sellingPrice * stockQty;
      totalValue += productValue;
      
      // Category tracking
      if (!categories[product.category]) {
        categories[product.category] = {
          products: 0,
          totalQuantity: 0,
          totalValue: 0,
          lowStockItems: 0,
        };
      }
      
      categories[product.category].products++;
      categories[product.category].totalQuantity += stockQty;
      categories[product.category].totalValue += productValue;
      
      // Stock status tracking
      if (stockQty === 0) {
        outOfStockProducts.push(product);
      } else if (stockQty <= (product.minimumStock || 0)) {
        lowStockProducts.push(product);
        categories[product.category].lowStockItems++;
      }
    });

    return {
      summary: {
        totalProducts: allProducts.length,
        totalValue,
        lowStockItems: lowStockProducts.length,
        outOfStockItems: outOfStockProducts.length,
      },
      categories,
      lowStockProducts,
      outOfStockProducts,
    };
  }

  /**
   * Validate product data
   */
  static validateProductData(productData: Partial<Product>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Name validation
    if (productData.name && productData.name.trim().length < 2) {
      errors.push('Product name must be at least 2 characters');
    }

    // Category validation
    if (productData.category && !['panels', 'inverters', 'batteries', 'mounting', 'electrical', 'monitoring', 'other'].includes(productData.category)) {
      errors.push('Invalid product category');
    }

    // Price validation
    if (productData.sellingPrice !== undefined && productData.sellingPrice < 0) {
      errors.push('Product price cannot be negative');
    }

    if (productData.costPrice !== undefined && productData.costPrice < 0) {
      errors.push('Product cost price cannot be negative');
    }

    // Stock validation
    if (productData.stockQuantity !== undefined && productData.stockQuantity < 0) {
      errors.push('Stock quantity cannot be negative');
    }

    if (productData.minimumStock !== undefined && productData.minimumStock < 0) {
      errors.push('Minimum stock cannot be negative');
    }

    // Specifications validation
    if (productData.specifications) {
      if (productData.specifications.power !== undefined && productData.specifications.power <= 0) {
        errors.push('Power must be greater than 0');
      }
      
      if (productData.specifications.voltage !== undefined && productData.specifications.voltage <= 0) {
        errors.push('Voltage must be greater than 0');
      }
      
      if (productData.specifications.efficiency !== undefined && 
          (productData.specifications.efficiency < 0 || productData.specifications.efficiency > 100)) {
        errors.push('Efficiency must be between 0 and 100');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check user permissions for product operations
   */
  static canManageProducts(userRole: UserRole): boolean {
    // Owners and admins can manage all products
    return userRole === UserRole.OWNER || userRole === UserRole.ADMIN;
  }

  /**
   * Check if user can view products
   */
  static canViewProducts(userRole: UserRole): boolean {
    // All authenticated users can view products
    return Object.values(UserRole).includes(userRole);
  }

  /**
   * Get product activity history
   */
  static async getProductActivity(productId: string): Promise<any[]> {
    return activityLogServiceExtended.getByResourceId(productId, 'product');
  }

  /**
   * Bulk update products
   */
  static async bulkUpdateProducts(
    productIds: string[],
    updates: Partial<Omit<Product, 'id' | 'createdAt' | 'sku'>>,
    updatedBy?: string
  ): Promise<void> {
    const updatePromises = productIds.map(async (productId) => {
      try {
        await this.updateProduct(productId, updates, updatedBy);
      } catch (error) {
        console.error(`Failed to update product ${productId}:`, error);
      }
    });

    await Promise.all(updatePromises);

    // Log bulk activity
    if (updatedBy) {
      await activityLogServiceExtended.logActivity(
        'other',
        updatedBy,
        `Bulk updated ${productIds.length} products`,
        {
          targetResourceType: 'product',
          productIds,
          updates,
        }
      );
    }
  }
}

// Export utility functions
export const createProduct = ProductManager.createProduct.bind(ProductManager);
export const updateProduct = ProductManager.updateProduct.bind(ProductManager);
export const updateStock = ProductManager.updateStock.bind(ProductManager);
export const toggleProductStatus = ProductManager.toggleProductStatus.bind(ProductManager);
export const getProductsByCategory = ProductManager.getProductsByCategory.bind(ProductManager);
export const getActiveProducts = ProductManager.getActiveProducts.bind(ProductManager);
export const getLowStockProducts = ProductManager.getLowStockProducts.bind(ProductManager);
export const searchProducts = ProductManager.searchProducts.bind(ProductManager);
export const getProductStats = ProductManager.getProductStats.bind(ProductManager);
export const getInventoryValuation = ProductManager.getInventoryValuation.bind(ProductManager);
export const generateStockReport = ProductManager.generateStockReport.bind(ProductManager);
export const validateProductData = ProductManager.validateProductData.bind(ProductManager);
export const canManageProducts = ProductManager.canManageProducts.bind(ProductManager);
export const canViewProducts = ProductManager.canViewProducts.bind(ProductManager);
export const getProductActivity = ProductManager.getProductActivity.bind(ProductManager);
export const bulkUpdateProducts = ProductManager.bulkUpdateProducts.bind(ProductManager);