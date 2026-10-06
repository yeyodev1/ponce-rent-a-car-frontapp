<script setup lang="ts">
import { useI18n } from '@/i18n'
import type { CategoryUnit } from '@/types'
import SmartImage from './SmartImage.vue'

/**
 * Unidades reales de la categoría como dato secundario: se vende la categoría
 * y se asigna una de estas (o similar). Sin placas ni datos internos.
 */
// slug (v1.3): cada unidad tiene su ficha pública en /vehiculos/:categoria/:unidad.
type Unit = CategoryUnit & { slug?: string }
const props = defineProps<{ units: Unit[]; categorySlug: string }>()
const { t } = useI18n()

const title = (u: Unit) => [u.brand, u.model].filter(Boolean).join(' ')
const link = (u: Unit) => (u.slug ? `/vehiculos/${props.categorySlug}/${u.slug}` : '')
</script>

<template>
  <div class="units">
    <p class="units__note"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> {{ t('content.category.units.note') }}</p>
    <ul class="units__list">
      <li v-for="(u, i) in units" :key="`${title(u)}-${u.year}-${i}`" v-reveal="(i % 4) * 60" class="units__card">
        <component
          :is="link(u) ? 'RouterLink' : 'div'"
          :to="link(u) || undefined"
          class="units__link"
          :aria-label="link(u) ? t('content.category.units.view', { name: `${title(u)} ${u.year || ''}`.trim() }) : undefined"
        >
          <SmartImage
            :src="u.image"
            :alt="t('content.category.units.photoAlt', { name: title(u) })"
            ratio="16 / 10"
            sizes="(min-width: 1024px) 260px, 50vw"
          />
          <div class="units__body">
            <h3 class="units__name">{{ title(u) }} <small v-if="u.year">{{ u.year }}</small></h3>
            <ul class="units__specs">
              <li>
                <i class="fa-solid fa-gears" aria-hidden="true"></i>
                {{ u.transmission === 'manual' ? t('content.specs.manual') : t('content.specs.automatic') }}
              </li>
              <li v-if="u.fuel">
                <i class="fa-solid fa-gas-pump" aria-hidden="true"></i> {{ t(`content.category.units.fuel.${u.fuel}`) }}
              </li>
              <li v-if="u.seats">
                <i class="fa-solid fa-user-group" aria-hidden="true"></i> {{ t('content.category.units.seats', { n: u.seats }) }}
              </li>
            </ul>
            <span v-if="link(u)" class="units__more">{{ t('content.category.units.more') }} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
          </div>
        </component>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.units {
  @include flex(column, stretch, flex-start, 1rem);

  &__note {
    font-size: $text-sm;
    color: $ink-soft;
    @include flex(row, center, flex-start, 0.45rem);

    i {
      color: $blue;
    }
  }

  &__list {
    list-style: none;
    @include flex-cards(150px, 0.75rem);

    // Tope por columna: una unidad suelta no se estira a lo ancho de la fila.
    > * {
      max-width: calc(50% - 0.375rem);
    }

    @include from('md') {
      > * {
        flex-basis: 200px;
        max-width: calc(33.333% - 0.5rem);
      }
    }

    @include from('lg') {
      > * {
        max-width: calc(25% - 0.57rem);
      }
    }
  }

  &__card {
    @include card;
    border-radius: $radius-md;
    overflow: hidden;
    @include flex(column, stretch, flex-start);
  }

  &__link {
    @include flex(column, stretch, flex-start);
    height: 100%;
    color: inherit;
    text-decoration: none;

    &:focus-visible {
      @include focus-ring($blue);
    }
  }

  &__more {
    margin-top: 0.2rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: $blue;

    i {
      font-size: 0.65rem;
      transition: transform 0.18s $ease;
    }
  }

  &__card:hover &__more i {
    transform: translateX(3px);
  }

  &__body {
    padding: 0.7rem 0.8rem 0.85rem;
    @include flex(column, stretch, flex-start, 0.4rem);
  }

  &__name {
    font-family: $font-principal;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0;
    color: $ink;
    line-height: 1.25;

    small {
      font-weight: 600;
      color: $ink-muted;
    }
  }

  &__specs {
    list-style: none;
    @include flex(column, flex-start, flex-start, 0.2rem);
    font-size: 0.78rem;
    color: $ink-soft;

    i {
      width: 16px;
      color: $ink-muted;
      margin-right: 0.2rem;
    }
  }
}
</style>
