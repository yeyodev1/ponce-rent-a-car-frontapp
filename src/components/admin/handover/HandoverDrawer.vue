<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminDrawer from '../AdminDrawer.vue'
import FuelGauge from './FuelGauge.vue'
import PhotoCapture from './PhotoCapture.vue'
import DamageList from './DamageList.vue'
import HandoverChecklist from './HandoverChecklist.vue'
import HandoverComparison from './HandoverComparison.vue'
import PhotoLightbox from './PhotoLightbox.vue'
import HandoverSteps from './HandoverSteps.vue'
import { fuelLabel, handoverCopy as t } from '@/config/admin/ops'
import type { HandoverState } from '@/composables/admin/useHandover'
import type { InspectionPhoto } from '@/types/ops'

/** Acta por pasos, pensada para llenarse con una mano en el parqueadero. */
const props = defineProps<{ h: HandoverState; code: string }>()
const h = props.h

const isReturn = computed(() => h.form.value.type === 'return')
const before = computed(() => (isReturn.value ? h.delivery.value : null))
const last = t.steps.length - 1
const title = computed(
  () => `${isReturn.value ? t.return : t.delivery}${h.fixing.value ? ` · ${t.fix}` : ''}`,
)
const saveLabel = computed(() =>
  h.fixing.value ? t.saveFix : isReturn.value ? t.saveReturn : t.saveDelivery,
)
const km = (n: number | undefined) => (n || 0).toLocaleString('es-EC')

const boxPhotos = ref<InspectionPhoto[]>([])
const boxIndex = ref<number | null>(null)
function openPhotos(photos: InspectionPhoto[], i: number) {
  boxPhotos.value = photos
  boxIndex.value = i
}
const openUrl = (url: string) => openPhotos([{ url, label: '' }], 0)

function onKm(e: Event) {
  const n = parseInt((e.target as HTMLInputElement).value.replace(/\D/g, ''), 10)
  h.form.value.mileageKm = Number.isFinite(n) ? n : 0
}
</script>

