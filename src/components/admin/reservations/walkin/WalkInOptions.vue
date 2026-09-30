<script setup lang="ts">
import { walkInCopy as t } from '@/config/admin'
import { es } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { WalkInForm } from '@/composables/admin/useWalkIn'
import type { Coverage, Extra } from '@/types'

/** Kilometraje, cobertura y extras: los mismos que ve el cliente en la web. */
const props = defineProps<{ form: WalkInForm; coverages: Coverage[]; extras: Extra[] }>()

function setQty(code: string, qty: number, max: number) {
  props.form.extras[code] = Math.max(0, Math.min(qty, max || 1))
}
</script>

<template>
  <fieldset class="wopts">
    <legend class="wopts__legend"><i class="fa-solid fa-sliders"></i> {{ t.options }}</legend>

    <div>
      <p class="wopts__label">{{ t.mileage }}</p>
      <div class="wopts__seg" role="radiogroup" :aria-label="t.mileage">
        <label v-for="m in (['limited', 'unlimited'] as const)" :key="m" class="wopts__opt" :class="{ 'wopts__opt--on': form.mileage === m }">
          <input v-model="form.mileage" type="radio" name="wi-mileage" :value="m" class="visually-hidden" />
          {{ m === 'limited' ? t.limited : t.unlimited }}
        </label>
      </div>
    </div>

    <div v-if="coverages.length">
      <label for="wi-cov">{{ t.coverage }}</label>
      <select id="wi-cov" v-model="form.coverage">
        <option v-for="c in coverages" :key="c.code" :value="c.code">
          {{ es(c.name) || c.code }}{{ c.pricePerDay ? ` · +${money(c.pricePerDay)}/día` : '' }}
        </option>
      </select>
    </div>

    <div v-if="extras.length">
      <p class="wopts__label">{{ t.extras }}</p>
      <ul class="wopts__extras">
        <li v-for="x in extras" :key="x.code" class="wopts__extra">
          <span class="wopts__extra-name">
            <i :class="`fa-solid ${x.icon || 'fa-plus'}`"></i>
            {{ es(x.name) || x.code }}
            <small>{{ money(x.price) }}{{ x.pricing === 'per_day' ? '/día' : '' }}</small>
          </span>
          <span class="wopts__qty">
            <button type="button" :aria-label="`Quitar ${es(x.name)}`" :disabled="!form.extras[x.code]" @click="setQty(x.code, (form.extras[x.code] || 0) - 1, x.maxQuantity)">
              <i class="fa-solid fa-minus"></i>
            </button>
            <strong>{{ form.extras[x.code] || 0 }}</strong>
            <button type="button" :aria-label="`Agregar ${es(x.name)}`" :disabled="(form.extras[x.code] || 0) >= (x.maxQuantity || 1)" @click="setQty(x.code, (form.extras[x.code] || 0) + 1, x.maxQuantity)">
              <i class="fa-solid fa-plus"></i>
            </button>
          </span>
        </li>
      </ul>
    </div>
  </fieldset>
</template>

<style scoped lang="scss">
.wopts {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  @include flex(column, stretch, flex-start, 0.9rem);

  &__legend {
    font-family: $font-principal;
    font-size: 0.9rem;
    font-weight: 800;
    color: $ink;
    padding: 0;
    margin-bottom: 0.2rem;
    @include flex(row, center, flex-start, 0.45rem);

    i {
      color: $blue;
    }
  }

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
    margin-bottom: 0.4rem;
  }

  &__seg {
    @include flex(row, stretch, flex-start, 0.4rem);
  }

  &__opt {
    flex: 1;
    margin: 0;
    min-height: 42px;
    @include flex(row, center, center);
    border-radius: 12px;
    border: 1.5px solid $line;
    background: $surface;
    font-size: 0.85rem;
    font-weight: 700;
    color: $ink-soft;
    cursor: pointer;

    &--on {
      border-color: $blue;
      background: $blue-soft;
      color: $blue-deep;
    }

    &:focus-within {
      outline: 2px solid $blue;
      outline-offset: 2px;
    }
  }

  &__extras {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.4rem);
  }

  &__extra {
    @include flex(row, center, space-between, 0.6rem);
    padding: 0.5rem 0.7rem;
    border: 1px solid $line;
    border-radius: 12px;
    background: $surface;
  }

  &__extra-name {
    min-width: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: $ink;

    i {
      color: $ink-muted;
      margin-right: 0.3rem;
    }

    small {
      display: block;
      font-weight: 500;
      color: $ink-muted;
      font-size: 0.74rem;
    }
  }

  &__qty {
    @include flex(row, center, flex-end, 0.5rem);
    flex-shrink: 0;

    button {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: $paper;
      color: $ink;

      &:disabled {
        opacity: 0.4;
      }
    }

    strong {
      min-width: 1.2rem;
      text-align: center;
    }
  }
}
</style>
