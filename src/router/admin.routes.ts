import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'

// Rutas del panel (/admin/*). El layout 'admin' hace que App.vue no pinte el
// header ni el footer públicos; AdminLayout trae su propio marco.
const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    // requiresStaff: empleado o administrador. Las secciones de solo admin llevan requiresAdmin.
    meta: { layout: 'admin', requiresAuth: true, requiresStaff: true, noindex: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'leads',
        name: 'AdminLeads',
        component: () => import('@/views/admin/LeadsView.vue'),
        meta: { title: 'Leads' },
      },
      {
        path: 'leads/:id',
        name: 'AdminLead',
        component: () => import('@/views/admin/LeadDetailView.vue'),
        meta: { title: 'Solicitud' },
      },
      {
        path: 'reservas',
        name: 'AdminReservations',
        component: () => import('@/views/admin/ReservationsView.vue'),
        meta: { title: 'Reservas' },
      },
      {
        path: 'reservas/:id',
        name: 'AdminReservation',
        component: () => import('@/views/admin/ReservationDetailView.vue'),
        meta: { title: 'Reserva' },
      },
      {
        path: 'clientes',
        name: 'AdminCustomers',
        component: () => import('@/views/admin/CustomersView.vue'),
        meta: { title: 'Clientes' },
      },
      {
        path: 'clientes/:id',
        name: 'AdminCustomer',
        component: () => import('@/views/admin/CustomerDetailView.vue'),
        meta: { title: 'Cliente' },
      },
      {
        path: 'pagos',
        name: 'AdminPayments',
        component: () => import('@/views/admin/PaymentsView.vue'),
        meta: { title: 'Pagos' },
      },
      {
        path: 'flota',
        name: 'AdminFleet',
        component: () => import('@/views/admin/FleetView.vue'),
        meta: { title: 'Flota' },
      },
      {
        path: 'disponibilidad',
        name: 'AdminAvailability',
        component: () => import('@/views/admin/AvailabilityView.vue'),
        meta: { title: 'Disponibilidad' },
      },
      {
        path: 'tarifas',
        name: 'AdminRates',
        component: () => import('@/views/admin/RatesView.vue'),
        meta: { title: 'Tarifas y reglas' },
      },
      {
        path: 'contenido',
        name: 'AdminContent',
        component: () => import('@/views/admin/ContentView.vue'),
        meta: { title: 'Contenido' },
      },
      {
        path: 'socios',
        name: 'AdminPartners',
        component: () => import('@/views/admin/PartnersView.vue'),
        meta: { title: 'Socios sobre Ruedas' },
      },
      {
        path: 'renaissance',
        name: 'AdminRenaissance',
        component: () => import('@/views/admin/RenaissanceView.vue'),
        meta: { title: 'Renaissance' },
      },
      {
        path: 'configuracion',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SettingsView.vue'),
        meta: { title: 'Configuración' },
      },
      {
        path: 'integraciones',
        name: 'AdminIntegrations',
        component: () => import('@/views/admin/IntegrationsView.vue'),
        meta: { title: 'Integraciones', requiresAdmin: true },
      },
      {
        path: 'personal',
        name: 'AdminStaff',
        component: () => import('@/views/admin/StaffView.vue'),
        meta: { title: 'Personal', requiresAdmin: true },
      },
      {
        path: 'flota/unidades/:id',
        name: 'AdminVehicleDetail',
        component: () => import('@/views/admin/VehicleDetailView.vue'),
        meta: { title: 'Historial del vehículo' },
      },
      {
        path: 'contratos',
        name: 'AdminContracts',
        component: () => import('@/views/admin/ContractTemplatesView.vue'),
        meta: { title: 'Contrato', requiresAdmin: true },
      },
      {
        path: 'auditoria',
        name: 'AdminAudit',
        component: () => import('@/views/admin/AuditLogView.vue'),
        meta: { title: 'Registro de accesos', requiresAdmin: true },
      },
    ],
  },
]

export default adminRoutes
