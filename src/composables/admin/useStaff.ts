import { computed, reactive, ref } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { copy, staffCopy as t } from '@/config/admin'
import type { ApiError } from '@/types'
import type { StaffInput, StaffMember } from '@/types/admin'

/** Contraseña legible de 12 caracteres sin ambiguos (0/O, 1/l). */
export function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = new Uint32Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

const emptyForm = (): StaffInput & { password: string } => ({
  name: '',
  email: '',
  phone: '',
  accountType: 'employee',
  password: '',
})

const idOf = (m: StaffMember) => m.id || m._id || ''

/** Personal del panel (solo admin): lista, alta/edición en drawer y activar/desactivar. */
export function useStaff() {
  const toast = useToastStore()
  const userStore = useUserStore()

  const items = ref<StaffMember[]>([])
  const loading = ref(true)
  const error = ref<ApiError | null>(null)
  const drawerOpen = ref(false)
  const editingId = ref<string | null>(null)
  const saving = ref(false)
  const form = reactive(emptyForm())
  const toToggle = ref<StaffMember | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      items.value = (await adminService.staff({ limit: 100 })).items
    } catch (e) {
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  const isSelf = (m: StaffMember) => Boolean(userStore.user && (idOf(m) === userStore.user.id || m.email === userStore.user.email))

  function openNew() {
    editingId.value = null
    Object.assign(form, emptyForm(), { password: generatePassword() })
    drawerOpen.value = true
  }

  function openEdit(m: StaffMember) {
    editingId.value = idOf(m)
    Object.assign(form, { name: m.name, email: m.email, phone: m.phone || '', accountType: m.accountType, password: '' })
    drawerOpen.value = true
  }

  const valid = computed(
    () =>
      form.name.trim().length > 1 &&
      /\S+@\S+\.\S+/.test(form.email) &&
      (editingId.value ? !form.password || form.password.length >= 8 : form.password.length >= 8),
  )

  async function save() {
    if (!valid.value) {
      toast.error(t.invalid)
      return
    }
    saving.value = true
    const body: Partial<StaffInput> = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      accountType: form.accountType,
      ...(form.password ? { password: form.password } : {}),
    }
    try {
      if (editingId.value) {
        const id = editingId.value
        const saved = await adminService.updateStaff(id, body)
        items.value = items.value.map((m) => (idOf(m) === id ? { ...m, ...body, ...(saved || {}) } : m))
        toast.success(copy.saved)
      } else {
        const created = await adminService.createStaff(body as StaffInput)
        if (created && idOf(created)) items.value = [...items.value, created]
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

  async function confirmToggle() {
    const m = toToggle.value
    toToggle.value = null
    if (!m || isSelf(m)) return
    const next = !m.isActive
    const id = idOf(m)
    items.value = items.value.map((x) => (idOf(x) === id ? { ...x, isActive: next } : x))
    try {
      await adminService.setStaffActive(id, next)
      toast.success(next ? t.activated : t.deactivated)
    } catch (e) {
      items.value = items.value.map((x) => (idOf(x) === id ? { ...x, isActive: !next } : x))
      toast.error((e as ApiError).message)
    }
  }

  load()

  return { items, loading, error, load, drawerOpen, editingId, saving, form, valid, openNew, openEdit, save, toToggle, confirmToggle, isSelf, idOf }
}
