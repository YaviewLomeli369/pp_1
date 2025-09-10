
import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Carpeta donde se almacenan archivos públicamente
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// POST /api/objects/upload
// Recibe { filename } y devuelve uploadURL + url pública (con extensión)
router.post("/api/objects/upload", express.json(), (req, res) => {
  try {
    const { filename } = (req.body || {}) as { filename?: string };
    const ext = filename ? path.extname(String(filename)) : "";
    // Generar nombre único conservando extensión si existe
    const objectName = `${uuidv4()}-${Date.now()}${ext}`;
    // URL relativa pública (servida por express.static más abajo)
    const relativeUrl = `/objects/${objectName}`;
    
    // Asegurar protocolo consistente - usar el mismo protocolo del request
    const protocol = req.protocol;
    const host = req.get("host");
    const uploadURL = `${protocol}://${host}${relativeUrl}`;

    console.log(`✅ Generated upload params: objectName=${objectName}, uploadURL=${uploadURL}, protocol=${protocol}`);

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
router.put("/objects/:name", (req, res) => {
  const name = req.params.name;
  
  // Seguridad mínima: rechazar rutas con .. o que intenten escapar
  if (name.includes("..") || path.isAbsolute(name)) {
    return res.status(400).json({ success: false, error: "Invalid name" });
  }

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
      // Default para imágenes
      extension = '.jpg';
    }
    
    finalName = `${name}${extension}`;
  }

  const destPath = path.join(uploadsDir, finalName);
  console.log(`📁 Receiving PUT for object: ${name} → saving as: ${finalName}, destination: ${destPath}`);

  const writeStream = fs.createWriteStream(destPath);
  req.pipe(writeStream);

  req.on("end", () => {
    console.log(`✅ File uploaded successfully: ${name} → ${finalName}`);
    return res.status(200).json({
      success: true,
      objectName: finalName, // Devolver el nombre con extensión
      url: `/objects/${finalName}`,
      location: `/objects/${finalName}`,
    });
  });

  req.on("error", (err) => {
    console.error("PUT write error:", err);
    return res.status(500).json({ success: false, error: "Write failed" });
  });

  writeStream.on("error", (err) => {
    console.error("Write stream error:", err);
    return res.status(500).json({ success: false, error: "Write failed" });
  });
});

// Servir archivos: /objects/<objectName> -> uploads/<objectName>
router.use("/objects", express.static(uploadsDir, { 
  dotfiles: "deny", 
  index: false,
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
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
    
    const contentType = contentTypes[ext];
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

export default router;
