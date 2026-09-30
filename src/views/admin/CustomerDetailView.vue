<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import EmptyState from '@/components/admin/EmptyState.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import LatestList from '@/components/admin/dashboard/LatestList.vue'
import AdminDrawer from '@/components/admin/AdminDrawer.vue'
import LicenseFacts from '@/components/admin/customers/LicenseFacts.vue'
import CustomerEditForm from '@/components/admin/customers/CustomerEditForm.vue'
import { useCustomerEdit } from '@/composables/admin/useCustomerEdit'
import { adminService } from '@/services/admin.service'
import { copy, languages, licenseCopy, leadSources, leadStatuses, reservationStatuses, verificationStatuses } from '@/config/admin'
import { es, shortDate, telLink, timeAgo, waLink } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { ApiError } from '@/types'
import type { CustomerDetail } from '@/types/admin'

const route = useRoute()
const c = ref<CustomerDetail | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    c.value = await adminService.customer(String(route.params.id))
  } catch (e) {
    error.value = e as ApiError
  } finally {
    loading.value = false
  }
}
onMounted(load)
const edit = useCustomerEdit(c)

const facts = computed(() =>
  c.value
    ? [
        { label: c.value.documentType === 'passport' ? 'Pasaporte' : 'Cédula', value: c.value.documentNumber },
        { label: 'Correo', value: c.value.email },
        { label: 'Teléfono', value: c.value.phone },
        { label: 'País', value: c.value.country },
        { label: 'Nacimiento', value: c.value.birthDate },
        { label: 'Idioma', value: languages[c.value.language] },
        { label: 'Rentas', value: String(c.value.totalRentals || 0) },
      ].filter((f) => f.value)
    : [],
)

const reservations = computed(() =>
  (c.value?.reservations || []).map((r) => ({
    id: r._id,
    to: `/admin/reservas/${r._id}`,
    code: r.code,
    title: es(r.categoryName) || r.categorySlug,
    meta: `${shortDate(r.pickupAt)} – ${shortDate(r.returnAt)} · ${money(r.pricing?.total || 0)}`,
    status: r.status,
  })),
)

const leads = computed(() =>
  (c.value?.leads || []).map((l) => ({
    id: l._id,
    to: `/admin/leads/${l._id}`,
    code: l.code,
    title: leadSources[l.source] || l.source,
    meta: timeAgo(l.createdAt),
    status: l.status,
  })),
)
</script>

<template>
  <div class="cdetail">
    <PageHeader :title="c?.name || 'Cliente'" back="/admin/clientes" :subtitle="c ? `Cliente desde ${shortDate(c.createdAt)}` : undefined">
      <template v-if="c">
        <a v-if="c.phone" :href="waLink(c.phone, `Hola ${c.name.split(' ')[0]}, te saludamos de Ponce's Rent a Car.`)" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">
          <i class="fa-brands fa-whatsapp"></i> WhatsApp
        </a>
        <a v-if="c.phone" :href="telLink(c.phone)" class="btn btn--ghost btn--sm"><i class="fa-solid fa-phone"></i> Llamar</a>
        <button class="btn btn--dark btn--sm" type="button" @click="edit.start"><i class="fa-solid fa-pen"></i> {{ licenseCopy.edit }}</button>
      </template>
    </PageHeader>

    <div v-if="loading" class="skeleton cdetail__sk"></div>
    <EmptyState v-else-if="error || !c" error :message="error?.message" @retry="load" />

    <div v-else class="cdetail__grid">
      <AdminCard title="Datos" icon="fa-solid fa-id-card">
        <template #actions>
          <StatusBadge :status="c.verification" :map="verificationStatuses" icon />
          <StatusBadge v-if="c.isClubMember" status="club" label="Renaissance" tone="accent" />
        </template>
        <dl class="cdetail__facts">
          <div v-for="f in facts" :key="f.label">
            <dt>{{ f.label }}</dt>
            <dd>{{ f.value }}</dd>
          </div>
        </dl>
        <p v-if="c.notes" class="cdetail__notes">{{ c.notes }}</p>
      </AdminCard>
      <AdminCard :title="licenseCopy.title" icon="fa-regular fa-id-card">
        <LicenseFacts :number="c.licenseNumber" :expires-at="c.licenseExpiresAt" :country="c.licenseCountry" />
      </AdminCard>
      <AdminCard title="Reservas" icon="fa-solid fa-calendar-check" flush>
        <LatestList :rows="reservations" :map="reservationStatuses" empty="Sin reservas." />
      </AdminCard>
      <AdminCard title="Leads" icon="fa-solid fa-inbox" flush>
        <LatestList :rows="leads" :map="leadStatuses" empty="Sin leads asociados." />
      </AdminCard>
    </div>

    <AdminDrawer :open="edit.open.value" :title="licenseCopy.edit" :subtitle="c?.name" @close="edit.open.value = false">
      <CustomerEditForm :form="edit.form" :errors="edit.errors.value" />
      <template #footer>
        <button class="btn btn--ghost btn--sm" type="button" @click="edit.open.value = false">{{ copy.cancel }}</button>
        <button class="btn btn--primary btn--sm" type="button" :disabled="edit.saving.value || !edit.valid.value" @click="edit.save">
          <i v-if="edit.saving.value" class="fa-solid fa-spinner fa-spin"></i> {{ edit.saving.value ? copy.saving : copy.save }}
        </button>
      </template>
    </AdminDrawer>
  </div>
</template>

<style scoped lang="scss">
.cdetail {
  &__grid {
    @include flex-cards(320px, 1rem);
  }

  &__sk {
    height: 320px;
    border-radius: 14px;
  }

  &__facts {
    @include flex(column, stretch, flex-start);

    div {
      @include flex(row, baseline, space-between, 1rem);
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba($line, 0.7);
    }

    dt {
      font-size: 0.78rem;
      font-weight: 700;
      color: $ink-muted;
    }

    dd {
      font-size: 0.9rem;
      font-weight: 600;
      text-align: right;
      overflow-wrap: anywhere;
    }
  }

  &__notes {
    margin-top: 0.8rem;
    font-size: 0.86rem;
    background: $paper;
    border-radius: 10px;
    padding: 0.6rem 0.8rem;
  }
}
</style>
