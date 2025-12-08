export interface Project {
  id: string
  title: string
  fontName?: string
  category: 'editorial' | 'type' | 'graphic' | 'web'
  categoryName: string
  description: string
  image: string
  alt: string
  date?: string // YYYY-MM-DD format
}


// Load all projects with all metadata from content markdown files and sort by newest first
export async function getProjectsWithDates(): Promise<Project[]> {
  try {
    // Load all project content files
    const contentFiles = await queryContent('projects').find()
    
    // Extract all metadata from markdown frontmatter
    const projects: Project[] = contentFiles.map((file: any) => {
      const project: Project = {
        id: file.id || '',
        title: file.title || '',
        category: file.category || 'graphic',
        categoryName: file.categoryName || 'Graphic Design',
        description: file.description || '',
        image: file.image || '',
        alt: file.alt || '',
      }
      
      // Optional fields
      if (file.fontName) {
        project.fontName = file.fontName
      }
      if (file.date) {
        project.date = file.date
      }
      
      return project
    }).filter((project: Project) => project.id) // Filter out projects without IDs
    
    // Sort by date (newest first), projects without dates go to the end
    return projects.sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
  } catch (e) {
    // If content loading fails, return empty array
    console.warn('Failed to load projects from content:', e)
    return []
  }
}
