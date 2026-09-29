<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

/** Niveles del club. Todos marcados "Próximamente" hasta que el cliente defina beneficios. */
const { t } = useI18n()

const levels = computed(() =>
  (['explorer', 'traveler', 'renaissance'] as const).map((k, i) => ({
    key: k,
    icon: ['fa-solid fa-compass', 'fa-solid fa-plane-departure', 'fa-solid fa-crown'][i],
    name: t(`content.renaissance.levels.${k}.name`),
    text: t(`content.renaissance.levels.${k}.text`),
    perks: [1, 2].map((n) => t(`content.renaissance.levels.${k}.perk${n}`)),
  })),
)
</script>

<template>
  <ol class="levels">
    <li
      v-for="(l, i) in levels"
      :key="l.key"
      v-reveal="i * 120"
      class="levels__item"
      :class="`levels__item--${l.key}`"
    >
      <div class="levels__top">
        <span class="levels__icon" aria-hidden="true"><i :class="l.icon"></i></span>
        <span class="levels__step">{{ t('content.renaissance.level', { n: i + 1 }) }}</span>
      </div>
      <h3 class="levels__name">{{ l.name }}</h3>
      <p class="levels__text">{{ l.text }}</p>
      <ul class="levels__perks">
        <li v-for="p in l.perks" :key="p">
          <i class="fa-solid fa-check" aria-hidden="true"></i> {{ p }}
        </li>
      </ul>
      <span class="levels__soon">{{ t('content.renaissance.soon') }}</span>
    </li>
  </ol>
</template>

<style scoped lang="scss">
$gold: #e9c46a;

.levels {
  list-style: none;
  @include flex(column, stretch, flex-start, 1rem);
  counter-reset: lvl;

  @include from('lg') {
    flex-direction: row;
    gap: 1.25rem;
  }

  &__item {
    position: relative;
    flex: 1 1 0;
    padding: 1.75rem 1.4rem;
    border-radius: $radius-lg;
    border: 1px solid rgba($gold, 0.18);
    background: linear-gradient(160deg, rgba($on-dark, 0.06), rgba($on-dark, 0.01));
    @include flex(column, flex-start, flex-start, 0.6rem);
    transition:
      transform 0.4s $ease,
      border-color 0.4s ease;

    @media (hover: hover) {
      &:hover {
        transform: translateY(-6px);
        border-color: rgba($gold, 0.5);
      }
    }

    &--renaissance {
      border-color: rgba($gold, 0.45);
      background: linear-gradient(160deg, rgba($gold, 0.14), rgba($gold, 0.02));
      box-shadow: 0 20px 60px rgba($gold, 0.1);
    }
  }

  &__top {
    width: 100%;
    @include flex(row, center, space-between, 0.5rem);
  }

  &__icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    @include flex(row, center, center);
    border: 1px solid rgba($gold, 0.45);
    color: $gold;
    font-size: 1.2rem;
  }

  &__step {
    font-size: $text-xs;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba($on-dark, 0.55);
  }

  &__name {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 800;
    font-stretch: 125%;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: $surface;
  }

  &__text {
    color: $on-dark-soft;
    font-size: $text-sm;
  }

  &__perks {
    list-style: none;
    @include flex(column, flex-start, flex-start, 0.35rem);
    font-size: $text-sm;
    color: $on-dark;

    i {
      color: $gold;
      margin-right: 0.35rem;
    }
  }

  &__soon {
    margin-top: auto;
    padding: 0.3rem 0.8rem;
    border-radius: $radius-pill;
    border: 1px dashed rgba($gold, 0.6);
    color: $gold;
    font-size: $text-xs;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
}
</style>
