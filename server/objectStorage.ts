import { Response } from "express";
import { randomUUID } from "crypto";
import * as fs from 'fs';
import * as path from 'path';

// Simple file storage solution
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// Simple object storage service using local filesystem
export class ObjectStorageService {
  constructor() {}

  // Upload a file to local storage
  async uploadFile(fileName: string, data: Buffer | string): Promise<string> {
    try {
      const objectName = `uploads/${randomUUID()}-${fileName}`;
      const fullPath = path.join(UPLOADS_DIR, objectName.replace('uploads/', ''));

      if (typeof data === 'string') {
        fs.writeFileSync(fullPath, data, 'utf8');
      } else {
        fs.writeFileSync(fullPath, data);
      }

      return objectName;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  // Generate upload URL for client-side uploads
  async getObjectEntityUploadURL(baseURL?: string): Promise<string> {
    try {
      // Generate a unique object name for the upload
      const objectId = randomUUID();

      // Build absolute URL for client-side uploads
      if (baseURL) {
        return `${baseURL}/api/objects/direct-upload/${objectId}`;
      }
      
      // Return the direct upload endpoint
      return `/api/objects/direct-upload/${objectId}`;
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw error;
    }
  }

  async handleDirectUpload(objectId: string, fileBuffer: Buffer, originalFilename: string): Promise<string> {
    try {
      // Create a safe filename with proper sanitization
      const extension = originalFilename.split('.').pop() || '';
      const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, "");
      const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-]/g, '_');
      const objectName = `${objectId}-${safeName}.${extension}`;

      console.log(`Creating object name: ${objectName} from original: ${originalFilename}`);

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Created uploads directory: ${uploadsDir}`);
      }

      // Write file to uploads directory
      const filePath = path.join(uploadsDir, objectName);
      console.log(`Writing file to: ${filePath}, size: ${fileBuffer.length} bytes`);

      fs.writeFileSync(filePath, fileBuffer);
      console.log(`File saved successfully: ${objectName}, size: ${fileBuffer.length} bytes`);

      // Verify file was written
      if (!fs.existsSync(filePath)) {
        throw new Error(`File was not created at ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      console.log(`File verified: ${objectName}, actual size: ${stats.size} bytes`);

      return objectName;
    } catch (error) {
      console.error('Error in handleDirectUpload:', error);
      throw new Error(`Failed to save uploaded file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Download a file from local storage
  async downloadObject(objectName: string, res: Response): Promise<void> {
    try {
      // Handle different object name formats
      let fileName = objectName;
      
      // Remove 'uploads/' prefix if present
      if (fileName.startsWith('uploads/')) {
        fileName = fileName.replace('uploads/', '');
      }
      
      // If we have just an object ID, find the actual file in uploads directory
      if (!fileName.includes('-') || !fileName.includes('.')) {
        // This is likely just an object ID, find the actual file
        const files = fs.readdirSync(UPLOADS_DIR);
        const matchingFile = files.find(file => file.startsWith(fileName));
        
        if (matchingFile) {
          fileName = matchingFile;
        } else {
          console.error(`No file found for object ID: ${fileName}`);
          console.error(`Available files: ${files.join(', ')}`);
          throw new ObjectNotFoundError();
        }
      }

      const fullPath = path.join(UPLOADS_DIR, fileName);
      console.log(`Attempting to serve file: ${fullPath}`);

      if (!fs.existsSync(fullPath)) {
        console.error(`File not found at path: ${fullPath}`);
        throw new ObjectNotFoundError();
      }

      const data = fs.readFileSync(fullPath);
      
      // Set appropriate content type based on file extension
      const ext = path.extname(fileName).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };
      
      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.send(data);
      
      console.log(`Successfully served file: ${fileName}, type: ${contentType}`);
    } catch (error) {
      console.error("Error downloading object:", error);
      throw new ObjectNotFoundError();
    }
  }

  // Get a file as bytes
  async getObjectBytes(objectName: string): Promise<Uint8Array> {
    try {
      // Handle different object name formats
      let fileName = objectName;
      
      // Remove 'uploads/' prefix if present
      if (fileName.startsWith('uploads/')) {
        fileName = fileName.replace('uploads/', '');
      }
      
      // If we have just an object ID, find the actual file in uploads directory
      if (!fileName.includes('-') || !fileName.includes('.')) {
        // This is likely just an object ID, find the actual file
        const files = fs.readdirSync(UPLOADS_DIR);
        const matchingFile = files.find(file => file.startsWith(fileName));
        
        if (matchingFile) {
          fileName = matchingFile;
        } else {
          console.error(`No file found for object ID: ${fileName}`);
          throw new ObjectNotFoundError();
        }
      }

      const fullPath = path.join(UPLOADS_DIR, fileName);

      if (!fs.existsSync(fullPath)) {
        throw new ObjectNotFoundError();
      }

      const data = fs.readFileSync(fullPath);
      return new Uint8Array(data);
    } catch (error) {
      console.error("Error getting object bytes:", error);
      throw new ObjectNotFoundError();
    }
  }

  // Delete a file from local storage
  async deleteObject(objectName: string): Promise<void> {
    try {
      const fileName = objectName.replace('uploads/', '');
      const fullPath = path.join(UPLOADS_DIR, fileName);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error("Error deleting object:", error);
      throw error;
    }
  }

  // List objects in storage
  async listObjects(): Promise<string[]> {
    try {
      const files = fs.readdirSync(UPLOADS_DIR);
      return files.map(file => `uploads/${file}`);
    } catch (error) {
      console.error("Error listing objects:", error);
      return [];
    }
  }

  // Normalize object path for public access
  normalizeObjectEntityPath(path: string): string {
    // Handle upload URLs by converting them to serving URLs
    if (path.includes('/api/objects/direct-upload/')) {
      const objectId = path.split('/api/objects/direct-upload/')[1];
      return `/objects/${objectId}`;
    }
    
    // Handle full URLs by extracting the path
    if (path.startsWith('http')) {
      try {
        const url = new URL(path);
        if (url.pathname.startsWith('/objects/')) {
          return url.pathname;
        }
        if (url.pathname.includes('/api/objects/direct-upload/')) {
          const objectId = url.pathname.split('/api/objects/direct-upload/')[1];
          return `/objects/${objectId}`;
        }
      } catch (e) {
        // Fall through to other logic
      }
    }
    
    // Handle normal object URLs
    if (path.startsWith('/objects/')) {
      return path;
    }
    
    // Handle relative paths - prepend /objects/ if needed
    const cleanPath = path.replace(/^\/+/, '');
    if (!cleanPath.startsWith('objects/')) {
      return `/objects/${cleanPath}`;
    }
    
    return `/${cleanPath}`;
  }

  // Get object entity file (for backwards compatibility)
  async getObjectEntityFile(path: string): Promise<{ name: string; data: Uint8Array }> {
    try {
      // Extract object name from path
      let objectName = path;
      if (objectName.startsWith('/objects/')) {
        objectName = objectName.replace('/objects/', '');
      }
      
      const data = await this.getObjectBytes(objectName);
      return {
        name: objectName,
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