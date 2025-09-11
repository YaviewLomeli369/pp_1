import { DatabaseStorage } from "./database-storage";
import { eq, and, asc } from "drizzle-orm";
import { inventoryMovements, cartItems, pageContents, type PageContent, type InsertPageContent, type VisualCustomization, type InsertVisualCustomization, schema } from "./schema"; // Assuming schema is correctly imported
import { db } from "./db"; // Assuming db connection is correctly imported

// Simple memory storage implementation
class MemoryStorage {
  private data: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    return this.data.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}

let storageInstance: DatabaseStorage | MemoryStorage | null = null;

export function initializeStorage(): DatabaseStorage | MemoryStorage {
  if (storageInstance) {
    return storageInstance;
  }

  const storageType = process.env.STORAGE_TYPE || 'memory';

  if (storageType === 'database') {
    try {
      // Test database connection first
      storageInstance = new DatabaseStorage();
      console.log("✅ Database storage initialized successfully");
    } catch (error) {
      console.warn("⚠️  Database connection failed, falling back to memory storage");
      console.warn("Error:", error instanceof Error ? error.message : error);
      storageInstance = new MemoryStorage();
    }
  } else {
    storageInstance = new MemoryStorage();
    console.log("✅ Memory storage initialized successfully");
  }

  return storageInstance;
}

export { DatabaseStorage, MemoryStorage };
export { storage, type IStorage } from "./database-storage";

// Mocking DatabaseStorage to include the new methods for demonstration purposes
class MockDatabaseStorage implements IStorage {
  // Visual customizations
  async getVisualCustomizations(pageId: string): Promise<VisualCustomization[]> {
    if (!db) return [];
    return await db.select().from(schema.visualCustomizations)
      .where(eq(schema.visualCustomizations.pageId, pageId));
  },

  async saveVisualCustomization(data: Partial<InsertVisualCustomization>): Promise<VisualCustomization | null> {
    if (!db) return null;
    const [customization] = await db.insert(schema.visualCustomizations)
      .values(data as InsertVisualCustomization)
      .returning();
    return customization;
  },

  async updateVisualCustomization(id: string, data: Partial<InsertVisualCustomization>): Promise<VisualCustomization | null> {
    if (!db) return null;
    const [customization] = await db.update(schema.visualCustomizations)
      .set(data)
      .where(eq(schema.visualCustomizations.id, id))
      .returning();
    return customization;
  },

  async deleteVisualCustomization(id: string): Promise<boolean> {
    if (!db) return false;
    const result = await db.delete(schema.visualCustomizations)
      .where(eq(schema.visualCustomizations.id, id));
    return result.rowCount > 0;
  },

  // Page Contents
  async getAllPageContents(): Promise<PageContent[]> {
    if (!db) return [];
    return await db.select().from(schema.pageContents)
      .orderBy(asc(schema.pageContents.pageId), asc(schema.pageContents.order));
  },

  async getPageContents(pageId: string): Promise<PageContent[]> {
    if (!db) return [];
    return await db.select().from(schema.pageContents)
      .where(and(
        eq(schema.pageContents.pageId, pageId),
        eq(schema.pageContents.isActive, true)
      ))
      .orderBy(asc(schema.pageContents.order));
  },

  async getPageContent(id: string): Promise<PageContent | null> {
    if (!db) return null;
    const [content] = await db.select().from(schema.pageContents)
      .where(eq(schema.pageContents.id, id));
    return content || null;
  },

  async createPageContent(data: InsertPageContent): Promise<PageContent> {
    if (!db) throw new Error("Database not available");
    const [content] = await db.insert(schema.pageContents)
      .values(data)
      .returning();
    return content;
  },

  async updatePageContent(id: string, data: Partial<PageContent>): Promise<PageContent | null> {
    if (!db) return null;
    const [content] = await db.update(schema.pageContents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.pageContents.id, id))
      .returning();
    return content;
  },

  async deletePageContent(id: string): Promise<boolean> {
    if (!db) return false;
    const result = await db.delete(schema.pageContents)
      .where(eq(schema.pageContents.id, id));
    return result.rowCount > 0;
  },

  // Existing methods from DatabaseStorage (assuming they are present and need to be kept)
  async getInventoryMovements(): Promise<any[]> {
    if (!db) return [];
    return await db.select().from(inventoryMovements);
  },
  async addInventoryMovement(data: any): Promise<any> {
    if (!db) throw new Error("Database not available");
    const [movement] = await db.insert(inventoryMovements).values(data).returning();
    return movement;
  },
  async updateInventoryMovement(id: string, data: any): Promise<any | null> {
    if (!db) return null;
    const [movement] = await db.update(inventoryMovements).set(data).where(eq(inventoryMovements.id, id)).returning();
    return movement;
  },
  async deleteInventoryMovement(id: string): Promise<boolean> {
    if (!db) return false;
    const result = await db.delete(inventoryMovements).where(eq(inventoryMovements.id, id));
    return result.rowCount > 0;
  },
  async getCartItems(): Promise<any[]> {
    if (!db) return [];
    return await db.select().from(cartItems);
  },
  async addCartItem(data: any): Promise<any> {
    if (!db) throw new Error("Database not available");
    const [item] = await db.insert(cartItems).values(data).returning();
    return item;
  },
  async updateCartItem(id: string, data: any): Promise<any | null> {
    if (!db) return null;
    const [item] = await db.update(cartItems).set(data).where(eq(cartItems.id, id)).returning();
    return item;
  },
  async deleteCartItem(id: string): Promise<boolean> {
    if (!db) return false;
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  },
  async clearCartItems(): Promise<boolean> {
    if (!db) return false;
    const result = await db.delete(cartItems);
    return result.rowCount > 0;
  }
}

// Re-initialize storageInstance with the MockDatabaseStorage if it's supposed to be the default for testing/demonstration
if (process.env.STORAGE_TYPE === 'database') {
  storageInstance = new MockDatabaseStorage();
}

// Exporting the MockDatabaseStorage as the storage for demonstration purposes if STORAGE_TYPE is not 'database'
// In a real application, you would initialize based on the actual DatabaseStorage or MemoryStorage.
if (!storageInstance) {
  storageInstance = new MockDatabaseStorage(); // Fallback to mock for demonstration if not initialized
}

export const storage: IStorage = storageInstance as DatabaseStorage; // Cast to IStorage assuming DatabaseStorage implements it