import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { site } from '@/config/site'
import { trackPageView } from '@/composables/useAnalytics'
import adminRoutes from './admin.routes'

/**
 * URLs limpias en español (pedido de SEO del brief). El idioma no cambia la URL:
 * la misma página se presenta en ES o EN según la preferencia del visitante.
 */
const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue'), meta: { seoKey: 'home' } },

  // Ruta A — Ayúdame a elegir
  {
    path: '/ayudame-a-elegir',
    name: 'HelpMeChoose',
    component: () => import('@/views/HelpMeChooseView.vue'),
    meta: { focus: true },
  },

  // Ruta B — Reserva directa
  {
    path: '/reservar',
    name: 'Booking',
    component: () => import('@/views/BookingView.vue'),
    meta: { focus: true, noindex: true },
  },
  {
    path: '/reserva/:code',
    name: 'Reservation',
    component: () => import('@/views/ReservationView.vue'),
    meta: { noindex: true },
  },
  {
    path: '/pago/respuesta',
    name: 'PaymentResponse',
    component: () => import('@/views/PaymentResponseView.vue'),
    meta: { focus: true, noindex: true },
  },

  // Flota y contenido
  { path: '/vehiculos', name: 'Fleet', component: () => import('@/views/FleetView.vue'), meta: { seoKey: 'fleet' } },
  { path: '/vehiculos/:slug', name: 'Category', component: () => import('@/views/CategoryView.vue') },
  {
    path: '/alquiler-autos-aeropuerto-guayaquil',
    name: 'Airport',
    component: () => import('@/views/AirportView.vue'),
    meta: { seoKey: 'airport' },
  },
  { path: '/aeropuerto', redirect: '/alquiler-autos-aeropuerto-guayaquil' },
  { path: '/empresas', name: 'Business', component: () => import('@/views/BusinessView.vue'), meta: { seoKey: 'business' } },
  {
    path: '/promociones',
    name: 'Promotions',
    component: () => import('@/views/PromotionsView.vue'),
    meta: { seoKey: 'promotions' },
  },
  {
    path: '/hoteles-aliados',
    name: 'Hotels',
    component: () => import('@/views/HotelsView.vue'),
    meta: { seoKey: 'hotels' },
  },
  {
    path: '/guias-de-viaje',
    name: 'Guides',
    component: () => import('@/views/GuidesView.vue'),
    meta: { seoKey: 'guides' },
  },
  { path: '/guias-de-viaje/:slug', name: 'Guide', component: () => import('@/views/GuideView.vue') },
  {
    path: '/preguntas-frecuentes',
    name: 'Faq',
    component: () => import('@/views/FaqView.vue'),
    meta: { seoKey: 'faq' },
  },
  {
    path: '/socio-sobre-ruedas',
    name: 'Partner',
    component: () => import('@/views/PartnerView.vue'),
    meta: { seoKey: 'partner' },
  },
  {
    path: '/ponces-renaissance',
    name: 'Renaissance',
    component: () => import('@/views/RenaissanceView.vue'),
    meta: { seoKey: 'renaissance' },
  },
  { path: '/contacto', name: 'Contact', component: () => import('@/views/ContactView.vue'), meta: { seoKey: 'contact' } },

  // Landings SEO prioritarias del brief
  {
    path: '/alquiler-autos-guayaquil',
    name: 'LandingGuayaquil',
    component: () => import('@/views/LandingView.vue'),
    meta: { seoKey: 'landing-guayaquil', landing: 'guayaquil' },
  },
  {
    path: '/alquiler-suv-guayaquil',
    name: 'LandingSuv',
    component: () => import('@/views/LandingView.vue'),
    meta: { seoKey: 'landing-suv', landing: 'suv' },
  },
  {
    path: '/alquiler-camionetas-guayaquil',
    name: 'LandingTrucks',
    component: () => import('@/views/LandingView.vue'),
    meta: { seoKey: 'landing-trucks', landing: 'trucks' },
  },
  {
    path: '/alquiler-autos-larga-duracion-guayaquil',
    name: 'LandingLongTerm',
    component: () => import('@/views/LandingView.vue'),
    meta: { seoKey: 'landing-long-term', landing: 'long-term' },
  },

  // Panel administrativo
  {
    path: '/admin/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Ingresar', guestOnly: true, layout: 'bare', noindex: true },
  },
  ...adminRoutes,

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada', noindex: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    // Cambiar solo la query (pasos del wizard) no debe saltar arriba.
    if (to.path === from.path) return false
    return { left: 0, top: 0 }
  },
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth || to.meta.guestOnly) {
    await userStore.restore()
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return { name: 'Login', query: { next: to.fullPath }, replace: true }
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return { name: 'Login', query: { next: to.fullPath }, replace: true }
  }

  if (to.meta.guestOnly && userStore.isAdmin) {
    return { path: '/admin', replace: true }
  }
})

router.afterEach((to) => {
  // Las vistas públicas fijan su título con useSeo; esto cubre las demás.
  const title = to.meta.title as string | undefined
  if (title) document.title = `${title} — ${site.name}`
  trackPageView(to.fullPath)
})

export default router
