<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { useBusiness } from '@/composables/content/useBusiness'
import InfoCard from './InfoCard.vue'

/** Canales directos: llamada, WhatsApp, correo, horario, ubicación y redes. */
const { t } = useI18n()
const biz = useBusiness()

const socials = computed(() =>
  [
    {
      key: 'instagram',
      icon: 'fa-brands fa-instagram',
      url: biz.social.value.instagram,
      label: 'Instagram',
    },
    {
      key: 'facebook',
      icon: 'fa-brands fa-facebook-f',
      url: biz.social.value.facebook,
      label: 'Facebook',
    },
    { key: 'tiktok', icon: 'fa-brands fa-tiktok', url: biz.social.value.tiktok, label: 'TikTok' },
  ].filter((s) => s.url),
)
</script>

<template>
  <div class="channels">
    <div class="channels__grid">
      <InfoCard
        v-reveal
        icon="fa-solid fa-phone"
        :title="t('content.contact.callTitle')"
        :text="biz.phoneDisplay.value"
      >
        <template #actions>
          <a
            :href="`tel:${biz.phone.value}`"
            class="btn btn--dark"
            @click="biz.onCall('contact')"
            >{{ t('common.actions.callNow') }}</a
          >
        </template>
      </InfoCard>
      <InfoCard
        v-reveal="70"
        icon="fa-brands fa-whatsapp"
        :title="t('content.contact.waTitle')"
        :text="t('content.contact.waText')"
      >
        <template #actions>
          <a
            :href="biz.waLink(t('content.cta.waMessage'))"
            target="_blank"
            rel="noopener"
            class="btn btn--whatsapp"
            @click="biz.onWhatsapp('contact')"
          >
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            {{ t('content.contact.waCta') }}
          </a>
        </template>
      </InfoCard>
      <InfoCard
        v-reveal="140"
        icon="fa-solid fa-clock"
        :title="t('content.contact.hoursTitle')"
        :text="biz.hours.value || t('content.contact.hoursFallback')"
      >
        <template v-if="biz.email.value" #actions>
          <a :href="`mailto:${biz.email.value}`" class="channels__mail">
            <i class="fa-solid fa-envelope" aria-hidden="true"></i> {{ biz.email.value }}
          </a>
        </template>
      </InfoCard>
      <InfoCard
        v-if="biz.address.value || biz.mapsUrl.value"
        v-reveal="210"
        icon="fa-solid fa-location-dot"
        :title="t('content.contact.addressTitle')"
        :text="biz.address.value || t('content.contact.addressFallback')"
      >
        <template v-if="biz.mapsUrl.value" #actions>
          <a :href="biz.mapsUrl.value" target="_blank" rel="noopener" class="btn btn--ghost">
            <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
            {{ t('content.contact.openMaps') }}
          </a>
        </template>
      </InfoCard>
    </div>

    <div v-if="socials.length" v-reveal class="channels__social">
      <p>{{ t('content.contact.follow') }}</p>
      <ul>
        <li v-for="s in socials" :key="s.key">
          <a :href="s.url" target="_blank" rel="noopener" :aria-label="s.label">
            <i :class="s.icon" aria-hidden="true"></i>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.channels {
  &__grid {
    @include flex-cards(240px, 1rem);
  }

  &__mail {
    min-height: $tap;
    @include flex(row, center, flex-start, 0.5rem);
    font-weight: 700;
    color: $blue;
    word-break: break-all;
  }

  &__social {
    margin-top: 1.5rem;
    @include flex(row, center, flex-start, 1rem);
    flex-wrap: wrap;

    p {
      font-weight: 700;
      color: $ink;
    }

    ul {
      list-style: none;
      @include flex(row, center, flex-start, 0.5rem);
    }

    a {
      width: $tap;
      height: $tap;
      border-radius: 50%;
      @include flex(row, center, center);
      background: $navy;
      color: $surface;
      font-size: 1.1rem;
      transition: transform 0.3s $ease-spring;

      @media (hover: hover) {
        &:hover {
          transform: translateY(-3px) scale(1.05);
        }
      }
    }
  }
}
</style>