<template>
  <AdminDrawer :open="h.open.value" :title="title" :subtitle="code" @close="h.open.value = false">
    <HandoverSteps v-model="h.step.value" :steps="t.steps" />

    <section v-if="h.step.value === 0" class="hdr__pane">
      <label for="hdr-km" class="hdr__label">{{ t.km }}</label>
      <div class="hdr__kmwrap">
        <input
          id="hdr-km"
          class="hdr__km"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :value="h.form.value.mileageKm || ''"
          autocomplete="off"
          @input="onKm"
        />
        <span>km</span>
      </div>
      <p v-if="before" class="hdr__ref">
        <i class="fa-solid fa-flag-checkered"></i> {{ t.kmAtDelivery(km(before.mileageKm)) }}
      </p>
      <p v-else-if="h.data.value?.vehicle" class="hdr__ref">
        {{ t.kmHint(km(h.data.value.vehicle.mileageKm)) }}
      </p>
      <p v-if="h.kmError.value" class="hdr__error" role="alert">{{ h.kmError.value }}</p>
      <p v-else-if="h.preview.value" class="hdr__ref hdr__ref--strong">
        {{ t.kmDriven }}: {{ km(h.preview.value.kmDriven) }} km
      </p>
    </section>

    <section v-else-if="h.step.value === 1" class="hdr__pane">
      <p class="hdr__label">{{ t.fuel }}</p>
      <FuelGauge v-model="h.form.value.fuelLevel" :compare="before?.fuelLevel ?? null" />
      <p v-if="before" class="hdr__ref hdr__ref--center">
        <i class="fa-solid fa-circle hdr__dot"></i>
        {{ t.fuelAtDelivery(fuelLabel(before.fuelLevel)) }}
      </p>
    </section>

    <section v-else-if="h.step.value === 2" class="hdr__pane">
      <p class="hdr__label">{{ t.photos }}</p>
      <PhotoCapture
        :photos="h.form.value.photos"
        :uploading="h.uploading.value"
        @add="h.addPhotos"
        @open="(i) => openPhotos(h.form.value.photos, i)"
      />
      <div v-if="before?.photos.length" class="hdr__prev">
        <p class="hdr__ref">Fotos de la entrega</p>
        <div class="hdr__strip">
          <button
            v-for="(p, i) in before.photos"
            :key="p.url"
            type="button"
            @click="openPhotos(before.photos, i)"
          >
            <img :src="p.url" :alt="p.label" loading="lazy" />
          </button>
        </div>
      </div>
    </section>

    <section v-else-if="h.step.value === 3" class="hdr__pane">
      <p class="hdr__label">{{ t.damages }}</p>
      <DamageList
        :damages="h.form.value.damages"
        :before="before?.damages ?? null"
        :upload="h.uploadOne"
        @add="h.addDamage"
        @open="openUrl"
      />
    </section>

    <section v-else-if="h.step.value === 4" class="hdr__pane">
      <p class="hdr__label">{{ t.checklist }}</p>
      <HandoverChecklist :checklist="h.form.value.checklist" :before="before?.checklist ?? null" />
    </section>

    <section v-else class="hdr__pane">
      <HandoverComparison v-if="h.preview.value" :c="h.preview.value" />
      <div>
        <label for="hdr-notes">{{ t.notes }}</label>
        <textarea
          id="hdr-notes"
          v-model="h.form.value.notes"
          maxlength="3000"
          :placeholder="t.notesPh"
        ></textarea>
      </div>
      <div>
        <label for="hdr-agreed">{{ t.agreed }}</label>
        <input
          id="hdr-agreed"
          v-model="h.form.value.customerAgreedName"
          type="text"
          maxlength="120"
          autocomplete="off"
          :placeholder="t.agreedPh"
        />
        <p class="hdr__ref">{{ t.agreedHint }}</p>
      </div>
    </section>

    <template #footer>
      <button
        v-if="h.step.value > 0"
        type="button"
        class="btn btn--ghost btn--sm"
        @click="h.step.value--"
      >
        <i class="fa-solid fa-arrow-left"></i> {{ t.back }}
      </button>
      <button
        v-if="h.step.value < last"
        type="button"
        class="btn btn--dark btn--sm hdr__next"
        @click="h.step.value++"
      >
        {{ t.next }} <i class="fa-solid fa-arrow-right"></i>
      </button>
      <button
        v-else
        type="button"
        class="btn btn--primary btn--sm hdr__next"
        :disabled="h.saving.value || h.uploading.value > 0"
        @click="h.submit()"
      >
        <i :class="h.saving.value ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-check'"></i>
        {{ h.saving.value ? t.saving : saveLabel }}
      </button>
    </template>
  </AdminDrawer>
  <PhotoLightbox v-model:index="boxIndex" :photos="boxPhotos" />
</template>

<style scoped lang="scss">
.hdr {
  &__pane {
    @include flex(column, stretch, flex-start, 0.9rem);
  }

  &__label {
    font-size: 0.95rem;
    font-weight: 800;
    color: $ink;
    margin: 0;
  }

  &__kmwrap {
    @include flex(row, center, flex-start, 0.6rem);

    span {
      font-size: 1.3rem;
      font-weight: 800;
      color: $ink-muted;
    }
  }

  &__km {
    flex: 1;
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    min-height: 76px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  &__ref {
    font-size: 0.84rem;
    color: $ink-muted;

    &--strong {
      color: $ink;
      font-weight: 800;
    }

    &--center {
      text-align: center;
    }
  }

  &__dot {
    color: $blue;
    font-size: 0.6rem;
    vertical-align: middle;
  }

  &__error {
    font-size: 0.86rem;
    font-weight: 700;
    color: $danger;
  }

  &__strip {
    @include flex(row, center, flex-start, 0.4rem);
    overflow-x: auto;
    margin-top: 0.3rem;

    img {
      width: 72px;
      height: 54px;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &__next {
    flex: 1;

    @include from('md') {
      flex: 0 0 auto;
    }
  }
}
</style>
