<script setup lang="ts">
/**
 * Abre y cierra un panel animando su altura real (medida con scrollHeight) y
 * el contenido con opacidad/translate. Con movimiento reducido es instantáneo.
 */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onEnter(el: Element, done: () => void) {
  const node = el as HTMLElement
  if (reduced()) return done()
  node.style.overflow = 'hidden'
  node.style.height = '0px'
  node.style.opacity = '0'
  node.style.transform = 'translateY(-6px)'
  // Forzar reflow: sin esto el navegador fusiona el estado inicial y el final.
  void node.offsetHeight
  requestAnimationFrame(() => {
    node.style.transition = `height 0.38s ${EASE}, opacity 0.3s ease 0.05s, transform 0.38s ${EASE}`
    node.style.height = `${node.scrollHeight}px`
    node.style.opacity = '1'
    node.style.transform = 'none'
  })
  finish(node, done)
}

function onLeave(el: Element, done: () => void) {
  const node = el as HTMLElement
  if (reduced()) return done()
  node.style.overflow = 'hidden'
  node.style.height = `${node.scrollHeight}px`
  // Forzar reflow: sin esto el navegador fusiona el estado inicial y el final.
  void node.offsetHeight
  requestAnimationFrame(() => {
    node.style.transition =
      'height 0.3s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.2s ease, transform 0.3s ease'
    node.style.height = '0px'
    node.style.opacity = '0'
    node.style.transform = 'translateY(-4px)'
  })
  finish(node, done)
}

function finish(node: HTMLElement, done: () => void) {
  let called = false
  const end = () => {
    if (called) return
    called = true
    node.removeEventListener('transitionend', onEnd)
    done()
  }
  const onEnd = (e: TransitionEvent) => {
    if (e.target === node && e.propertyName === 'height') end()
  }
  node.addEventListener('transitionend', onEnd)
  // Red de seguridad: si la altura no cambia no hay transitionend.
  setTimeout(end, 520)
}

function clean(el: Element) {
  const node = el as HTMLElement
  node.style.height = ''
  node.style.overflow = ''
  node.style.opacity = ''
  node.style.transform = ''
  node.style.transition = ''
}
</script>

<template>
  <Transition
    :css="false"
    @enter="onEnter"
    @after-enter="clean"
    @leave="onLeave"
    @after-leave="clean"
  >
    <slot />
  </Transition>
</template>
