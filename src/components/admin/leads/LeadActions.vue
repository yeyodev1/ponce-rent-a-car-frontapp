<script setup lang="ts">
import { computed } from 'vue'
import { copy, leadStatuses, leadStatusOrder } from '@/config/admin'
import { telLink, waLink } from '@/composables/admin/helpers'
import { refId, refObj, type Lead } from '@/types/admin'
import type { LeadStatus } from '@/types'

const props = defineProps<{ lead: Lead; saving?: boolean }>()
const emit = defineEmits<{ status: [value: LeadStatus]; delete: [] }>()

const phone = computed(() => props.lead.whatsapp || props.lead.phone)
const wa = computed(() =>
  phone.value ? waLink(phone.value, copy.whatsappGreeting(props.lead.name, props.lead.code)) : '',
)
const tel = computed(() => telLink(props.lead.phone || props.lead.whatsapp))
const reservation = computed(() => refObj(props.lead.reservation))
const reservationId = computed(() => refId(props.lead.reservation))
const customerId = computed(() => refId(props.lead.customer))
</script>

<template>
  <aside class="acts">
    <div class="acts__contact">
      <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="btn btn--whatsapp btn--block">
        <i class="fa-brands fa-whatsapp"></i> Conversar por WhatsApp
      </a>
      <a v-if="tel" :href="tel" class="btn btn--ghost btn--block"><i class="fa-solid fa-phone"></i> Llamar</a>
      <p v-if="!wa && !tel" class="acts__muted">El lead no dejó teléfono todavía.</p>
      <p v-if="phone" class="acts__phone">{{ phone }}<template v-if="lead.email"> · {{ lead.email }}</template></p>
      <p v-else-if="lead.email" class="acts__phone">{{ lead.email }}</p>
    </div>

    <div class="acts__block">
      <label for="lead-status">Estado</label>
      <select id="lead-status" :value="lead.status" :disabled="saving" @change="emit('status', ($event.target as HTMLSelectElement).value as LeadStatus)">
        <option v-for="s in leadStatusOrder" :key="s" :value="s">{{ leadStatuses[s]?.label }}</option>
      </select>
    </div>

    <div v-if="reservationId || customerId" class="acts__links">
      <RouterLink v-if="reservationId" :to="`/admin/reservas/${reservationId}`" class="acts__link">
        <i class="fa-solid fa-calendar-check"></i>
        <span>Reserva {{ reservation?.code || '' }}</span>
        <i class="fa-solid fa-chevron-right"></i>
      </RouterLink>
      <RouterLink v-if="customerId" :to="`/admin/clientes/${customerId}`" class="acts__link">
        <i class="fa-solid fa-user"></i>
        <span>Ficha del cliente</span>
        <i class="fa-solid fa-chevron-right"></i>
      </RouterLink>
    </div>

    <button class="acts__delete" type="button" @click="emit('delete')">
      <i class="fa-regular fa-trash-can"></i> Eliminar lead
    </button>
  </aside>
</template>

<style scoped lang="scss">
.acts {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 1.1rem);

  &__contact {
    @include flex(column, stretch, flex-start, 0.55rem);
  }

  &__phone {
    font-size: 0.8rem;
    color: $ink-muted;
    text-align: center;
    overflow-wrap: anywhere;
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__links {
    @include flex(column, stretch, flex-start, 0.4rem);
  }

  &__link {
    @include flex(row, center, flex-start, 0.65rem);
    padding: 0.75rem 0.9rem;
    border-radius: 12px;
    background: $blue-soft;
    color: $blue-deep;
    font-size: 0.88rem;
    font-weight: 700;

    span {
      flex: 1;
    }

    &:hover {
      background: darken($blue-soft, 3%);
    }
  }

  &__delete {
    align-self: flex-start;
    font-size: 0.82rem;
    font-weight: 700;
    color: $danger;
    padding: 0.4rem 0;
    @include flex(row, center, flex-start, 0.45rem);
  }
}
</style>
