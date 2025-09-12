import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeStoreData } from "./store-setup";
import { initializeSiteConfig } from "./site-config-setup";
import objectStorageRouter from "./objectStorageRouter";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'self';"
  );
  
  // X-Frame-Options for clickjacking protection
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

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
  // Mount object storage router first
  app.use(objectStorageRouter);

  // Register API routes and get HTTP server
  const httpServer = await registerRoutes(app);

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

  // 1) Serve static files from the uploads folder (with optimized cache headers)
  app.use('/uploads', express.static(UPLOADS_DIR, {
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

      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      
      // Improved cache headers
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for images
      res.setHeader('ETag', `W/"${Date.now()}"`);
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

  // Intelligent object resolution handler
  app.get("/objects/:objectId/:maybeFilename?", async (req, res) => {
    try {
      const { objectId, maybeFilename } = req.params;

      // Read files from uploads directory
      const files = await fs.promises.readdir(UPLOADS_DIR);

      // 1) If no maybeFilename provided, treat objectId as complete name or find by prefix
      if (!maybeFilename) {
        // First try exact match
        let match = files.find(f => f === objectId);
        if (!match) {
          // Then try files that start with objectId- or objectId
          match = files.find(f => f.startsWith(`${objectId}-`) || f.startsWith(`${objectId}`));
        }
        if (!match) {
          return res.status(404).send("Not found");
        }
        const filePath = path.join(UPLOADS_DIR, match);
        if (!fs.existsSync(filePath)) return res.status(404).send("Not found");

        // Set appropriate content type
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
        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');

        return res.sendFile(filePath);
      }

      // 2) If objectId and filename provided, try to resolve variants
      const candidate1 = `${objectId}-${maybeFilename}`;
      const candidate2 = `${objectId}${maybeFilename.startsWith(".") ? "" : "-"}${maybeFilename}`;
      const candidateExact = `${maybeFilename}`;
      const candidates = [candidate1, candidate2, candidateExact];

      // Find exact candidate match first
      let match = files.find(f => candidates.includes(f));
      if (!match) {
        // Try files that start with objectId and end with same extension
        match = files.find(f => f.startsWith(`${objectId}-`) && f.endsWith(path.extname(maybeFilename)));
      }
      if (!match) {
        // Fallback: any file that starts with objectId
        match = files.find(f => f.startsWith(objectId));
      }

      if (!match) return res.status(404).send("Not found");

      const filePath = path.join(UPLOADS_DIR, match);
      if (!fs.existsSync(filePath)) return res.status(404).send("Not found");

      // Set appropriate content type
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
      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');

      return res.sendFile(filePath);
    } catch (err) {
      console.error("Error serving object:", err);
      return res.status(500).send("Internal error");
    }
  });

  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // This allows multiple projects to run on different ports
  // Default to 5000 only if PORT is not specified
  console.log('ENV PORT:', process.env.PORT);
  const port = parseInt(process.env.PORT || '5000', 10);
  httpServer.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();