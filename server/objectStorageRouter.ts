
import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const router = express.Router();


// Debug endpoint to check uploaded files
router.get("/api/objects/debug", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime,
        url: `/objects/${file}`,
        exists: fs.existsSync(filePath)
      };
    });

    res.json({
      uploadsDir,
      totalFiles: files.length,
      files: fileDetails.slice(0, 20), // Show only first 20 files
      recentFiles: fileDetails
        .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
        .slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error reading uploads directory",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});


// Carpeta donde se almacenan archivos públicamente
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadsDir);
}

// Middleware para parsear JSON
router.use(express.json());

// POST /api/objects/upload
// Recibe { filename } y devuelve uploadURL + url pública
router.post("/api/objects/upload", (req, res) => {
  try {
    const { filename } = (req.body || {}) as { filename?: string };
    
    // Extraer extensión y validar que sea imagen
    const ext = filename ? path.extname(String(filename)).toLowerCase() : '';
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    
    let finalExt = ext;
    if (!allowedExts.includes(ext)) {
      finalExt = '.jpg'; // Default para imágenes
    }
    
    // Generar nombre único conservando extensión
    const objectName = `${uuidv4()}-${Date.now()}${finalExt}`;
    
    // URL relativa pública
    const relativeUrl = `/objects/${objectName}`;
    
    // Generar URL absoluta - forzar HTTPS en Replit
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get("host");
    const secureProtocol = protocol === 'https' || host?.includes('replit.dev') ? 'https' : protocol;
    const uploadURL = `${secureProtocol}://${host}${relativeUrl}`;

    console.log(`✅ Generated upload params: objectName=${objectName}, uploadURL=${uploadURL}`);

    return res.json({
      success: true,
      objectName,
      url: relativeUrl,
      uploadURL,
      location: relativeUrl,
    });
  } catch (err) {
    console.error("Error generating upload params:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// PUT /objects/:name  <- Uppy hará PUT directo aquí
router.put("/objects/:name", async (req, res) => {
  const name = req.params.name;
  
  // Seguridad: rechazar rutas maliciosas
  if (name.includes("..") || path.isAbsolute(name)) {
    return res.status(400).json({ success: false, error: "Invalid name" });
  }

  try {
    // Detectar extensión del Content-Type si no está en el nombre
    let finalName = name;
    if (!path.extname(name)) {
      const contentType = req.headers['content-type'] || '';
      let extension = '';
      
      if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
        extension = '.jpg';
      } else if (contentType.includes('image/png')) {
        extension = '.png';
      } else if (contentType.includes('image/gif')) {
        extension = '.gif';
      } else if (contentType.includes('image/webp')) {
        extension = '.webp';
      } else if (contentType.includes('image/avif')) {
        extension = '.avif';
      } else {
        extension = '.jpg'; // Default
      }
      
      finalName = `${name}${extension}`;
    }

    const tempPath = path.join(uploadsDir, `temp-${finalName}`);
    const finalPath = path.join(uploadsDir, finalName);
    
    console.log(`📁 Receiving PUT for object: ${name} → saving as: ${finalName}`);

    // Escribir archivo temporal
    const writeStream = fs.createWriteStream(tempPath);
    req.pipe(writeStream);

    req.on("end", async () => {
      try {
        // Validar que es una imagen válida y procesarla con Sharp
        const imageInfo = await sharp(tempPath).metadata();
        console.log(`📸 Image metadata:`, {
          format: imageInfo.format,
          width: imageInfo.width,
          height: imageInfo.height,
          size: imageInfo.size
        });

        // Procesar imagen: redimensionar si es muy grande, optimizar
        let processedBuffer;
        
        if (imageInfo.width && imageInfo.width > 1920) {
          // Redimensionar imágenes muy grandes
          processedBuffer = await sharp(tempPath)
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        } else {
          // Solo optimizar sin redimensionar
          if (imageInfo.format === 'jpeg' || imageInfo.format === 'jpg') {
            processedBuffer = await sharp(tempPath)
              .jpeg({ quality: 85 })
              .toBuffer();
          } else if (imageInfo.format === 'png') {
            processedBuffer = await sharp(tempPath)
              .png({ compressionLevel: 6 })
              .toBuffer();
          } else {
            // Para otros formatos, mantener original
            processedBuffer = fs.readFileSync(tempPath);
          }
        }

        // Guardar imagen procesada
        fs.writeFileSync(finalPath, processedBuffer);
        
        // Limpiar archivo temporal
        fs.unlinkSync(tempPath);

        console.log(`✅ Image processed and saved: ${finalName}, size: ${processedBuffer.length} bytes`);

        return res.status(200).json({
          success: true,
          objectName: finalName,
          url: `/objects/${finalName}`,
          location: `/objects/${finalName}`,
        });

      } catch (imageError) {
        console.error("Error processing image:", imageError);
        
        // Si falla el procesamiento, usar archivo original
        try {
          fs.renameSync(tempPath, finalPath);
          console.log(`⚠️ Image processing failed, saved original: ${finalName}`);
          
          return res.status(200).json({
            success: true,
            objectName: finalName,
            url: `/objects/${finalName}`,
            location: `/objects/${finalName}`,
          });
        } catch (fallbackError) {
          console.error("Fallback save failed:", fallbackError);
          return res.status(500).json({ success: false, error: "Failed to save image" });
        }
      }
    });

    req.on("error", (err) => {
      console.error("PUT request error:", err);
      // Limpiar archivo temporal si existe
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      return res.status(500).json({ success: false, error: "Upload failed" });
    });

    writeStream.on("error", (err) => {
      console.error("Write stream error:", err);
      return res.status(500).json({ success: false, error: "Write failed" });
    });

  } catch (error) {
    console.error("PUT handler error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/objects/direct-upload/upload - Direct file upload for Uppy
router.post("/api/objects/direct-upload/upload", (req, res) => {
  try {
    console.log('📸 Direct upload endpoint called');
    
    let body: Buffer[] = [];
    let totalSize = 0;
    const maxSize = 10 * 1024 * 1024; // 10MB

    req.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > maxSize) {
        return res.status(413).json({ success: false, error: 'File too large' });
      }
      body.push(chunk);
    });

    req.on('end', async () => {
      try {
        const fileBuffer = Buffer.concat(body);
        console.log(`📁 Received file: ${fileBuffer.length} bytes`);

        // Get original filename from headers
        const originalFilename = req.headers['x-filename'] || req.headers['x-original-filename'] || 'upload.jpg';
        console.log(`📝 Original filename: ${originalFilename}`);

        // Generate unique filename
        const ext = path.extname(String(originalFilename)).toLowerCase() || '.jpg';
        const uniqueName = `${uuidv4()}-${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, uniqueName);

        // Process image with Sharp if it's an image
        let processedBuffer = fileBuffer;
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext)) {
          try {
            // Validate that it's actually an image by reading metadata
            const imageInfo = await sharp(fileBuffer).metadata();
            console.log(`📸 Image metadata:`, {
              format: imageInfo.format,
              width: imageInfo.width,
              height: imageInfo.height,
              size: imageInfo.size
            });

            // Only process if Sharp can read the image
            if (imageInfo.format) {
              // Resize if too large and optimize based on format
              if (imageInfo.width && imageInfo.width > 1920) {
                if (imageInfo.format === 'jpeg' || imageInfo.format === 'jpg') {
                  processedBuffer = await sharp(fileBuffer)
                    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toBuffer();
                } else if (imageInfo.format === 'png') {
                  processedBuffer = await sharp(fileBuffer)
                    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                    .png({ compressionLevel: 6 })
                    .toBuffer();
                } else {
                  // For other formats, just resize without changing format
                  processedBuffer = await sharp(fileBuffer)
                    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                    .toBuffer();
                }
              } else {
                // Just optimize without resizing
                if (imageInfo.format === 'jpeg' || imageInfo.format === 'jpg') {
                  processedBuffer = await sharp(fileBuffer)
                    .jpeg({ quality: 85 })
                    .toBuffer();
                } else if (imageInfo.format === 'png') {
                  processedBuffer = await sharp(fileBuffer)
                    .png({ compressionLevel: 6 })
                    .toBuffer();
                } else {
                  processedBuffer = fileBuffer; // Keep original for other formats
                }
              }
              console.log(`✅ Image processed successfully, size: ${processedBuffer.length} bytes`);
            } else {
              console.log('⚠️ No valid image format detected, using original file');
              processedBuffer = fileBuffer;
            }
          } catch (sharpError) {
            console.log('⚠️ Sharp processing failed, using original file:', sharpError.message);
            processedBuffer = fileBuffer;
          }
        } else {
          console.log(`📄 Non-image file detected: ${ext}, using original`);
        }

        // Save file
        fs.writeFileSync(filePath, processedBuffer);
        console.log(`✅ File saved: ${uniqueName}, size: ${processedBuffer.length} bytes`);

        // Generate URLs
        const protocol = req.get('x-forwarded-proto') || req.protocol;
        const host = req.get("host");
        const secureProtocol = protocol === 'https' || host?.includes('replit.dev') ? 'https' : protocol;
        const publicUrl = `/objects/${uniqueName}`;
        const fullUrl = `${secureProtocol}://${host}${publicUrl}`;

        return res.status(200).json({
          success: true,
          url: publicUrl,
          location: publicUrl,
          uploadURL: fullUrl,
          objectName: uniqueName
        });

      } catch (error) {
        console.error('❌ Upload processing error:', error);
        return res.status(500).json({ success: false, error: 'Upload failed' });
      }
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      return res.status(500).json({ success: false, error: 'Request failed' });
    });

  } catch (error) {
    console.error('❌ Direct upload error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Servir archivos: /objects/<objectName> -> uploads/<objectName>
router.use("/objects", express.static(uploadsDir, { 
  dotfiles: "deny", 
  index: false,
  maxAge: '1d', // Cache por 1 día
  fallthrough: false, // Don't fall through if file not found
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    console.log(`🎯 Serving static file: ${path.basename(filePath)} with extension: ${ext}`);
    
    const contentTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    console.log(`📋 Setting Content-Type: ${contentType}`);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Add proper headers for images
    if (contentType.startsWith('image/')) {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Fallback handler for files not found by static middleware
router.get("/objects/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  console.log(`🔍 Fallback handler: Looking for file ${filename} at ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    console.log(`📁 Available files in uploads:`, fs.readdirSync(uploadsDir).slice(0, 10).join(', '));
    return res.status(404).json({ 
      success: false, 
      error: 'File not found',
      filename,
      availableFiles: fs.readdirSync(uploadsDir).length
    });
  }

  try {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
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
    
    console.log(`✅ Serving file via fallback: ${filename}, size: ${stats.size}, type: ${contentType}`);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    
  } catch (error) {
    console.error(`❌ Error serving file ${filename}:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Error serving file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
