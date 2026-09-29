import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Entrada orquestada del hero: la foto se asienta con un zoom lento, el título
 * sube palabra por palabra y las dos rutas llegan al final, que es donde debe
 * terminar la mirada. Solo transform/opacity. Con reduced-motion no se anima
 * nada: todo aparece en su lugar desde el inicio.
 */
export function useHeroIntro(root: Ref<HTMLElement | null>) {
  let mm: gsap.MatchMedia | null = null

  onMounted(() => {
    const el = root.value
    if (!el) return
    mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(el)
      const routes = q('.route')
      // Las tarjetas tienen transition de CSS (hover/press): se apaga durante
      // la entrada y al final se borra todo lo inline para que vuelvan a mandar.
      gsap.set(routes, { transition: 'none' })

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo(q('.hero__bg'), { scale: 1.18 }, { scale: 1.04, duration: 2.8, ease: 'power2.out' }, 0)
        .fromTo(q('.hero__veil'), { opacity: 0.4 }, { opacity: 1, duration: 1.4, ease: 'power1.out' }, 0)
        .fromTo(q('.hero__eyebrow'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.15)
        .fromTo(q('.hero__word'), { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.055 }, 0.2)
        .fromTo(q('.hero__subtitle'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.55)
        .fromTo(q('.hero__chip'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.07 }, 0.68)
        .fromTo(
          routes,
          { y: 56, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.15, stagger: 0.12, clearProps: 'all' },
          0.6,
        )

      // Parallax sutil: la foto baja más lento que el contenido
      gsap.to(q('.hero__bg img'), {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    })
  })

  onBeforeUnmount(() => mm?.revert())
}
