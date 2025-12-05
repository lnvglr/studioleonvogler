import { marked } from 'marked'

export interface ProjectContent {
  id: string
  title: string
  category: string
  categoryName: string
  description: string
  image: string
  alt: string
  body?: string
  html?: string
}

export async function parseMarkdownFile(filePath: string): Promise<ProjectContent | null> {
  try {
    const response = await fetch(filePath)
    if (!response.ok) return null
    
    const text = await response.text()
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
    const match = text.match(frontmatterRegex)
    
    if (!match) return null
    
    const frontmatter = match[1]
    const body = match[2]
    
    // Parse frontmatter (simple YAML-like parser)
    const metadata: Record<string, string> = {}
    frontmatter.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        let value = line.substring(colonIndex + 1).trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        metadata[key] = value
      }
    })
    
    // Convert markdown body to HTML
    const html = await marked.parse(body)
    
    return {
      ...metadata,
      body,
      html: html as string
    } as ProjectContent
  } catch (e) {
    console.error('Error parsing markdown:', e)
    return null
  }
}
