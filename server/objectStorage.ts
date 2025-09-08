import { Client } from "@replit/object-storage";
import { Response } from "express";
import { randomUUID } from "crypto";

// Initialize the Replit Object Storage client
const client = new Client();

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// The object storage service using official Replit SDK
export class ObjectStorageService {
  private client: Client;

  constructor() {
    this.client = client;
  }

  // Upload a file to object storage
  async uploadFile(fileName: string, data: Buffer | string): Promise<string> {
    try {
      const objectName = `uploads/${randomUUID()}-${fileName}`;
      
      if (typeof data === 'string') {
        await this.client.uploadFromText(objectName, data);
      } else {
        await this.client.uploadFromBytes(objectName, data);
      }
      
      return objectName;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  // Generate upload URL for client-side uploads
  async getObjectEntityUploadURL(): Promise<string> {
    try {
      // Generate a unique object name for the upload
      const objectId = randomUUID();
      const objectName = `uploads/${objectId}`;
      
      // For client-side uploads, we'll return a special URL that the client can use
      // The actual upload will be handled through our API endpoint
      return `/api/objects/direct-upload/${objectId}`;
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw error;
    }
  }

  // Handle direct upload from the frontend
  async handleDirectUpload(objectId: string, fileBuffer: Buffer, originalName: string): Promise<string> {
    try {
      const objectName = `uploads/${objectId}-${originalName}`;
      await this.client.uploadFromBytes(objectName, fileBuffer);
      return objectName;
    } catch (error) {
      console.error("Error in direct upload:", error);
      throw error;
    }
  }

  // Download a file from object storage
  async downloadObject(objectName: string, res: Response): Promise<void> {
    try {
      const result = await this.client.downloadAsBytes(objectName);
      if ('isOk' in result && result.isOk && result.value) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(result.value[0]);
      } else {
        throw new ObjectNotFoundError();
      }
    } catch (error) {
      console.error("Error downloading object:", error);
      throw new ObjectNotFoundError();
    }
  }

  // Get a file as bytes
  async getObjectBytes(objectName: string): Promise<Uint8Array> {
    try {
      const result = await this.client.downloadAsBytes(objectName);
      if ('isOk' in result && result.isOk && result.value) {
        return new Uint8Array(result.value[0]);
      }
      throw new ObjectNotFoundError();
    } catch (error) {
      console.error("Error getting object bytes:", error);
      throw new ObjectNotFoundError();
    }
  }

  // Delete a file from object storage
  async deleteObject(objectName: string): Promise<void> {
    try {
      await this.client.delete(objectName);
    } catch (error) {
      console.error("Error deleting object:", error);
      throw error;
    }
  }

  // List objects in storage
  async listObjects(): Promise<string[]> {
    try {
      const result = await this.client.list();
      if ('isOk' in result && result.isOk && result.value) {
        return result.value.map(obj => obj.name);
      }
      return [];
    } catch (error) {
      console.error("Error listing objects:", error);
      return [];
    }
  }

  // Normalize object path for public access
  normalizeObjectEntityPath(path: string): string {
    // Remove any leading slashes and return clean path
    return path.replace(/^\/+/, '');
  }

  // Get object entity file (for backwards compatibility)
  async getObjectEntityFile(path: string): Promise<{ name: string; data: Uint8Array }> {
    const cleanPath = this.normalizeObjectEntityPath(path.replace('/objects/', ''));
    try {
      const data = await this.getObjectBytes(cleanPath);
      return {
        name: cleanPath,
        data
      };
    } catch (error) {
      throw new ObjectNotFoundError();
    }
  }

  // Search for public object (simplified version)
  async searchPublicObject(filePath: string): Promise<{ name: string; data: Uint8Array } | null> {
    try {
      const data = await this.getObjectBytes(filePath);
      return {
        name: filePath,
        data
      };
    } catch (error) {
      return null;
    }
  }
}

// Export a default instance
export const objectStorageService = new ObjectStorageService();