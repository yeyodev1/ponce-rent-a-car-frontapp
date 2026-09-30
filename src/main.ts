import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import { useToastStore } from './stores/toast'
import { vReveal } from './directives/reveal'
import { captureAttribution, loadAnalytics } from './composables/useAnalytics'
import '@/styles/global.scss'

// Antes de montar: la campaña de origen debe quedar guardada aunque el
// visitante cambie de página enseguida.
captureAttribution()
loadAnalytics()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.directive('reveal', vReveal)

const userStore = useUserStore(pinia)

window.addEventListener('auth:token-expired', () => {
  userStore.clear()
  if (router.currentRoute.value.meta.requiresAuth) {
    router.replace({ name: 'Login', query: { next: router.currentRoute.value.fullPath } })
  }
})

const toastStore = useToastStore(pinia)
window.addEventListener('api:forbidden', (e) => {
  // En el login el 403 (cuenta sin acceso) ya se muestra en el formulario.
  if (router.currentRoute.value.name === 'Login') return
  toastStore.error(String((e as CustomEvent).detail || 'Solo un administrador puede hacer esto'))
})

app.mount('#app')
