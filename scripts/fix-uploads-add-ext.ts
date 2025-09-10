
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads");

interface FileMapping {
  oldName: string;
  newName: string;
}

// Simple MIME type detection from file headers
function detectFileType(filePath: string): string | null {
  try {
    const buffer = fs.readFileSync(filePath);
    const header = buffer.toString('hex', 0, 8);
    
    // JPEG
    if (header.startsWith('ffd8ff')) {
      return 'jpg';
    }
    // PNG
    if (header.startsWith('89504e47')) {
      return 'png';
    }
    // GIF
    if (header.startsWith('47494638')) {
      return 'gif';
    }
    // WEBP
    if (header.startsWith('52494646') && buffer.toString('ascii', 8, 12) === 'WEBP') {
      return 'webp';
    }
    // AVIF
    if (header.includes('66747970617669') || header.includes('6674797061766966')) {
      return 'avif';
    }
    // SVG (text-based, check for XML declaration)
    if (buffer.toString('utf8', 0, 100).includes('<svg') || buffer.toString('utf8', 0, 100).includes('<?xml')) {
      return 'svg';
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(uploadsDir)) {
    console.log("Uploads directory does not exist");
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  const mapping: FileMapping[] = [];

  for (const f of files) {
    const full = path.join(uploadsDir, f);

    // Skip directories
    if (!fs.statSync(full).isFile()) continue;

    // Skip if already has a proper extension
    const ext = path.extname(f);
    if (ext && ext.length <= 6 && !f.includes('.upload-') && !f.endsWith('.upload')) {
      console.log("Skip (has proper ext):", f);
      continue;
    }

    console.log("Checking file:", f);
    
    const detectedType = detectFileType(full);
    if (detectedType) {
      // Remove .upload suffix if present
      let baseName = f;
      if (baseName.includes('.upload-')) {
        baseName = baseName.split('.upload-')[0];
      } else if (baseName.endsWith('.upload')) {
        baseName = baseName.replace('.upload', '');
      }
      
      const newName = `${baseName}.${detectedType}`;
      const newPath = path.join(uploadsDir, newName);
      
      if (!fs.existsSync(newPath)) {
        fs.renameSync(full, newPath);
        mapping.push({ oldName: f, newName });
        console.log("✅ Renamed", f, "->", newName);
      } else {
        console.warn("⚠️ Target exists, skip:", newName);
      }
    } else {
      console.warn("❌ No MIME type detected for", f);
    }
  }

  // Save mapping
  if (mapping.length > 0) {
    fs.writeFileSync(
      path.join(uploadsDir, "fix-upload-mapping.json"), 
      JSON.stringify(mapping, null, 2)
    );
    console.log(`\n✅ Done! Fixed ${mapping.length} files. Mapping saved to fix-upload-mapping.json`);
  } else {
    console.log("\n✅ No files needed fixing.");
  }
}

main().catch(e => { 
  console.error(e); 
  process.exit(1); 
});
