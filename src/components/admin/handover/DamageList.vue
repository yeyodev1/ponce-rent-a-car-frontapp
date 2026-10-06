<script setup lang="ts">
import { computed } from 'vue'
import CarDiagram from './CarDiagram.vue'
import { damageSeverities, damageZones, handoverCopy as t } from '@/config/admin/ops'
import type { DamageSeverity, DamageZone, InspectionDamage } from '@/types/ops'

/**
 * Daños del acta. En la devolución muestra los de la entrega y marca como
 * nuevo lo que aparece en una zona que estaba limpia (igual que el servidor).
 */
const props = defineProps<{
  damages: InspectionDamage[]
  before?: InspectionDamage[] | null
  upload: (file: File) => Promise<string>
}>()
const emit = defineEmits<{ add: [zone: DamageZone]; open: [url: string] }>()

const beforeZones = computed(() => new Set((props.before || []).map((d) => d.zone)))
const isNew = (d: InspectionDamage) =>
  Boolean(props.before) && (d.isNew || !beforeZones.value.has(d.zone))
const marked = computed(() => [
  ...beforeZones.value,
  ...props.damages.filter((d) => !isNew(d)).map((d) => d.zone),
])
const fresh = computed(() => props.damages.filter(isNew).map((d) => d.zone))

async function onPhoto(e: Event, d: InspectionDamage) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const url = await props.upload(file)
  if (url) d.photo = url
}

const remove = (i: number) => props.damages.splice(i, 1)
</script>

<template>
  <div class="dmg">
    <p class="dmg__hint">{{ t.damagesHint }}</p>
    <CarDiagram :marked="marked" :fresh="fresh" @pick="(z) => emit('add', z)" />

    <div v-if="before" class="dmg__before">
      <p class="dmg__sub"><i class="fa-solid fa-clock-rotate-left"></i> {{ t.deliveryDamages }}</p>
      <ul v-if="before.length" class="dmg__mini">
        <li v-for="(d, i) in before" :key="i">
          <strong>{{ damageZones[d.zone] }}</strong> · {{ damageSeverities[d.severity].label
          }}<template v-if="d.description"> · {{ d.description }}</template>
          <button v-if="d.photo" type="button" class="dmg__link" @click="emit('open', d.photo)">
            <i class="fa-regular fa-image"></i>
          </button>
        </li>
      </ul>
      <p v-else class="dmg__hint">{{ t.noDamages }}</p>
    </div>

    <ul v-if="damages.length" class="dmg__list">
      <li
        v-for="(d, i) in damages"
        :key="i"
        class="dmg__item"
        :class="{ 'dmg__item--new': isNew(d) }"
      >
        <div class="dmg__head">
          <select v-model="d.zone" class="dmg__zone" aria-label="Zona">
            <option v-for="(label, z) in damageZones" :key="z" :value="z">{{ label }}</option>
          </select>
          <span v-if="isNew(d)" class="dmg__new">{{ t.newBadge }}</span>
          <button type="button" class="dmg__del" aria-label="Quitar daño" @click="remove(i)">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
        <input
          v-model="d.description"
          type="text"
          maxlength="300"
          :placeholder="t.damageDescPh"
          :aria-label="t.damageDesc"
        />
        <div class="dmg__sev" role="radiogroup" :aria-label="t.severity">
          <button
            v-for="(def, key) in damageSeverities"
            :key="key"
            type="button"
            class="dmg__sevbtn"
            :class="[`dmg__sevbtn--${key}`, { 'dmg__sevbtn--on': d.severity === key }]"
            :aria-pressed="d.severity === key"
            @click="d.severity = key as DamageSeverity"
          >
            {{ def.label }}
          </button>
        </div>
        <div class="dmg__foot">
          <label class="dmg__photo">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              class="visually-hidden"
              @change="(e) => onPhoto(e, d)"
            />
            <i class="fa-solid fa-camera"></i> {{ t.damagePhoto }}
          </label>
          <button v-if="d.photo" type="button" class="dmg__thumb" @click="emit('open', d.photo)">
            <img :src="d.photo" alt="" />
          </button>
          <label v-if="before && beforeZones.has(d.zone)" class="dmg__check">
            <input v-model="d.isNew" type="checkbox" /> {{ t.markNew }}
          </label>
        </div>
      </li>
    </ul>
    <p v-else class="dmg__hint">{{ t.noDamages }}</p>
  </div>
</template>

<style scoped lang="scss">
.dmg {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__sub {
    font-size: 0.8rem;
    font-weight: 800;
    color: $ink-soft;
    margin-bottom: 0.3rem;
  }

  &__before {
    background: $sand;
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
  }

  &__mini {
    list-style: none;
    font-size: 0.82rem;
    color: $ink-soft;
    @include flex(column, stretch, flex-start, 0.25rem);
  }

  &__link {
    color: $blue;
    margin-left: 0.3rem;
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.6rem);
  }

  &__item {
    @include flex(column, stretch, flex-start, 0.5rem);
    padding: 0.75rem;
    border: 1.5px solid $line;
    border-radius: 12px;
    background: $surface;

    &--new {
      border-color: $danger;
      box-shadow: 0 0 0 3px $danger-bg;
    }
  }

  &__head {
    @include flex(row, center, flex-start, 0.5rem);
  }

  &__zone {
    flex: 1;
    min-height: 42px;
    padding-block: 0.4rem;
    font-weight: 700;
  }

  &__new {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    color: $surface;
    background: $danger;
    border-radius: $radius-pill;
    padding: 0.2rem 0.55rem;
  }

  &__del {
    width: 42px;
    height: 42px;
    color: $danger;
    border-radius: 10px;
  }

  &__sev {
    @include flex(row, stretch, flex-start, 0.4rem);
  }

  &__sevbtn {
    flex: 1;
    min-height: 42px;
    border-radius: 10px;
    border: 1.5px solid $line;
    font-size: 0.85rem;
    font-weight: 700;
    color: $ink-soft;

    &--on.dmg__sevbtn--minor {
      background: $accent-soft;
      border-color: $accent-deep;
      color: $ink;
    }

    &--on.dmg__sevbtn--moderate {
      background: $warning-bg;
      border-color: $warning;
      color: $ink;
    }

    &--on.dmg__sevbtn--severe {
      background: $danger-bg;
      border-color: $danger;
      color: $danger;
    }
  }

  &__foot {
    @include flex(row, center, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__photo {
    margin: 0;
    min-height: 40px;
    padding: 0.4rem 0.8rem;
    border-radius: $radius-pill;
    background: $sand;
    font-size: 0.82rem;
    font-weight: 700;
    color: $ink;
    cursor: pointer;
    @include flex(row, center, center, 0.35rem);
  }

  &__thumb img {
    width: 52px;
    height: 40px;
    object-fit: cover;
    border-radius: 8px;
  }

  &__check {
    margin: 0;
    @include flex(row, center, flex-start, 0.4rem);

    input {
      width: 20px;
      min-height: 20px;
      height: 20px;
    }
  }
}
</style>
