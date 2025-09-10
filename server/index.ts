import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeStoreData } from "./store-setup";
import { initializeSiteConfig } from "./site-config-setup";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Initialize store data and site configuration on startup
  await initializeStoreData();
  await initializeSiteConfig();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // Enhanced file serving for uploaded objects
  const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
  
  // 1) Static serving first (fast path)
  app.use('/objects', express.static(UPLOADS_DIR, {
    dotfiles: 'allow',
    index: false,
    setHeaders: (res, filePath) => {
      // Detect content type for images and other files
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
      
      if (contentTypes[ext]) {
        res.setHeader('Content-Type', contentTypes[ext]);
      } else if (!ext) {
        // For files without extension, try to detect if it's an image
        try {
          const buffer = fs.readFileSync(filePath);
          if (buffer.length > 4) {
            const header = buffer.toString('hex', 0, 4);
            if (header.startsWith('ffd8ff')) {
              res.setHeader('Content-Type', 'image/jpeg');
            } else if (header.startsWith('89504e47')) {
              res.setHeader('Content-Type', 'image/png');
            } else if (header.startsWith('47494638')) {
              res.setHeader('Content-Type', 'image/gif');
            }
          }
        } catch (e) {
          // Fallback to octet-stream
          res.setHeader('Content-Type', 'application/octet-stream');
        }
      }
      
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

  // 2) Fallback route for files that need prefix matching
  app.get('/objects/:name', (req, res) => {
    const name = req.params.name;
    const candidatePath = path.join(UPLOADS_DIR, name);

    // If exact file exists, serve it
    if (fs.existsSync(candidatePath)) {
      const ext = path.extname(candidatePath).toLowerCase();
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
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.sendFile(candidatePath);
    }

    // Try to find file by prefix (for cases where filename format varies)
    try {
      const idPrefix = name.split(/[\.-]/)[0];
      const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith(idPrefix));
      
      if (files.length > 0) {
        const filePath = path.join(UPLOADS_DIR, files[0]);
        const ext = path.extname(files[0]).toLowerCase();
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
        
        let contentType = contentTypes[ext] || 'application/octet-stream';
        
        // If no extension, try to detect from file content
        if (!ext) {
          try {
            const buffer = fs.readFileSync(filePath);
            if (buffer.length > 4) {
              const header = buffer.toString('hex', 0, 4);
              if (header.startsWith('ffd8ff')) {
                contentType = 'image/jpeg';
              } else if (header.startsWith('89504e47')) {
                contentType = 'image/png';
              } else if (header.startsWith('47494638')) {
                contentType = 'image/gif';
              }
            }
          } catch (e) {
            // Keep default octet-stream
          }
        }
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.sendFile(filePath);
      }
    } catch (e) {
      console.error('Error searching for file:', e);
    }

    return res.status(404).send('File not found');
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // This allows multiple projects to run on different ports
  // Default to 5000 only if PORT is not specified
  console.log('ENV PORT:', process.env.PORT);
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();