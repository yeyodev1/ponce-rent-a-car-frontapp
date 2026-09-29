import { ref } from 'vue'

// Estado de módulo: el header y la barra inferior abren el mismo menú.
const open = ref(false)

export function useMobileMenu() {
  return {
    open,
    toggle: () => (open.value = !open.value),
    close: () => (open.value = false),
    show: () => (open.value = true),
  }
}
