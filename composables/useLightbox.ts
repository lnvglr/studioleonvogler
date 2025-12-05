export const useLightbox = () => {
  const isOpen = useState('lightbox:isOpen', () => false)
  const imageSrc = useState<string | null>('lightbox:imageSrc', () => null)
  const imageAlt = useState<string>('lightbox:imageAlt', () => '')

  const open = (src: string, alt: string = '') => {
    imageSrc.value = src
    imageAlt.value = alt
    isOpen.value = true
    // Prevent body scroll when lightbox is open
    if (process.client) {
      document.body.style.overflow = 'hidden'
    }
  }

  const close = () => {
    isOpen.value = false
    // Restore body scroll
    if (process.client) {
      document.body.style.overflow = ''
    }
    // Clear after animation
    setTimeout(() => {
      imageSrc.value = null
      imageAlt.value = ''
    }, 300)
  }

  return {
    isOpen: readonly(isOpen),
    imageSrc: readonly(imageSrc),
    imageAlt: readonly(imageAlt),
    open,
    close,
  }
}
