<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { formatDate } from '@/utils/format'
import { useRouteA } from '@/composables/useRouteA'

/** Resumen compacto de lo respondido + el código que ubica al lead. */
const emit = defineEmits<{ edit: [] }>()
const { t } = useI18n()
const { answers, lead } = useRouteA()

const chips = computed(() => {
  const out: { icon: string; label: string }[] = []
  if (answers.startDate) {
    const date = formatDate(`${answers.startDate}T12:00:00-05:00`, { weekday: 'short', year: undefined })
    const label = `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${answers.startTime}`
    out.push({ icon: 'fa-regular fa-calendar', label })
  }
  if (answers.duration) out.push({ icon: 'fa-solid fa-hourglass-half', label: t(`common.durations.${answers.duration}`) })
  if (answers.location) out.push({ icon: 'fa-solid fa-location-dot', label: t(`common.locations.${answers.location}`) })
  if (answers.passengers) {
    out.push({ icon: 'fa-solid fa-user-group', label: `${t(`common.passengers.${answers.passengers}`)} ${t('common.units.people')}` })
  }
  return out
})
</script>

<template>
  <div class="summary">
    <div v-if="lead.code" class="summary__code">
      <div>
        <p class="summary__code-label">{{ t('routeA.channel.code') }}</p>
        <p class="summary__code-value">{{ lead.code }}</p>
      </div>
      <p class="summary__code-hint">{{ t('routeA.channel.codeHint') }}</p>
    </div>
    <ul class="summary__chips">
      <li v-for="chip in chips" :key="chip.icon" class="summary__chip">
        <i :class="chip.icon"></i>{{ chip.label }}
      </li>
      <li>
        <button type="button" class="summary__edit" @click="emit('edit')">
          <i class="fa-solid fa-pen"></i>{{ t('routeA.channel.edit') }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.summary {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__code {
    @include flex(row, center, flex-start, 1rem);
    padding: 0.85rem 1rem;
    border-radius: $radius-md;
    background: $navy;
    color: $on-dark;
    box-shadow: $shadow-md;
  }

  &__code-label {
    font-size: 0.66rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: $accent;
  }

  &__code-value {
    font-family: $font-display;
    font-size: 1.6rem;
    font-weight: 900;
    font-stretch: 115%;
    line-height: 1.05;
    letter-spacing: 0.02em;
  }

  &__code-hint {
    flex: 1;
    padding-left: 1rem;
    border-left: 1px solid rgba($on-dark, 0.18);
    font-size: 0.78rem;
    line-height: 1.4;
    color: $on-dark-soft;
  }

  &__chips {
    list-style: none;
    @include flex(row, center, flex-start, 0.4rem);
    flex-wrap: wrap;
  }

  &__chip {
    @include flex(row, center, flex-start, 0.4rem);
    padding: 0.35rem 0.7rem;
    border-radius: $radius-pill;
    background: $surface;
    border: 1px solid $line;
    font-size: 0.78rem;
    font-weight: 700;
    color: $ink-soft;

    i {
      color: $blue;
    }
  }

  &__edit {
    @include flex(row, center, flex-start, 0.4rem);
    min-height: 34px;
    padding: 0.35rem 0.7rem;
    border-radius: $radius-pill;
    font-size: 0.78rem;
    font-weight: 700;
    color: $blue;
    text-decoration: underline;
    text-underline-offset: 3px;
    @include focus-ring($blue);
  }
}
</style>
