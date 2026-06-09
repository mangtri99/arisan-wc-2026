import { ref } from 'vue'
import { toPng } from 'html-to-image'

export function useDownloadImage() {
  const downloading = ref(false)

  async function downloadImage(el: HTMLElement, filename = 'arisan-piala-dunia-2026.png') {
    if (downloading.value) return
    downloading.value = true

    // html-to-image tidak bisa capture elemen di luar viewport,
    // pindahkan sementara ke posisi visible lalu kembalikan
    const prev = { position: el.style.position, left: el.style.left, top: el.style.top, zIndex: el.style.zIndex }
    el.style.position = 'fixed'
    el.style.left = '0'
    el.style.top = '0'
    el.style.zIndex = '-9999'

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
      el.style.position = prev.position
      el.style.left = prev.left
      el.style.top = prev.top
      el.style.zIndex = prev.zIndex
      downloading.value = false
    }
  }

  return { downloading, downloadImage }
}
