import { ref, shallowRef, type Ref } from 'vue'

// Caché de la visita: volver a una página ya vista la pinta al instante y
// refresca en segundo plano.
const cache = new Map<string, unknown>()

interface RemoteState<T> {
  data: Ref<T>
  loading: Ref<boolean>
  error: Ref<string>
  notFound: Ref<boolean>
  reload: () => Promise<void>
}

/**
 * Carga un recurso del API con estados de carga, error y 404. Nunca lanza:
 * la UI decide cómo degradar cuando el API falla o viene vacío.
 */
export function useRemote<T>(key: string, fetcher: () => Promise<T>, initial: T): RemoteState<T> {
  const hit = cache.has(key)
  const data = shallowRef<T>(hit ? (cache.get(key) as T) : initial) as Ref<T>
  const loading = ref(!hit)
  const error = ref('')
  const notFound = ref(false)

  async function reload() {
    if (!cache.has(key)) loading.value = true
    error.value = ''
    notFound.value = false
    try {
      const value = await fetcher()
      data.value = value
      cache.set(key, value)
    } catch (e) {
      const err = e as { status?: number; message?: string }
      if (err.status === 404) notFound.value = true
      else error.value = err.message || 'Error'
    } finally {
      loading.value = false
    }
  }

  reload()
  return { data, loading, error, notFound, reload }
}
