# Scripts Directory

This directory contains utility scripts for the SyncStyle project.

## Available Scripts

### generate-sitemap.mjs
Generates a sitemap.xml file for search engine optimization.

**Usage:**
```bash
node scripts/generate-sitemap.mjs
```

**Note:** This script is automatically run during the build process. The sitemap will be generated in the `dist/` directory after building the project.

To include it in your build process, add this to your package.json scripts:
```json
{
  "scripts": {
    "build": "vite build && node scripts/generate-sitemap.mjs"
  }
}
```

### performance-test.sh
Runs performance tests for the application.

### security-scan.sh
Performs security scanning on the codebase.

### test.sh
Runs the test suite.

### remove_temp.ps1
PowerShell script to clean up temporary files.

**Purpose:**
- Helper to find and remove `.temp` directories under the repository root.

**Usage:**
- Run from the project root in PowerShell (no admin required in normal cases):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\remove_temp.ps1
```

**Notes:**
- The script attempts to clear file attributes before removal. If permission errors occur, run PowerShell as Administrator and re-run the script.
- This script is safe to run and only targets directories named `.temp`.

## SEO and GEO Files

The project includes several SEO and GEO (Generative Engine Optimization) enhancements:

- **robots.txt** (`public/robots.txt`): Controls crawler access
- **ai.txt** (`public/.well-known/ai.txt`): Provides guidance to LLM and AI crawlers
- **sitemap.xml** (`dist/sitemap.xml`): Generated during build for search engines

For more information on SEO improvements, see the documentation in your project's docs folder.
