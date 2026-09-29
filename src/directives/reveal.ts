import type { Directive } from 'vue'

/**
 * v-reveal: el elemento entra suave al aparecer en pantalla.
 * v-reveal="120" agrega un retraso en ms (para escalonar tarjetas).
 * Un solo IntersectionObserver para toda la app: barato en móviles.
 */
let observer: IntersectionObserver | null = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          ;(entry.target as HTMLElement).dataset.reveal = 'in'
          observer!.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  return observer
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (!('IntersectionObserver' in window)) return
    el.dataset.reveal = ''
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
