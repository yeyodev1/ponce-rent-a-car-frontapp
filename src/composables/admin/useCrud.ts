import { ref, type Ref } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { copy } from '@/config/admin'
import type { ApiError } from '@/types'
import type { ListParams } from '@/types/admin'

interface CrudOptions<T, F> {
  /** Formulario vacío para "Nuevo". */
  empty: () => F
  /** Item → formulario editable (por defecto, copia profunda). */
  toForm?: (item: T) => F
  /** Formulario → cuerpo que se envía al API. */
  toBody?: (form: F) => unknown
  /** Pide el item completo al abrirlo (las listas pueden venir resumidas). */
  fetchOne?: boolean
  params?: ListParams
}

const clone = <X>(v: X): X => JSON.parse(JSON.stringify(v))

/**
 * CRUD de colecciones chicas del panel (categorías, coberturas, promociones…):
 * lista completa, drawer de edición, guardado optimista y borrado confirmado.
 */
export function useCrud<T extends { _id: string }, F extends object = Partial<T>>(
  resource: string,
  opts: CrudOptions<T, F>,
) {
  const toast = useToastStore()
  const items = ref([]) as Ref<T[]>
  const loading = ref(true)
  const error = ref<ApiError | null>(null)
  const form = ref(opts.empty()) as Ref<F>
  const editingId = ref<string | null>(null)
  const drawerOpen = ref(false)
  const saving = ref(false)
  const toDelete = ref<T | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await adminService.list<T>(resource, { limit: 200, ...opts.params })
      items.value = res.items
    } catch (e) {
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  function openNew() {
    editingId.value = null
    form.value = opts.empty()
    drawerOpen.value = true
  }

  async function openEdit(item: T) {
    editingId.value = item._id
    const toForm = opts.toForm || ((i: T) => ({ ...opts.empty(), ...clone(i) }) as unknown as F)
    form.value = toForm(item)
    drawerOpen.value = true
    if (opts.fetchOne) {
      try {
        const full = await adminService.one<T>(resource, item._id)
        if (editingId.value === item._id) form.value = toForm(full)
      } catch {
        /* se edita con lo que vino en la lista */
      }
    }
  }

  async function save() {
    saving.value = true
    const body = opts.toBody ? opts.toBody(form.value) : form.value
    try {
      if (editingId.value) {
        const id = editingId.value
        const saved = await adminService.update<T>(resource, id, body)
        items.value = items.value.map((i) => (i._id === id ? { ...i, ...(saved || body) } : i))
        toast.success(copy.saved)
      } else {
        const created = await adminService.create<T>(resource, body)
        if (created && created._id) items.value = [...items.value, created]
        else await load()
        toast.success(copy.created)
      }
      drawerOpen.value = false
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  async function confirmDelete() {
    const target = toDelete.value
    if (!target) return
    toDelete.value = null
    const before = items.value
    items.value = items.value.filter((i) => i._id !== target._id)
    try {
      await adminService.remove(resource, target._id)
      toast.success(copy.deleted)
      drawerOpen.value = false
    } catch (e) {
      items.value = before
      toast.error((e as ApiError).message)
    }
  }

  /** Cambia un booleano (activo/publicado) al toque y revierte si falla. */
  async function toggle(item: T, field: keyof T & string = 'isActive' as keyof T & string) {
    const next = !item[field]
    const patch = { [field]: next } as Partial<T>
    items.value = items.value.map((i) => (i._id === item._id ? { ...i, ...patch } : i))
    try {
      await adminService.update<T>(resource, item._id, { ...clone(item), ...patch })
    } catch (e) {
      items.value = items.value.map((i) => (i._id === item._id ? { ...i, [field]: !next } : i))
      toast.error((e as ApiError).message)
    }
  }

  load()

  return { items, loading, error, form, editingId, drawerOpen, saving, toDelete, load, openNew, openEdit, save, confirmDelete, toggle }
}
