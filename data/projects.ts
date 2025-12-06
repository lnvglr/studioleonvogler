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

export const projects: Project[] = [
  // Editorial Design
  {
    id: 'military-occupations',
    title: 'Military Occupations – An Index',
    fontName: "סיאול גרוטסק",
    category: 'editorial',
    categoryName: 'Editorial Design',
    description: 'An extensive index that explores the complex history and impact of military occupations through a carefully crafted typographic and editorial approach. The publication examines various case studies, historical contexts, and contemporary perspectives, using typography and layout as tools to navigate difficult subject matter with clarity and sensitivity.',
    image: 'img/projects/military-occupations/03-mo-mockup-chapter-1-scaled.jpg',
    alt: 'Open book with about military occupations',
  },
  {
    id: 'data-literacy',
    title: 'Data Literacy Booklet',
    category: 'editorial',
    categoryName: 'Editorial Design',
    description: 'A comprehensive booklet designed to make data literacy accessible and engaging for readers of all backgrounds. Through thoughtful visual design, clear typography, and intuitive information architecture, the publication breaks down complex data concepts into digestible sections, helping readers develop the skills needed to understand and interpret data in their daily lives.',
    image: 'img/projects/data-literacy/Magazine_Mockup_3.jpg',
    alt: 'Open booklet on data literacy',
  },
  {
    id: 'food-waste',
    title: 'Wasted – Food Worth Saving',
    category: 'editorial',
    categoryName: 'Editorial Design',
    description: 'A zine that addresses the critical issue of food waste and why it demands our immediate attention. Through compelling editorial design and thoughtful content curation, the publication explores the environmental, economic, and social implications of food waste, encouraging readers to reconsider their relationship with food and take action toward more sustainable practices.',
    image: 'img/projects/food-waste/wasted.jpg',
    alt: 'Open magazine on food waste',
  },
  // Type Design
  {
    id: 'seoul-grotesk',
    title: 'Seoul Grotesk',
    category: 'type',
    categoryName: 'Type Design',
    description: 'A typeface design deeply inspired by the vibrant urban landscape and typographic culture of Seoul. The font captures the energy and character of the city through its letterforms, balancing modern functionality with distinctive personality. Designed to support both Latin and Hebrew scripts, Seoul Grotesk reflects the multicultural nature of contemporary design while maintaining strong visual identity.',
    image: 'img/projects/seoul-grotesk/seoul-grotesk-mockup.jpg',
    alt: 'Poster of a specimen of the typeface Seoul Grotesk',
  },
  {
    id: 'diode-global-next',
    title: 'Diode Global Next',
    category: 'type',
    categoryName: 'Type Design',
    description: 'A comprehensive multi-script typeface family created through extensive research into typographic hierarchies in Israeli public space. The design explores how different scripts coexist and interact in urban environments, supporting Latin, Cyrillic, Greek, Georgian, and N\'Ko scripts. The typeface addresses the complex challenges of multilingual typography while maintaining visual coherence and readability across all supported languages.',
    image: 'img/projects/diode-global-next/diode-global.png',
    alt: 'Typeface specimen for Diode Global Next',
  },
  // Graphic Design
  {
    id: 'design-progression-monogram',
    title: 'Monogram',
    category: 'graphic',
    categoryName: 'Graphic Design',
    description: 'A detailed design exploration for a monogram consisting of the Hebrew letters alef, zadi, and lamed. The project documents the iterative process of creating a cohesive visual identity from these three distinct letterforms, exploring various approaches to integration, balance, and harmony. The final monogram serves as a testament to the careful consideration of form, space, and cultural context in typographic design.',
    image: 'img/projects/design-progression-monogram/zal.jpg',
    alt: 'Design progression of a monogram',
  },
  {
    id: 'safari-concert-poster',
    title: 'Safari in Park HaLeumi Ramat Gan',
    category: 'graphic',
    categoryName: 'Graphic Design',
    description: 'A poster design for a concert that was eventually canceled in the early days of the COVID pandemic, featuring an exploration of Hebrew calligraphy and contemporary graphic design. The project combines traditional calligraphic techniques with modern visual language, creating a dynamic composition that captures the energy of the planned event while showcasing the expressive potential of Hebrew typography in contemporary contexts.',
    image: 'img/projects/safari-concert-poster/safari.jpg',
    alt: 'Safari – Polo & Pan / Artbat concert poster',
  },
  {
    id: 'agfalux-product-exposition',
    title: 'Agfalux Product Exposition',
    category: 'graphic',
    categoryName: 'Graphic Design',
    description: 'Visual design for an Agfalux product exposition showcasing retro camera equipment. The design system celebrates the aesthetic and technical qualities of vintage photography equipment through careful attention to detail, typography, and layout. The visual language bridges the gap between historical craftsmanship and contemporary presentation, creating an engaging experience that honors both the products and their heritage.',
    image: 'img/projects/agfalux-product-exposition/agfa-3.jpg',
    alt: 'A disassembled retro camera flash',
  },
  // Interface Design
  {
    id: 'character-diversion',
    title: 'Character Diversion – Platform for Typographic Discourse',
    category: 'web',
    categoryName: 'Interface Design',
    description: 'A web platform designed for typographic discourse and exploration, providing a space for designers, researchers, and enthusiasts to engage with type design in new ways. The interface combines intuitive navigation with rich interactive features, allowing users to explore glyphs, compare typefaces, and participate in discussions about typographic practice. The design prioritizes both functionality and aesthetic experience, creating a tool that serves both practical and educational purposes.',
    image: 'img/projects/character-diversion/character-diversion.png',
    alt: 'Webapp for typographic discourse',
  },
  {
    id: 'klapster-configurator',
    title: 'Klapster Configurator',
    category: 'web',
    categoryName: 'Interface Design',
    description: 'An interactive configurator interface for custom product design that enables users to personalize products in real-time. The interface balances complexity with clarity, guiding users through customization options while providing immediate visual feedback. The design emphasizes user experience and accessibility, ensuring that the customization process is both enjoyable and efficient, regardless of the user\'s technical background.',
    image: 'img/projects/klapster-configurator/Klapster - individueller Treppen Konfigurator _ Jetzt entdecken.jpeg',
    alt: 'Landing page of a webshop configurator',
  },
  {
    id: 'rights-plus',
    title: 'RightsPlus',
    category: 'web',
    categoryName: 'Interface Design',
    description: 'A web application designed to help passengers understand and exercise their rights when traveling. The platform translates complex legal information into clear, actionable guidance, making passenger rights accessible to everyone. Through thoughtful information architecture and user-centered design, the application empowers users to navigate situations with confidence, whether dealing with flight delays, lost luggage, or other travel-related issues.',
    image: 'img/projects/rights-plus/rightsplus.jpg',
    alt: 'Landing page of passenger rights webapp',
  },
]

export const projectsByCategory = {
  editorial: projects.filter((p) => p.category === 'editorial'),
  type: projects.filter((p) => p.category === 'type'),
  graphic: projects.filter((p) => p.category === 'graphic'),
  web: projects.filter((p) => p.category === 'web'),
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

// Load projects with dates and descriptions from content and sort by newest first
export async function getProjectsWithDates(): Promise<Project[]> {
  try {
    // Load all project content files
    const contentFiles = await queryContent('projects').find()
    
    // Create maps of dates and descriptions by project id
    const dateMap = new Map<string, string>()
    contentFiles.forEach((file: any) => {
      if (file.id) {
        if (file.date) {
          dateMap.set(file.id, file.date)
        }
      }
    })
    
    // Merge dates and descriptions into projects and sort by date (newest first)
    const projectsWithDates = projects.map(project => ({
      ...project,
      date: dateMap.get(project.id) || project.date,
    }))
    
    // Sort by date (newest first), projects without dates go to the end
    return projectsWithDates.sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
  } catch (e) {
    // If content loading fails, return projects without dates
    console.warn('Failed to load project dates from content:', e)
    return projects
  }
}
