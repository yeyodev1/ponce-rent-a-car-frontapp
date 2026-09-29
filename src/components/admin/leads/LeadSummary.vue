<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '../StatusBadge.vue'
import {
  durations,
  languages,
  leadChannels,
  leadPriorities,
  leadSources,
  leadStatuses,
  leadTags,
  locations,
  passengers,
} from '@/config/admin'
import { dateTime, shortDate } from '@/composables/admin/helpers'
import type { Lead } from '@/types/admin'

const props = defineProps<{ lead: Lead }>()

const facts = computed(() => {
  const l = props.lead
  return [
    { icon: 'fa-solid fa-user', label: 'Cliente', value: l.name || 'Sin nombre' },
    { icon: 'fa-solid fa-building', label: 'Empresa', value: l.company ? `${l.company}${l.vehicles ? ` · ${l.vehicles} vehículos` : ''}` : '' },
    { icon: 'fa-regular fa-calendar', label: 'Fecha de inicio', value: l.startDate ? shortDate(l.startDate) : '' },
    { icon: 'fa-regular fa-clock', label: 'Hora aprox.', value: l.startTime },
    { icon: 'fa-solid fa-hourglass-half', label: 'Duración', value: durations[l.duration] || '' },
    { icon: 'fa-solid fa-location-dot', label: 'Entrega', value: locations[l.location] || l.location },
    { icon: 'fa-solid fa-users', label: 'Pasajeros', value: passengers[l.passengers] || '' },
    { icon: 'fa-solid fa-star', label: 'Prioridad', value: l.priority ? leadPriorities[l.priority] : '' },
    { icon: 'fa-solid fa-car', label: 'Vehículo buscado', value: l.specificVehicle || l.categorySlug },
    { icon: 'fa-solid fa-language', label: 'Idioma', value: languages[l.language] || l.language },
    { icon: 'fa-solid fa-comments', label: 'Canal', value: leadChannels[l.channel] || '' },
  ].filter((f) => f.value)
})

const origin = computed(() => {
  const a = props.lead.attribution || {}
  return [
    { label: 'Fuente', value: leadSources[props.lead.source] || props.lead.source },
    { label: 'utm_source', value: a.utmSource },
    { label: 'utm_medium', value: a.utmMedium },
    { label: 'Campaña', value: a.utmCampaign },
    { label: 'Anuncio', value: a.utmContent },
    { label: 'Término', value: a.utmTerm },
    { label: 'Llegó a', value: a.landingPage },
    { label: 'Referido por', value: a.referrer },
    { label: 'Clic de Meta', value: a.fbclid ? 'Sí (fbclid)' : '' },
    { label: 'Clic de Google', value: a.gclid ? 'Sí (gclid)' : '' },
  ].filter((f) => f.value)
})
</script>

<template>
  <section class="sum">
    <header class="sum__head">
      <div>
        <p class="sum__eyebrow">{{ lead.status === 'new' ? 'Nueva solicitud' : 'Solicitud' }}</p>
        <h1 class="sum__code">#{{ lead.code }}</h1>
        <p class="sum__date">Recibida el {{ dateTime(lead.createdAt) }}</p>
      </div>
      <div class="sum__badges">
        <StatusBadge :status="lead.status" :map="leadStatuses" icon />
        <StatusBadge v-for="t in lead.tags.filter((x) => leadTags[x])" :key="t" :status="t" :map="leadTags" />
      </div>
    </header>

    <div v-if="lead.needsHuman" class="sum__alert" role="alert">
      <i class="fa-solid fa-headset"></i>
      <div>
        <strong>Pidió hablar con un asesor</strong>
        <span>Escríbele cuanto antes por WhatsApp.</span>
      </div>
    </div>

    <ul class="sum__facts">
      <li v-for="f in facts" :key="f.label" class="sum__fact">
        <i :class="f.icon"></i>
        <span class="sum__label">{{ f.label }}</span>
        <span class="sum__value">{{ f.value }}</span>
      </li>
    </ul>

    <div v-if="lead.comments" class="sum__comments">
      <span class="sum__label">Comentarios del cliente</span>
      <p>{{ lead.comments }}</p>
    </div>

    <details class="sum__origin" open>
      <summary><i class="fa-solid fa-bullhorn"></i> Origen</summary>
      <dl>
        <div v-for="o in origin" :key="o.label">
          <dt>{{ o.label }}</dt>
          <dd>{{ o.value }}</dd>
        </div>
      </dl>
    </details>
  </section>
</template>

<style scoped lang="scss">
.sum {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 1rem);

  @include from('md') {
    padding: 1.5rem;
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.75rem);
    flex-wrap: wrap;
  }

  &__eyebrow {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: $red;
  }

  &__code {
    font-size: clamp(1.6rem, 1.3rem + 1.2vw, 2.2rem);
    color: $navy;
  }

  &__date {
    font-size: 0.8rem;
    color: $ink-muted;
  }

  &__badges {
    @include flex(row, center, flex-end, 0.35rem);
    flex-wrap: wrap;
  }

  &__alert {
    @include flex(row, center, flex-start, 0.8rem);
    padding: 0.85rem 1rem;
    border-radius: 14px;
    background: $danger-bg;
    color: $danger;

    i {
      font-size: 1.3rem;
    }

    div {
      @include flex(column, flex-start, center);
      line-height: 1.3;
    }

    span {
      font-size: 0.8rem;
      color: $ink-soft;
    }
  }

  &__facts {
    list-style: none;
    @include flex-cards(220px, 0.2rem 1.2rem);
  }

  &__fact {
    @include flex(row, center, flex-start, 0.6rem);
    padding: 0.55rem 0;
    border-bottom: 1px solid rgba($line, 0.7);
    min-width: 0;

    i {
      width: 18px;
      text-align: center;
      color: $blue;
      font-size: 0.85rem;
    }
  }

  &__label {
    font-size: 0.74rem;
    font-weight: 700;
    color: $ink-muted;
    flex-shrink: 0;
  }

  &__value {
    margin-left: auto;
    font-size: 0.88rem;
    font-weight: 700;
    color: $ink;
    text-align: right;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &__comments {
    background: $paper;
    border-radius: 12px;
    padding: 0.8rem 0.95rem;

    p {
      font-size: 0.9rem;
      margin-top: 0.25rem;
      white-space: pre-line;
    }
  }

  &__origin {
    summary {
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 800;
      @include flex(row, center, flex-start, 0.5rem);

      i {
        color: $blue;
      }
    }

    dl {
      @include flex-cards(180px, 0.6rem 1rem);
      margin-top: 0.75rem;
    }

    dt {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: $ink-muted;
    }

    dd {
      font-size: 0.85rem;
      overflow-wrap: anywhere;
    }
  }
}
</style>
