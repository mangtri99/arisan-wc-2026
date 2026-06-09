import { ref } from 'vue'
import { toPng } from 'html-to-image'

export function useDownloadImage() {
  const downloading = ref(false)

  async function downloadImage(el: HTMLElement, filename = 'arisan-piala-dunia-2026.png') {
    if (downloading.value) return
    downloading.value = true
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#06140E',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } finally {
      downloading.value = false
    }
  }

  return { downloading, downloadImage }
}
