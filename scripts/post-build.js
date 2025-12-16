#!/usr/bin/env node

/**
 * Post-build script to ensure 'use client' directive is preserved in client files.
 * 
 * Tsup/esbuild sometimes strips the 'use client' directive during bundling,
 * so we add it back as a post-processing step.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clientFiles = [
  'dist/client/index.js',
  'dist/client/index.cjs',
];

const USE_CLIENT_DIRECTIVE = "'use client';\n";

console.log('🔧 Post-build: Adding "use client" directives...\n');

for (const file of clientFiles) {
  const filePath = join(__dirname, '..', file);
  
  try {
    if (!existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} (doesn't exist yet)`);
      continue;
    }

    let content = readFileSync(filePath, 'utf8');
    
    // Check if 'use client' is already at the top (with various quote styles)
    const hasDirective = content.trimStart().match(/^['"]use client['"];?\s*\n/);
    
    if (!hasDirective) {
      // Add it at the very top
      content = USE_CLIENT_DIRECTIVE + content;
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Added 'use client' to ${file}`);
    } else {
      console.log(`✓  ${file} already has 'use client'`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    process.exit(1);
  }
}

console.log('\n✨ Post-build complete!\n');

