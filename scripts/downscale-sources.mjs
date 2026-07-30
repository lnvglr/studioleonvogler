/**
 * Downscale source images in public/img/ to max 4K (3840px long edge)
 * and convert to WebP. Updates text references across the repo.
 *
 * Skips (and removes) responsive orphans like `foo-640w.webp` from the
 * old optimize-images script.
 *
 * Usage: node scripts/downscale-sources.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const root = path.join(__dirname, '..')
const imgDir = path.join(root, 'public', 'img')

const MAX_EDGE = 3840
const QUALITY = 85
const PROCESSABLE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff', '.avif'])
const VARIANT_RE = /-\d+w\.webp$/i

let sharp
try {
  sharp = require('sharp')
} catch {
  console.error('sharp is not installed. Run: yarn install')
  process.exit(1)
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile()) out.push(full)
  }
  return out
}

function collectTextFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.output' || entry.name === '.nuxt' || entry.name === 'dist') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collectTextFiles(full, out)
    else if (/\.(vue|ts|js|mjs|md|css|json|html)$/i.test(entry.name)) out.push(full)
  }
  return out
}

async function main() {
  if (!fs.existsSync(imgDir)) {
    console.error(`Missing ${imgDir}`)
    process.exit(1)
  }

  const files = walk(imgDir)
  const renames = new Map() // old public path (/img/...) -> new public path
  let converted = 0
  let resized = 0
  let skipped = 0
  let removedVariants = 0
  let deletedOriginals = 0

  // Remove leftover responsive variants from optimize-images.mjs
  for (const file of files) {
    if (VARIANT_RE.test(file)) {
      fs.unlinkSync(file)
      removedVariants++
      console.log(`[remove-variant] ${path.relative(root, file)}`)
    }
  }

  const sources = walk(imgDir).filter((f) => {
    const ext = path.extname(f).toLowerCase()
    return PROCESSABLE.has(ext) && !VARIANT_RE.test(f)
  })

  console.log(`[downscale] Processing ${sources.length} source image(s)…`)

  for (const srcPath of sources) {
    const ext = path.extname(srcPath).toLowerCase()
    const destPath = srcPath.slice(0, -ext.length) + '.webp'
    const relSrc = '/' + path.relative(path.join(root, 'public'), srcPath).split(path.sep).join('/')
    const relDest = '/' + path.relative(path.join(root, 'public'), destPath).split(path.sep).join('/')

    let meta
    try {
      meta = await sharp(srcPath).metadata()
    } catch (e) {
      console.warn(`[skip] Could not read ${srcPath}: ${e.message}`)
      skipped++
      continue
    }

    const width = meta.width || 0
    const height = meta.height || 0
    const longEdge = Math.max(width, height)
    const needsResize = longEdge > MAX_EDGE
    const alreadyOptimal =
      ext === '.webp' &&
      !needsResize &&
      path.resolve(srcPath) === path.resolve(destPath)

    if (alreadyOptimal) {
      // Re-encode oversized webp files; leave small ones alone
      const size = fs.statSync(srcPath).size
      if (size < 1_500_000) {
        skipped++
        continue
      }
    }

    const pipeline = sharp(srcPath, { failOn: 'none' }).rotate()
    if (needsResize) {
      pipeline.resize({
        width: width >= height ? MAX_EDGE : undefined,
        height: height > width ? MAX_EDGE : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      })
      resized++
    }

    // Write to a temp file first in case src === dest
    const tmpPath = destPath + '.tmp.webp'
    await pipeline.webp({ quality: QUALITY }).toFile(tmpPath)

    if (fs.existsSync(destPath) && path.resolve(destPath) !== path.resolve(srcPath)) {
      fs.unlinkSync(destPath)
    }
    fs.renameSync(tmpPath, destPath)

    if (path.resolve(srcPath) !== path.resolve(destPath)) {
      fs.unlinkSync(srcPath)
      deletedOriginals++
      renames.set(relSrc, relDest)
      // Also map without leading slash / with img/ prefix variants
      renames.set(relSrc.replace(/^\//, ''), relDest.replace(/^\//, ''))
    }

    const outMeta = await sharp(destPath).metadata()
    const outSize = fs.statSync(destPath).size
    console.log(
      `[ok] ${path.relative(root, destPath)}  ${width}x${height} → ${outMeta.width}x${outMeta.height}  ${Math.round(outSize / 1024)}KB` +
        (needsResize ? ' (resized)' : '')
    )
    converted++
  }

  // Update references in source files
  const textFiles = [
    ...collectTextFiles(path.join(root, 'content')),
    ...collectTextFiles(path.join(root, 'components')),
    ...collectTextFiles(path.join(root, 'pages')),
    ...collectTextFiles(path.join(root, 'data')),
    ...collectTextFiles(path.join(root, 'assets')),
    ...collectTextFiles(path.join(root, 'scripts')),
  ]

  // Build extension swap replacements for common image paths under /img/
  // Match any /img/... or img/... ending in jpg/jpeg/png/gif/tiff (not already webp)
  const extSwap = /(\/?img\/[^\s"'`)]+)\.(jpe?g|png|gif|tiff?|avif)\b/gi
  let filesUpdated = 0
  let replacements = 0

  for (const file of textFiles) {
    const original = fs.readFileSync(file, 'utf8')
    let next = original

    // Prefer exact rename map first
    for (const [from, to] of renames) {
      if (next.includes(from)) {
        next = next.split(from).join(to)
      }
    }

    // Catch remaining img refs that still use raster extensions
    next = next.replace(extSwap, (_, base) => {
      replacements++
      return `${base}.webp`
    })

    if (next !== original) {
      fs.writeFileSync(file, next)
      filesUpdated++
      console.log(`[refs] ${path.relative(root, file)}`)
    }
  }

  console.log('\n[downscale] Done.')
  console.log(`  converted: ${converted}`)
  console.log(`  resized (>4K): ${resized}`)
  console.log(`  skipped: ${skipped}`)
  console.log(`  deleted originals: ${deletedOriginals}`)
  console.log(`  removed -Nw.webp variants: ${removedVariants}`)
  console.log(`  files with updated refs: ${filesUpdated}`)
  console.log(`  extension swaps: ${replacements}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
