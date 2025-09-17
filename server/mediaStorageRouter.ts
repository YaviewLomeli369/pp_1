
import express from "express";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import multer from "multer";
import { db } from "./db";
import { mediaFiles } from "@shared/schema";

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload media to database
router.post("/api/media/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file received' });
    }

    const { buffer, originalname, mimetype, size } = req.file;
    const fileId = uuidv4();

    // Process image with Sharp if it's an image
    let processedBuffer = buffer;
    if (mimetype.startsWith('image/')) {
      try {
        const imageInfo = await sharp(buffer).metadata();
        
        // Resize if too large and optimize
        if (imageInfo.width && imageInfo.width > 1920) {
          processedBuffer = await sharp(buffer)
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        } else {
          processedBuffer = await sharp(buffer)
            .jpeg({ quality: 85 })
            .toBuffer();
        }
      } catch (sharpError) {
        console.log('⚠️ Sharp processing failed, using original:', sharpError.message);
        processedBuffer = buffer;
      }
    }

    // Generate URL and object key for database storage
    const url = `/api/media/${fileId}`;
    const objectKey = `media/${fileId}-${originalname}`;

    // Save to database
    const [savedFile] = await db.insert(mediaFiles).values({
      id: fileId,
      filename: `${fileId}-${originalname}`,
      originalName: originalname,
      mimeType: mimetype,
      size: processedBuffer.length,
      url: url,
      objectKey: objectKey,
      data: processedBuffer,
    }).returning();

    console.log(`✅ Media saved to database: ${savedFile.filename}, size: ${processedBuffer.length} bytes`);

    res.json({
      success: true,
      id: savedFile.id,
      url: savedFile.url,
      location: savedFile.url,
      filename: savedFile.filename,
      size: savedFile.size,
      mimeType: savedFile.mimeType
    });

  } catch (error) {
    console.error('❌ Media upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve media from database
router.get("/api/media/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [file] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));

    if (!file) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Set proper headers
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);

    // Send binary data
    res.send(file.data);

  } catch (error) {
    console.error('❌ Error serving media:', error);
    res.status(500).json({ error: 'Failed to serve media' });
  }
});

// Get media metadata
router.get("/api/media/:id/info", async (req, res) => {
  try {
    const { id } = req.params;

    const [file] = await db.select({
      id: mediaFiles.id,
      filename: mediaFiles.filename,
      originalName: mediaFiles.originalName,
      mimeType: mediaFiles.mimeType,
      size: mediaFiles.size,
      alt: mediaFiles.alt,
      description: mediaFiles.description,
      createdAt: mediaFiles.createdAt,
    }).from(mediaFiles).where(eq(mediaFiles.id, id));

    if (!file) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({
      success: true,
      media: file,
      url: `/api/media/${file.id}`
    });

  } catch (error) {
    console.error('❌ Error getting media info:', error);
    res.status(500).json({ error: 'Failed to get media info' });
  }
});

// List all media files
router.get("/api/media", async (req, res) => {
  try {
    const files = await db.select({
      id: mediaFiles.id,
      filename: mediaFiles.filename,
      originalName: mediaFiles.originalName,
      mimeType: mediaFiles.mimeType,
      size: mediaFiles.size,
      alt: mediaFiles.alt,
      description: mediaFiles.description,
      createdAt: mediaFiles.createdAt,
    }).from(mediaFiles).orderBy(mediaFiles.createdAt);

    const filesWithUrls = files.map(file => ({
      ...file,
      url: `/api/media/${file.id}`
    }));

    res.json({
      success: true,
      media: filesWithUrls,
      total: files.length
    });

  } catch (error) {
    console.error('❌ Error listing media:', error);
    res.status(500).json({ error: 'Failed to list media' });
  }
});

// Delete media
router.delete("/api/media/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedFile] = await db.delete(mediaFiles)
      .where(eq(mediaFiles.id, id))
      .returning();

    if (!deletedFile) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({
      success: true,
      message: 'Media deleted successfully',
      deletedFile: {
        id: deletedFile.id,
        filename: deletedFile.filename
      }
    });

  } catch (error) {
    console.error('❌ Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

export default router;
