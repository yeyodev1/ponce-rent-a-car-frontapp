<script setup lang="ts">
import { walkInCopy as t } from '@/config/admin'
import { es } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { Quote } from '@/types'

/** Cotización en vivo del servidor: lo que se cobrará queda congelado al crear. */
defineProps<{ quote: Quote | null; loading: boolean; failed: boolean; warnings: string[] }>()
</script>

<template>
  <section class="wquote" aria-live="polite">
    <header class="wquote__head">
      <h3><i class="fa-solid fa-receipt"></i> {{ t.quote }}</h3>
      <span v-if="loading" class="wquote__loading"><i class="fa-solid fa-spinner fa-spin"></i> {{ t.quoteLoading }}</span>
      <span v-else-if="quote" class="wquote__days">{{ t.days(quote.days) }}</span>
    </header>

    <p v-if="!quote && !loading" class="wquote__muted">{{ failed ? t.quoteError : t.quoteEmpty }}</p>

    <template v-if="quote">
      <ul class="wquote__lines" :class="{ 'wquote__lines--stale': loading }">
        <li v-for="l in quote.lines" :key="l.key">
          <span>{{ es(l.label) || l.key }}</span>
          <strong>{{ money(l.amount) }}</strong>
        </li>
      </ul>
      <div class="wquote__total">
        <span>{{ t.total }}</span>
        <strong>{{ money(quote.total) }}</strong>
      </div>
      <p class="wquote__units" :class="{ 'wquote__units--none': !quote.availableUnits }">
        <i :class="quote.availableUnits ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
        {{ quote.availableUnits ? t.available(quote.availableUnits) : t.unavailable }}
      </p>
      <p v-for="w in warnings" :key="w" class="wquote__warn"><i class="fa-solid fa-triangle-exclamation"></i> {{ w }}</p>
    </template>
  </section>
</template>

<style scoped lang="scss">
.wquote {
  padding: 1rem;
  border-radius: 14px;
  background: $surface;
  border: 1.5px solid $line;
  @include flex(column, stretch, flex-start, 0.6rem);

  &__head {
    @include flex(row, center, space-between, 0.5rem);

    h3 {
      font-family: $font-principal;
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0;
      @include flex(row, center, flex-start, 0.45rem);

      i {
        color: $blue;
      }
    }
  }

  &__loading,
  &__days {
    font-size: 0.76rem;
    font-weight: 700;
    color: $ink-muted;
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__lines {
    list-style: none;
    transition: opacity 0.2s ease;

    &--stale {
      opacity: 0.5;
    }

    li {
      @include flex(row, baseline, space-between, 1rem);
      padding: 0.35rem 0;
      font-size: 0.84rem;
      color: $ink-soft;
      border-bottom: 1px dashed $line;
    }

    strong {
      color: $ink;
      white-space: nowrap;
    }
  }

  &__total {
    @include flex(row, baseline, space-between);
    font-weight: 800;

    strong {
      font-family: $font-display;
      font-size: 1.4rem;
    }
  }

  &__units {
    font-size: 0.8rem;
    font-weight: 700;
    color: $success;
    @include flex(row, center, flex-start, 0.4rem);

    &--none {
      color: $danger;
    }
  }

  &__warn {
    font-size: 0.78rem;
    color: $warning;
    font-weight: 600;
  }
}
</style>
