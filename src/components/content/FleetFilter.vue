<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from '@/i18n'
import { useCatalogStore } from '@/stores/catalog'

/** Fechas opcionales + categoría en chips. La disponibilidad se pinta en cada tarjeta. */
interface FilterState {
  pickup: string
  dropoff: string
  category: string
  today: string
  maxDays: number
  pickupMax: string
  returnMin: string
  invalid: boolean
  hasDates: boolean
  loading: boolean
  failed: boolean
  retry: () => void
  clear: () => void
}

const props = defineProps<{ f: FilterState }>()
const { t, tx } = useI18n()
const catalog = useCatalogStore()

const chips = computed(() => [...catalog.categories].sort((a, b) => a.order - b.order))

function pick(slug: string) {
  props.f.category = props.f.category === slug ? '' : slug
}

// En móvil los chips se deslizan: si se entra ya filtrado (?categoria=van)
// el chip activo queda fuera de la vista y parece que se muestra "Todas".
const strip = ref<HTMLElement | null>(null)
watch(
  () => [props.f.category, chips.value.length],
  async () => {
    await nextTick()
    const el = strip.value
    const on = el?.querySelector<HTMLElement>('.ffilter__chip--on')
    if (!el || !on || el.scrollWidth <= el.clientWidth) return
    const x = on.offsetLeft - el.offsetLeft
    if (x < el.scrollLeft || x + on.offsetWidth > el.scrollLeft + el.clientWidth) el.scrollLeft = x - 18
  },
  { immediate: true },
)
</script>

<template>
  <section class="ffilter" aria-labelledby="ffilter-title">
    <div class="ffilter__head">
      <h2 id="ffilter-title" class="ffilter__title">
        <i class="fa-regular fa-calendar-check" aria-hidden="true"></i> {{ t('content.fleet.filter.title') }}
      </h2>
      <p class="ffilter__text">{{ t('content.fleet.filter.text') }}</p>
    </div>

    <div class="ffilter__dates">
      <div class="ffilter__field">
        <label for="ff-pickup">{{ t('content.fleet.filter.pickup') }}</label>
        <input id="ff-pickup" v-model="f.pickup" type="date" :min="f.today" :max="f.pickupMax" />
      </div>
      <div class="ffilter__field">
        <label for="ff-return">{{ t('content.fleet.filter.return') }}</label>
        <input id="ff-return" v-model="f.dropoff" type="date" :min="f.returnMin" :aria-invalid="f.invalid" />
      </div>
      <button v-if="f.pickup || f.dropoff" type="button" class="ffilter__clear" @click="f.clear()">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i> {{ t('content.fleet.filter.clear') }}
      </button>
    </div>

    <p v-if="f.invalid" class="ffilter__note ffilter__note--err" role="alert">{{ t('content.fleet.filter.returnBefore') }}</p>
    <p v-else-if="f.loading" class="ffilter__note" aria-live="polite">
      <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> {{ t('content.fleet.filter.checking') }}
    </p>
    <p v-else-if="f.failed" class="ffilter__note ffilter__note--err" role="alert">
      {{ t('content.fleet.filter.error') }}
      <button type="button" class="ffilter__retry" @click="f.retry()">{{ t('common.actions.retry') }}</button>
    </p>
    <p v-else class="ffilter__note">{{ t('content.fleet.filter.window', { n: f.maxDays }) }}</p>

    <div ref="strip" class="ffilter__chips" role="group" :aria-label="t('content.fleet.filter.categories')">
      <button type="button" class="ffilter__chip" :class="{ 'ffilter__chip--on': !f.category }" :aria-pressed="!f.category" @click="f.category = ''">
        {{ t('content.fleet.filter.all') }}
      </button>
      <button
        v-for="c in chips"
        :key="c.slug"
        type="button"
        class="ffilter__chip"
        :class="{ 'ffilter__chip--on': f.category === c.slug }"
        :aria-pressed="f.category === c.slug"
        @click="pick(c.slug)"
      >
        {{ tx(c.name) }}
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ffilter {
  @include card;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: 1.1rem;
  @include flex(column, stretch, flex-start, 0.85rem);

  @include from('md') {
    padding: 1.4rem 1.6rem;
  }

  &__title {
    @include display($text-lg);
    color: $ink;
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $blue;
    }
  }

  &__text {
    margin-top: 0.2rem;
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__dates {
    @include flex(row, flex-end, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__field {
    flex: 1 1 140px;
    min-width: 0;

    label {
      margin-bottom: 0.3rem;
    }

    input {
      width: 100%;
      min-height: $tap;
    }
  }

  &__clear {
    flex: 0 0 auto;
    min-height: $tap;
    padding: 0 0.9rem;
    border-radius: $radius-pill;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;
    @include flex(row, center, center, 0.35rem);

    &:hover {
      background: $sand;
      color: $ink;
    }
  }

  &__note {
    font-size: 0.8rem;
    color: $ink-muted;

    &--err {
      color: $danger;
      font-weight: 600;
    }
  }

  &__retry {
    margin-left: 0.35rem;
    font-weight: 800;
    text-decoration: underline;
    color: inherit;
  }

  // Chips deslizables con el pulgar; en escritorio se acomodan en filas.
  &__chips {
    @include flex(row, center, flex-start, 0.45rem);
    overflow-x: auto;
    scrollbar-width: none;
    margin-inline: -1.1rem;
    padding: 0.1rem 1.1rem 0.2rem;

    &::-webkit-scrollbar {
      display: none;
    }

    @include from('md') {
      flex-wrap: wrap;
      overflow: visible;
      margin-inline: 0;
      padding-inline: 0;
    }
  }

  &__chip {
    flex-shrink: 0;
    min-height: 40px;
    padding: 0 1rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      border-color: $line-strong;
    }

    &--on {
      background: $navy;
      border-color: $navy;
      color: $surface;
    }
  }
}
</style>
