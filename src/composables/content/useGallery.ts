import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * Galería con scroll-snap nativo: el dedo manda (inercia del sistema) y aquí
 * solo se sigue qué diapositiva está visible para los puntos y las flechas.
 */
export function useGallery(track: Ref<HTMLElement | null>, count: () => number) {
  const index = ref(0)
  let observer: IntersectionObserver | null = null

  function observe() {
    observer?.disconnect()
    const el = track.value
    if (!el || !('IntersectionObserver' in window)) return
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) index.value = Number((e.target as HTMLElement).dataset.index || 0)
        }
      },
      { root: el, threshold: 0.6 },
    )
    el.querySelectorAll<HTMLElement>('[data-index]').forEach((slide) => observer!.observe(slide))
  }

  function go(i: number) {
    const el = track.value
    if (!el) return
    const n = count()
    const next = (i + n) % n
    const slide = el.querySelector<HTMLElement>(`[data-index="${next}"]`)
    if (!slide) return
    // offsetLeft es relativo al track (position: relative en la galería).
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: slide.offsetLeft, behavior: reduced ? 'auto' : 'smooth' })
  }

  watch([track, count], () => requestAnimationFrame(observe), { immediate: true, flush: 'post' })
  onBeforeUnmount(() => observer?.disconnect())

  return { index, go, next: () => go(index.value + 1), prev: () => go(index.value - 1) }
}
