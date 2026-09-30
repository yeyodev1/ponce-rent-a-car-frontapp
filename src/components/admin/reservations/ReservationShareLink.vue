<script setup lang="ts">
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import { shareCopy as t } from '@/config/admin'
import { waLink } from '@/composables/admin/helpers'
import { refObj, type AdminReservation } from '@/types/admin'

/** Enlace seguro de la reserva (sin cuenta de cliente): copiar o mandarlo por WhatsApp. */
const props = defineProps<{ r: AdminReservation; token: string }>()
const toast = useToastStore()

const url = computed(() => `${window.location.origin}/reserva/${props.r.code}?t=${props.token}`)
const customer = computed(() => refObj(props.r.customer))
const wa = computed(() => {
  const phone = customer.value?.phone
  return phone ? waLink(phone, t.message(customer.value?.name || '', props.r.code, url.value)) : ''
})

async function copy() {
  try {
    await navigator.clipboard.writeText(url.value)
    toast.success(t.copied)
  } catch {
    // Sin permiso de portapapeles: se selecciona el texto para copiarlo a mano.
    const el = document.getElementById('share-url') as HTMLInputElement | null
    el?.select()
  }
}
</script>

<template>
  <section class="share">
    <h2 class="share__title"><i class="fa-solid fa-link"></i> {{ t.title }}</h2>
    <p class="share__text">{{ t.text }}</p>
    <input id="share-url" class="share__url" type="text" :value="url" readonly aria-label="Enlace de la reserva" @focus="($event.target as HTMLInputElement).select()" />
    <div class="share__actions">
      <button class="btn btn--dark btn--sm" type="button" @click="copy"><i class="fa-regular fa-copy"></i> {{ t.copy }}</button>
      <a v-if="wa" :href="wa" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">
        <i class="fa-brands fa-whatsapp"></i> {{ t.whatsapp }}
      </a>
    </div>
  </section>
</template>

<style scoped lang="scss">
.share {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  border: 1.5px solid rgba($blue, 0.35);
  background: linear-gradient(160deg, $blue-soft, $surface 60%);
  @include flex(column, stretch, flex-start, 0.7rem);

  &__title {
    font-family: $font-principal;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $blue;
    }
  }

  &__text {
    font-size: 0.8rem;
    color: $ink-soft;
  }

  &__url {
    font-size: 0.78rem;
    font-family: ui-monospace, monospace;
    background: $surface;
  }

  &__actions {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;

    .btn {
      flex: 1 1 150px;
      // Si no caben en una fila, cada botón baja entero en vez de partir su texto.
      white-space: nowrap;
    }
  }
}
</style>
