/**
 * Pre-generates responsive WebP image variants for all images in public/img/.
 * Runs before `nuxt generate` so the variants are included in the static output.
 *
 * Generated files follow the naming convention:
 *   <basename>-<width>w.webp
 * e.g. public/img/projects/food-waste/wasted-0-640w.webp
 *
 * NuxtImg with provider: 'none' serves the original src unchanged, so these
 * variants are available as static files for direct <img srcset> use or future
 * tooling. The originals are also preserved and served as-is.
 *
 * Usage: node scripts/optimize-images.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Dynamically import sharp (CommonJS module)
let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.error('sharp is not installed. Run: npm install')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Configuration — mirrors nuxt.config.ts image settings
// ---------------------------------------------------------------------------

const INPUT_DIR = path.join(__dirname, '..', 'public', 'img')
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'img')

/** Responsive widths to generate for each source image. */
const WIDTHS = [320, 480, 640, 768, 960, 1200]

/** WebP encoding quality (matches nuxt.config.ts quality: 85). */
const QUALITY = 85

/** Image extensions to process. */
const PROCESSABLE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.avif'])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively collect all image file paths under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectImages(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath))
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (PROCESSABLE_EXTENSIONS.has(ext)) {
        results.push(fullPath)
      }
    }
  }
  return results
}

/**
 * Derive the output path for a given source file and target width.
 * Source: /public/img/projects/foo/bar.jpg
 * Output: /public/img/projects/foo/bar-640w.webp
 *
 * @param {string} srcPath  Absolute path to the source image.
 * @param {number} width    Target width in pixels.
 * @returns {string}        Absolute path for the output file.
 */
function outputPath(srcPath, width) {
  const rel = path.relative(INPUT_DIR, srcPath)
  const dir = path.dirname(rel)
  const base = path.basename(rel, path.extname(rel))
  return path.join(OUTPUT_DIR, dir, `${base}-${width}w.webp`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.warn(`[optimize-images] Input directory not found: ${INPUT_DIR}`)
    console.warn('[optimize-images] Skipping image optimization.')
    return
  }

  const images = collectImages(INPUT_DIR)
  console.log(`[optimize-images] Found ${images.length} source image(s) in ${INPUT_DIR}`)

  let generated = 0
  let skipped = 0
  let errors = 0

  for (const srcPath of images) {
    // Skip files that are already generated variants (contain "-<number>w.webp")
    if (/\-\d+w\.webp$/.test(srcPath)) {
      continue
    }

    // Get source image metadata to skip upscaling
    let metadata
    try {
      metadata = await sharp(srcPath).metadata()
    } catch (e) {
      console.warn(`[optimize-images] Could not read metadata for ${srcPath}: ${e.message}`)
      errors++
      continue
    }

    const srcWidth = metadata.width || Infinity

    for (const width of WIDTHS) {
      // Never upscale — skip widths larger than the source
      if (width > srcWidth) {
        continue
      }

      const dest = outputPath(srcPath, width)

      // Skip if the variant already exists and is newer than the source
      if (fs.existsSync(dest)) {
        const srcMtime = fs.statSync(srcPath).mtimeMs
        const destMtime = fs.statSync(dest).mtimeMs
        if (destMtime >= srcMtime) {
          skipped++
          continue
        }
      }

      // Ensure output directory exists
      fs.mkdirSync(path.dirname(dest), { recursive: true })

      try {
        await sharp(srcPath)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(dest)

        const rel = path.relative(path.join(__dirname, '..'), dest)
        console.log(`[optimize-images] ✓ ${rel}`)
        generated++
      } catch (e) {
        console.error(`[optimize-images] ✗ Failed to generate ${dest}: ${e.message}`)
        errors++
      }
    }
  }

  console.log(
    `[optimize-images] Done. Generated: ${generated}, Skipped (up-to-date): ${skipped}, Errors: ${errors}`
  )

  if (errors > 0) {
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('[optimize-images] Fatal error:', e)
  process.exit(1)
})
