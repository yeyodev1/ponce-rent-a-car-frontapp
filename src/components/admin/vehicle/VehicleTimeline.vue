<script setup lang="ts">
import { ref } from 'vue'
import StatusBadge from '../StatusBadge.vue'
import PhotoLightbox from '../handover/PhotoLightbox.vue'
import { reservationStatuses } from '@/config/admin'
import { damageZones, fuelLabel, logTypes, vehicleHistoryCopy as t } from '@/config/admin/ops'
import { dateTime } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { InspectionPhoto, TimelineItem } from '@/types/ops'

/** Reservas, actas y bitácora de la unidad, del más reciente al más antiguo. */
defineProps<{ items: TimelineItem[]; canDelete?: boolean }>()
const emit = defineEmits<{ delete: [item: TimelineItem] }>()

const boxPhotos = ref<InspectionPhoto[]>([])
const boxIndex = ref<number | null>(null)
function open(photos: InspectionPhoto[], i: number) {
  boxPhotos.value = photos
  boxIndex.value = i
}

function icon(item: TimelineItem): string {
  if (item.kind === 'reservation') return 'fa-solid fa-calendar-check'
  if (item.kind === 'inspection')
    return item.inspectionType === 'delivery' ? 'fa-solid fa-key' : 'fa-solid fa-flag-checkered'
  const type = item.logType as keyof typeof logTypes
  return logTypes[type]?.icon || 'fa-solid fa-gear'
}
</script>

<template>
  <ol class="tl">
    <li
      v-for="item in items"
      :key="`${item.kind}-${item.id}`"
      class="tl__item"
      :class="`tl__item--${item.kind}`"
    >
      <span class="tl__dot"><i :class="icon(item)"></i></span>
      <div class="tl__body">
        <div class="tl__row">
          <strong class="tl__title">{{ item.title }}</strong>
          <StatusBadge v-if="item.status" :status="item.status" :map="reservationStatuses" />
        </div>
        <p class="tl__meta">
          <span><i class="fa-regular fa-calendar"></i> {{ dateTime(item.at) }}</span>
          <span v-if="item.mileageKm !== undefined && item.kind === 'log'"
            ><i class="fa-solid fa-gauge"></i> {{ item.mileageKm.toLocaleString('es-EC') }} km</span
          >
          <span v-if="item.cost"
            ><i class="fa-solid fa-dollar-sign"></i> {{ money(item.cost, true) }}</span
          >
          <span v-if="item.amount"
            ><i class="fa-solid fa-receipt"></i> {{ money(item.amount) }}</span
          >
          <span v-if="item.by"><i class="fa-regular fa-user"></i> {{ item.by }}</span>
        </p>

        <template v-if="item.kind === 'inspection'">
          <p class="tl__facts">
            <span
              ><i class="fa-solid fa-gauge"></i>
              {{ (item.mileageKm || 0).toLocaleString('es-EC') }} km</span
            >
            <span><i class="fa-solid fa-gas-pump"></i> {{ fuelLabel(item.fuelLevel || 0) }}</span>
          </p>
          <ul v-if="item.damages?.length" class="tl__damages">
            <li v-for="(d, i) in item.damages" :key="i" :class="{ 'tl__damage--new': d.isNew }">
              <i class="fa-solid fa-car-burst"></i> {{ damageZones[d.zone]
              }}<template v-if="d.description"> · {{ d.description }}</template>
              <strong v-if="d.isNew"> · Nuevo</strong>
            </li>
          </ul>
          <div v-if="item.photos?.length" class="tl__photos">
            <button
              v-for="(p, i) in item.photos"
              :key="p.url"
              type="button"
              :aria-label="p.label || 'Foto'"
              @click="open(item.photos, i)"
            >
              <img :src="p.url" :alt="p.label" loading="lazy" />
            </button>
          </div>
        </template>
        <p v-else-if="item.kind === 'log' || item.detail" class="tl__detail">{{ item.detail }}</p>

        <div class="tl__acts">
          <RouterLink
            v-if="item.reservationId"
            :to="`/admin/reservas/${item.reservationId}`"
            class="tl__link"
          >
            {{ t.openReservation }} {{ item.reservationCode }}
            <i class="fa-solid fa-arrow-right"></i>
          </RouterLink>
          <button
            v-if="canDelete && item.kind === 'log'"
            type="button"
            class="tl__del"
            aria-label="Eliminar registro"
            @click="emit('delete', item)"
          >
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </div>
    </li>
    <PhotoLightbox v-model:index="boxIndex" :photos="boxPhotos" />
  </ol>
</template>

<style scoped lang="scss">
.tl {
  list-style: none;
  @include flex(column, stretch, flex-start, 0);

  &__item {
    position: relative;
    @include flex(row, flex-start, flex-start, 0.8rem);
    padding-bottom: 1.1rem;

    &::before {
      content: '';
      position: absolute;
      left: 17px;
      top: 36px;
      bottom: 0;
      width: 2px;
      background: $line;
    }

    &:last-of-type::before {
      display: none;
    }
  }

  &__dot {
    flex: 0 0 36px;
    height: 36px;
    border-radius: 50%;
    background: $blue-soft;
    color: $blue-deep;
    @include flex(row, center, center);
    font-size: 0.85rem;
  }

  &__item--inspection &__dot {
    background: $success-bg;
    color: $success;
  }

  &__item--log &__dot {
    background: $warning-bg;
    color: $warning;
  }

  &__body {
    flex: 1;
    min-width: 0;
    @include flex(column, stretch, flex-start, 0.35rem);
    padding: 0.7rem 0.85rem;
    border: 1px solid $line;
    border-radius: 12px;
    background: $surface;
  }

  &__row {
    @include flex(row, center, space-between, 0.5rem);
    flex-wrap: wrap;
  }

  &__title {
    font-size: 0.9rem;
  }

  &__meta,
  &__facts {
    @include flex(row, center, flex-start, 0.2rem 0.8rem);
    flex-wrap: wrap;
    font-size: 0.74rem;
    color: $ink-muted;

    i {
      margin-right: 0.2rem;
    }
  }

  &__facts {
    font-size: 0.84rem;
    font-weight: 700;
    color: $ink;
  }

  &__detail {
    font-size: 0.84rem;
    color: $ink-soft;
  }

  &__damages {
    list-style: none;
    font-size: 0.8rem;
    color: $ink-soft;
    @include flex(column, stretch, flex-start, 0.2rem);

    i {
      color: $warning;
      margin-right: 0.2rem;
    }
  }

  &__damage--new {
    color: $danger;

    i {
      color: $danger;
    }
  }

  &__photos {
    @include flex(row, center, flex-start, 0.35rem);
    overflow-x: auto;

    img {
      width: 68px;
      height: 52px;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &__acts {
    @include flex(row, center, space-between, 0.5rem);

    &:empty {
      display: none;
    }
  }

  &__link {
    font-size: 0.78rem;
    font-weight: 800;
    color: $blue;
    min-height: 32px;
    @include flex(row, center, flex-start, 0.3rem);
  }

  &__del {
    margin-left: auto;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: $danger;
  }
}
</style>
