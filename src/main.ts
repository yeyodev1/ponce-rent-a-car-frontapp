import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
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

app.mount('#app')
