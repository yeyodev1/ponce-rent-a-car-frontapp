<script setup lang="ts">
import { useI18n } from '@/i18n'
import { site } from '@/config/site'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { useBusiness } from '@/composables/content/useBusiness'
import { IMAGES } from '@/composables/content/images'
import PageHero from '@/components/content/PageHero.vue'
import PageSection from '@/components/content/PageSection.vue'
import ContactChannels from '@/components/content/ContactChannels.vue'
import ContactForm from '@/components/content/ContactForm.vue'
import SectionHead from '@/components/content/SectionHead.vue'

const { t } = useI18n()
const biz = useBusiness()

const { h1, intro } = usePageSeo({
  key: () => 'contact',
  fallback: () => 'content.contact.seo',
  image: () => IMAGES.contact,
  schema: () => ({
    ...businessSchema(),
    telephone: biz.phone.value,
    email: biz.email.value || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz.address.value || undefined,
      addressLocality: site.city,
      addressCountry: 'EC',
    },
    hasMap: biz.mapsUrl.value || undefined,
  }),
})
</script>

<template>
  <div class="contact">
    <PageHero
      :eyebrow="t('content.contact.eyebrow')"
      icon="fa-solid fa-headset"
      :title="h1"
      :intro="intro"
    >
      <template #actions>
        <a
          :href="`tel:${biz.phone.value}`"
          class="btn btn--primary btn--lg"
          @click="biz.onCall('contact_hero')"
        >
          <i class="fa-solid fa-phone" aria-hidden="true"></i> {{ t('common.actions.callNow') }}
        </a>
        <a
          :href="biz.waLink(t('content.cta.waMessage'))"
          target="_blank"
          rel="noopener"
          class="btn btn--whatsapp btn--lg"
          @click="biz.onWhatsapp('contact_hero')"
        >
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
          {{ t('common.actions.whatsapp') }}
        </a>
      </template>
    </PageHero>

    <PageSection
      id="contact-channels"
      :eyebrow="t('content.contact.channelsEyebrow')"
      :title="t('content.contact.channelsTitle')"
    >
      <ContactChannels />
    </PageSection>

    <section class="contact__form" aria-labelledby="contact-form-title">
      <div class="contact__inner">
        <SectionHead
          id="contact-form-title"
          :eyebrow="t('content.contact.formEyebrow')"
          :title="t('content.contact.formTitle')"
          :lead="t('content.contact.formLead')"
        />
        <div v-reveal class="contact__card">
          <ContactForm />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.contact {
  &__form {
    padding: $space-xl 0;
    background: $sand;
  }

  &__inner {
    @include container(760px);
  }
}
</style>
