<script setup lang="ts">
import StatusBadge from '../StatusBadge.vue'
import { durations, leadSources, leadStatuses, leadStatusOrder, leadTags, locations } from '@/config/admin'
import { shortDate, timeAgo } from '@/composables/admin/helpers'
import type { LeadStatus } from '@/types'
import type { Lead } from '@/types/admin'

defineProps<{ lead: Lead }>()
const emit = defineEmits<{ move: [status: LeadStatus] }>()
</script>

<template>
  <article class="lcard" :class="{ 'lcard--human': lead.needsHuman }">
    <RouterLink :to="`/admin/leads/${lead._id}`" class="lcard__link">
      <header class="lcard__head">
        <span class="lcard__code">#{{ lead.code }}</span>
        <span class="lcard__ago">{{ timeAgo(lead.createdAt) }}</span>
      </header>
      <strong class="lcard__name">{{ lead.name || lead.phone || lead.whatsapp || 'Sin nombre' }}</strong>
      <p v-if="lead.needsHuman" class="lcard__alert"><i class="fa-solid fa-headset"></i> Pidió un asesor</p>
      <ul class="lcard__facts">
        <li v-if="lead.startDate"><i class="fa-regular fa-calendar"></i> {{ shortDate(lead.startDate) }}{{ lead.startTime ? ` · ${lead.startTime}` : '' }}</li>
        <li v-if="lead.duration"><i class="fa-regular fa-clock"></i> {{ durations[lead.duration] }}</li>
        <li v-if="lead.location"><i class="fa-solid fa-location-dot"></i> {{ locations[lead.location] || lead.location }}</li>
      </ul>
      <div class="lcard__tags">
        <span class="lcard__source">{{ leadSources[lead.source] || lead.source }}</span>
        <StatusBadge v-for="t in lead.tags.filter((x) => leadTags[x])" :key="t" :status="t" :map="leadTags" />
      </div>
    </RouterLink>
    <label class="lcard__move">
      <span class="visually-hidden">Mover a</span>
      <i class="fa-solid fa-right-left"></i>
      <select :value="lead.status" @change="emit('move', ($event.target as HTMLSelectElement).value as LeadStatus)">
        <option v-for="s in leadStatusOrder" :key="s" :value="s">{{ leadStatuses[s]?.label }}</option>
      </select>
    </label>
  </article>
</template>

<style scoped lang="scss">
.lcard {
  background: $surface;
  border: 1px solid $line;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba($navy, 0.05);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: grab;

  &:hover {
    box-shadow: $shadow-sm;
  }

  &--human {
    border-color: rgba($danger, 0.45);
    box-shadow: 0 0 0 3px $danger-bg;
  }

  &__link {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.8rem 0.9rem 0.6rem;
  }

  &__head {
    @include flex(row, center, space-between);
  }

  &__code {
    font-size: 0.72rem;
    font-weight: 800;
    color: $blue-deep;
  }

  &__ago {
    font-size: 0.7rem;
    color: $ink-muted;
  }

  &__name {
    font-size: 0.92rem;
    color: $ink;
    line-height: 1.25;
  }

  &__alert {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: 0.74rem;
    font-weight: 800;
    color: $danger;
  }

  &__facts {
    list-style: none;
    @include flex(column, flex-start, flex-start, 0.15rem);
    font-size: 0.76rem;
    color: $ink-soft;

    i {
      width: 14px;
      color: $ink-muted;
      margin-right: 0.25rem;
    }
  }

  &__tags {
    @include flex(row, center, flex-start, 0.3rem);
    flex-wrap: wrap;
  }

  &__source {
    font-size: 0.7rem;
    font-weight: 700;
    color: $ink-muted;
    background: $paper;
    padding: 0.2rem 0.5rem;
    border-radius: $radius-pill;
  }

  &__move {
    position: relative;
    @include flex(row, center, flex-start);
    margin: 0;
    border-top: 1px dashed $line;

    i {
      position: absolute;
      left: 0.9rem;
      font-size: 0.72rem;
      color: $ink-muted;
      pointer-events: none;
    }

    select {
      border: 0;
      border-radius: 0 0 14px 14px;
      min-height: 38px;
      padding: 0.4rem 0.9rem 0.4rem 2rem;
      // 16px en el celular: iOS hace zoom al enfocar campos más chicos.
      font-size: 16px;
      font-weight: 700;
      color: $ink-soft;
      background: transparent;

      @include from('md') {
        font-size: 0.8rem;
      }
      cursor: pointer;

      &:focus {
        box-shadow: none;
        background: $paper;
      }
    }
  }
}
</style>
