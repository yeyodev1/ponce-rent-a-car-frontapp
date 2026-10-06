<script setup lang="ts">
import { ref } from 'vue'
import StatusBadge from '../StatusBadge.vue'
import FuelGauge from './FuelGauge.vue'
import PhotoLightbox from './PhotoLightbox.vue'
import {
  checklistItems,
  damageSeverities,
  damageZones,
  fuelLabel,
  handoverCopy as t,
} from '@/config/admin/ops'
import { dateTime } from '@/composables/admin/helpers'
import type { Inspection, InspectionPhoto } from '@/types/ops'

/** Acta ya registrada, solo lectura. "Corregir" lo decide el padre (solo admin). */
defineProps<{ insp: Inspection; canFix?: boolean }>()
const emit = defineEmits<{ fix: [] }>()

const boxPhotos = ref<InspectionPhoto[]>([])
const boxIndex = ref<number | null>(null)
function open(photos: InspectionPhoto[], i: number) {
  boxPhotos.value = photos
  boxIndex.value = i
}
</script>

<template>
  <article class="insp">
    <header class="insp__head">
      <h3 class="insp__title">
        <i :class="insp.type === 'delivery' ? 'fa-solid fa-key' : 'fa-solid fa-flag-checkered'"></i>
        {{ insp.type === 'delivery' ? t.delivery : t.return }}
      </h3>
      <button v-if="canFix" type="button" class="insp__fix" @click="emit('fix')">
        <i class="fa-solid fa-pen"></i> {{ t.fix }}
      </button>
    </header>
    <p class="insp__meta">
      <span><i class="fa-regular fa-calendar"></i> {{ dateTime(insp.performedAt) }}</span>
      <span v-if="insp.performedBy?.name"
        ><i class="fa-regular fa-user"></i> {{ t.by }}: {{ insp.performedBy.name }}</span
      >
      <span v-if="insp.customerAgreedName"
        ><i class="fa-solid fa-signature"></i> {{ t.agreedBy }}: {{ insp.customerAgreedName }}</span
      >
    </p>

    <div class="insp__facts">
      <div class="insp__fact">
        <span>{{ t.km }}</span>
        <strong>{{ insp.mileageKm.toLocaleString('es-EC') }} km</strong>
      </div>
      <div class="insp__fact insp__fact--fuel">
        <span>{{ t.fuel }}</span>
        <FuelGauge :model-value="insp.fuelLevel" readonly class="insp__gauge" />
        <span class="visually-hidden">{{ fuelLabel(insp.fuelLevel) }}</span>
      </div>
    </div>

    <div v-if="insp.photos.length" class="insp__gallery">
      <button
        v-for="(p, i) in insp.photos"
        :key="p.url"
        type="button"
        class="insp__photo"
        @click="open(insp.photos, i)"
      >
        <img :src="p.url" :alt="p.label" loading="lazy" />
        <span v-if="p.label">{{ p.label }}</span>
      </button>
    </div>

    <div class="insp__block">
      <p class="insp__sub">{{ t.damages }} ({{ insp.damages.length }})</p>
      <ul v-if="insp.damages.length" class="insp__damages">
        <li v-for="(d, i) in insp.damages" :key="i" :class="{ 'insp__damage--new': d.isNew }">
          <StatusBadge :status="d.severity" :map="damageSeverities" />
          <span class="insp__dtext"
            ><strong>{{ damageZones[d.zone] }}</strong
            ><template v-if="d.description"> · {{ d.description }}</template></span
          >
          <span v-if="d.isNew" class="insp__new">{{ t.newBadge }}</span>
          <button
            v-if="d.photo"
            type="button"
            class="insp__dphoto"
            aria-label="Ver foto del daño"
            @click="open([{ url: d.photo, label: damageZones[d.zone] }], 0)"
          >
            <img :src="d.photo" alt="" />
          </button>
        </li>
      </ul>
      <p v-else class="insp__muted">{{ t.noDamages }}</p>
    </div>

    <div class="insp__block">
      <p class="insp__sub">{{ t.checklist }}</p>
      <ul class="insp__checks">
        <li
          v-for="(item, key) in checklistItems"
          :key="key"
          :class="{ 'insp__check--off': !insp.checklist[key] }"
        >
          <i :class="insp.checklist[key] ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
          {{ item.label }}
        </li>
      </ul>
    </div>

    <p v-if="insp.notes" class="insp__notes">
      <i class="fa-regular fa-comment"></i> {{ insp.notes }}
    </p>
    <PhotoLightbox v-model:index="boxIndex" :photos="boxPhotos" />
  </article>
</template>

<style scoped lang="scss">
.insp {
  @include flex(column, stretch, flex-start, 0.7rem);
  padding: 0.9rem;
  border: 1px solid $line;
  border-radius: 14px;
  background: $surface;

  &__head {
    @include flex(row, center, space-between, 0.5rem);
  }

  &__title {
    font-family: $font-principal;
    font-size: 0.92rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.45rem);

    i {
      color: $blue;
    }
  }

  &__fix {
    font-size: 0.8rem;
    font-weight: 800;
    color: $blue;
    min-height: 36px;
    padding: 0 0.4rem;
  }

  &__meta {
    @include flex(row, center, flex-start, 0.25rem 0.8rem);
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: $ink-muted;

    i {
      margin-right: 0.2rem;
    }
  }

  &__facts {
    @include flex(row, stretch, flex-start, 0.5rem);
  }

  &__fact {
    flex: 1;
    min-width: 0;
    background: $paper;
    border-radius: 12px;
    padding: 0.6rem 0.7rem;
    @include flex(column, flex-start, center, 0.15rem);

    span {
      font-size: 0.7rem;
      font-weight: 700;
      color: $ink-muted;
    }

    strong {
      font-size: 1.15rem;
    }

    &--fuel {
      align-items: center;
    }
  }

  &__gauge {
    max-width: 150px;
    transform: scale(0.9);
  }

  &__gallery {
    @include flex(row, stretch, flex-start, 0.4rem);
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }

  &__photo {
    flex: 0 0 96px;
    @include flex(column, stretch, flex-start, 0.2rem);
    font-size: 0.68rem;
    font-weight: 700;
    color: $ink-muted;

    img {
      width: 96px;
      height: 72px;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &__sub {
    font-size: 0.8rem;
    font-weight: 800;
    color: $ink-soft;
    margin-bottom: 0.35rem;
  }

  &__damages,
  &__checks {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.35rem);
    font-size: 0.82rem;
  }

  &__damages li {
    @include flex(row, center, flex-start, 0.45rem);
    flex-wrap: wrap;
    padding: 0.4rem 0.5rem;
    border-radius: 10px;
    background: $paper;

    &.insp__damage--new {
      outline: 1.5px solid $danger;
      background: $danger-bg;
    }
  }

  &__dtext {
    flex: 1;
    min-width: 0;
  }

  &__new {
    font-size: 0.66rem;
    font-weight: 800;
    text-transform: uppercase;
    color: $surface;
    background: $danger;
    border-radius: $radius-pill;
    padding: 0.15rem 0.5rem;
  }

  &__dphoto img {
    width: 44px;
    height: 34px;
    object-fit: cover;
    border-radius: 6px;
  }

  &__checks {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.3rem 0.9rem;

    i {
      color: $success;
      width: 1rem;
    }
  }

  &__check--off {
    color: $ink-muted;

    i {
      color: $danger;
    }
  }

  &__notes {
    font-size: 0.84rem;
    color: $ink-soft;
    font-style: italic;
  }

  &__muted {
    font-size: 0.82rem;
    color: $ink-muted;
  }
}
</style>
