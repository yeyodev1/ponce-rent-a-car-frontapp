import { computed, onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * Cuenta regresiva hacia una fecha ISO (apartado de 20 min, cajita de 10 min).
 * Un intervalo por componente; se limpia solo al desmontar.
 */
export function useCountdown(target: Ref<string | null | undefined>) {
  const now = ref(Date.now())
  let id: ReturnType<typeof setInterval> | undefined

  const remaining = computed(() => {
    if (!target.value) return 0
    return Math.max(0, new Date(target.value).getTime() - now.value)
  })
  const expired = computed(() => Boolean(target.value) && remaining.value <= 0)
  const label = computed(() => {
    const total = Math.ceil(remaining.value / 1000)
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  watch(
    target,
    (value) => {
      clearInterval(id)
      now.value = Date.now()
      if (value) id = setInterval(() => (now.value = Date.now()), 1000)
    },
    { immediate: true },
  )

  onScopeDispose(() => clearInterval(id))

  return { remaining, expired, label }
}
