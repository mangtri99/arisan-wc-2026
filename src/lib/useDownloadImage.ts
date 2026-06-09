import { ref } from 'vue'
import html2canvas from 'html2canvas'

export function useDownloadImage() {
  const downloading = ref(false)

  async function downloadImage(el: HTMLElement, filename = 'arisan-piala-dunia-2026.png') {
    if (downloading.value) return
    downloading.value = true
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#06140E',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = filename
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      downloading.value = false
    }
  }

  return { downloading, downloadImage }
}
