/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_META_PIXEL_ID: string
  readonly VITE_GA4_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    seoKey?: string
    landing?: string
    focus?: boolean
    noindex?: boolean
    layout?: 'public' | 'admin' | 'bare'
    requiresAuth?: boolean
    requiresStaff?: boolean
    requiresAdmin?: boolean
    guestOnly?: boolean
  }
}
