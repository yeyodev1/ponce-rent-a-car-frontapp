import { reactive, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError, Paginated } from '@/types'
import type { ListParams } from '@/types/admin'

/**
 * Lista paginada con búsqueda y filtros, sincronizada con la query de la URL:
 * al volver desde un detalle se recupera la misma página y los mismos filtros.
 */
type Filters = { q: string; status: string } & Record<string, string>

export function useAdminList<T>(
  fetcher: (params: ListParams) => Promise<Paginated<T>>,
  opts: { filters?: string[]; limit?: number; sync?: boolean } = {},
) {
  const route = useRoute()
  const router = useRouter()
  const sync = opts.sync !== false
  const keys = ['q', 'status', ...(opts.filters || [])]

  const initial = (key: string) => (sync && typeof route.query[key] === 'string' ? (route.query[key] as string) : '')

  const filters = reactive(Object.fromEntries(keys.map((k) => [k, initial(k)])) as Filters)
  const page = ref(Number(initial('page')) || 1)
  const items = ref([]) as Ref<T[]>
  const total = ref(0)
  const pages = ref(1)
  const loading = ref(true)
  const error = ref<ApiError | null>(null)

  let ticket = 0

  async function load() {
    const mine = ++ticket
    loading.value = true
    error.value = null
    try {
      const res = await fetcher({ ...filters, page: page.value, limit: opts.limit || 20 })
      // Si llegó una respuesta más nueva mientras esperábamos, esta se descarta.
      if (mine !== ticket) return
      items.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      if (mine !== ticket) return
      error.value = e as ApiError
      items.value = []
    } finally {
      if (mine === ticket) loading.value = false
    }
  }

  function writeQuery() {
    if (!sync) return
    const q: Record<string, string> = {}
    for (const k of keys) if (filters[k]) q[k] = filters[k]!
    if (page.value > 1) q.page = String(page.value)
    router.replace({ query: q }).catch(() => {})
  }

  watch(
    () => keys.map((k) => filters[k]).join('|'),
    () => {
      page.value = 1
      writeQuery()
      load()
    },
  )

  watch(page, () => {
    writeQuery()
    load()
  })

  /** Reemplaza un ítem en la lista sin recargar (guardado optimista). */
  function patchItem(id: string, patch: Partial<T>) {
    items.value = items.value.map((it) => ((it as { _id: string })._id === id ? { ...it, ...patch } : it))
  }

  function removeItem(id: string) {
    items.value = items.value.filter((it) => (it as { _id: string })._id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  load()

  return { items, total, page, pages, filters, loading, error, load, patchItem, removeItem }
}
