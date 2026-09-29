<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useBusiness } from '@/composables/content/useBusiness'

/** Kilometraje incluido, costo adicional y opción ilimitada, desde la configuración. */
const { t } = useI18n()
const biz = useBusiness()

const options = computed(() => {
  const m = biz.mileage.value
  if (!m) return []
  return [
    {
      icon: 'fa-solid fa-gauge',
      title: t('content.mileage.limited'),
      value: t('content.mileage.perDay', { km: m.limitedKmPerDay }),
      note: t('content.mileage.extra', { price: money(m.extraKmPrice, true) }),
      tag: t('content.mileage.included'),
    },
    {
      icon: 'fa-solid fa-infinity',
      title: t('content.mileage.unlimited'),
      value: `+${money(m.unlimitedPricePerDay)}${t('common.units.perDay')}`,
      note: t('content.mileage.unlimitedNote'),
      tag: '',
    },
  ]
})
</script>

<template>
  <div v-if="options.length" class="km">
    <div v-for="o in options" :key="o.icon" class="km__opt">
      <span class="km__icon" aria-hidden="true"><i :class="o.icon"></i></span>
      <div class="km__body">
        <p class="km__title">
          {{ o.title }}
          <span v-if="o.tag" class="chip chip--success">{{ o.tag }}</span>
        </p>
        <p class="km__value">{{ o.value }}</p>
        <p class="km__note">{{ o.note }}</p>
      </div>
    </div>
  </div>
  <p v-else class="km__fallback">{{ t('content.mileage.fallback') }}</p>
</template>

<style scoped lang="scss">
.km {
  @include flex-cards(220px, 0.75rem);

  &__opt {
    @include card;
    @include flex(row, flex-start, flex-start, 0.9rem);
    padding: 1.1rem;
  }

  &__icon {
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    @include flex(row, center, center);
    background: $blue-soft;
    color: $blue;
  }

  &__title {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
    font-weight: 800;
    color: $ink;
  }

  &__value {
    font-family: $font-display;
    font-size: $text-lg;
    font-weight: 800;
    color: $navy;
  }

  &__note,
  &__fallback {
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
