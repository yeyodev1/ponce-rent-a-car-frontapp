<script setup lang="ts">
import { useI18n } from '@/i18n'
import { phoneLink, site, whatsappLink } from '@/config/site'
import { track } from '@/composables/useAnalytics'
import BrandLogo from '@/components/brand/BrandLogo.vue'
import LangSwitch from './LangSwitch.vue'
import { linkByKey } from './navLinks'

const { t } = useI18n()
const year = new Date().getFullYear()

const columns = [
  { title: 'common.footer.explore', links: ['vehicles', 'airport', 'promotions', 'hotels', 'guides'].map(linkByKey) },
  { title: 'common.footer.company', links: ['business', 'renaissance', 'partner', 'faq', 'contact'].map(linkByKey) },
]

const socials = [
  { key: 'instagram', icon: 'fa-brands fa-instagram', url: site.social.instagram, label: 'Instagram' },
  { key: 'facebook', icon: 'fa-brands fa-facebook-f', url: site.social.facebook, label: 'Facebook' },
  { key: 'tiktok', icon: 'fa-brands fa-tiktok', url: site.social.tiktok, label: 'TikTok' },
]
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <RouterLink to="/" class="footer__logo" :aria-label="site.name">
          <BrandLogo variant="light" slogan />
        </RouterLink>
        <p class="footer__tagline">{{ t('common.footer.tagline') }}</p>
        <div class="footer__lang">
          <span>{{ t('common.lang.label') }}</span>
          <LangSwitch />
        </div>
      </div>

      <nav v-for="col in columns" :key="col.title" class="footer__col" :aria-label="t(col.title)">
        <h2 class="footer__title">{{ t(col.title) }}</h2>
        <RouterLink v-for="link in col.links" :key="link.key" :to="link.to" class="footer__link">
          {{ t(`common.nav.${link.key}`) }}
        </RouterLink>
      </nav>

      <div class="footer__col">
        <h2 class="footer__title">{{ t('common.footer.contact') }}</h2>
        <a :href="phoneLink" class="footer__link footer__link--icon" @click="track('call_click', { from: 'footer' })">
          <i class="fa-solid fa-phone"></i>{{ site.phoneDisplay }}
        </a>
        <a
          :href="whatsappLink()"
          target="_blank"
          rel="noopener"
          class="footer__link footer__link--icon"
          @click="track('whatsapp_open', { from: 'footer' })"
        >
          <i class="fa-brands fa-whatsapp"></i>WhatsApp
        </a>
        <p class="footer__city"><i class="fa-solid fa-location-dot"></i>{{ site.city }}, Ecuador</p>
        <div class="footer__social" :aria-label="t('home.layout.followUs')">
          <a
            v-for="s in socials"
            :key="s.key"
            :href="s.url"
            target="_blank"
            rel="noopener"
            class="footer__social-link"
            :aria-label="s.label"
          >
            <i :class="s.icon"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <p>© {{ year }} {{ site.name }}. {{ t('common.footer.legal') }}</p>
      <!-- La foto del inicio es CC BY-SA 4.0: la licencia exige citar autoría. -->
      <p class="footer__photo">
        {{ t('common.footer.photo') }}
        <a
          href="https://commons.wikimedia.org/wiki/File:Vista_cerro_santa_ana.jpg"
          target="_blank"
          rel="noopener"
        >Paulakindsvater</a>
        · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>
      </p>
      <p>
        {{ t('common.footer.madeBy') }}
        <a href="https://bakano.ec" target="_blank" rel="noopener" class="footer__bakano">Bakano</a>
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  position: relative;
  background:
    radial-gradient(80% 60% at 100% 0%, rgba($blue, 0.18), transparent 70%),
    $navy;
  color: $on-dark;
  padding: $space-xl 0 calc(1.5rem + var(--tabbar-h));
  overflow: hidden;

  // Línea amarilla de marca en el borde superior
  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: linear-gradient(90deg, $accent, rgba($accent, 0) 70%);
  }

  &__inner {
    @include container(1280px);
    @include flex(row, flex-start, space-between, 2.5rem 2rem);
    flex-wrap: wrap;
  }

  &__brand {
    flex: 1 1 100%;
    @include flex(column, flex-start, flex-start, 1.1rem);

    @include from('lg') {
      flex: 1.4 1 0;
      max-width: 340px;
    }
  }

  &__logo {
    height: 64px;
    @include focus-ring($accent);
  }

  &__tagline {
    color: $on-dark-soft;
    font-size: $text-sm;
    max-width: 34ch;
  }

  &__lang {
    @include flex(row, center, flex-start, 0.8rem);
    font-size: $text-xs;
    color: $on-dark-soft;
  }

  &__col {
    flex: 1 1 140px;
    @include flex(column, flex-start, flex-start, 0.15rem);

    @include from('lg') {
      flex: 1 1 0;
    }
  }

  &__title {
    font-family: $font-principal;
    font-size: $text-xs;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: $accent;
    margin-bottom: 0.6rem;
  }

  &__link {
    @include flex(row, center, flex-start, 0.6rem);
    min-height: 40px;
    color: $on-dark-soft;
    font-size: 0.94rem;
    font-weight: 500;
    transition:
      color 0.2s ease,
      transform 0.25s $ease;
    @include focus-ring($accent);

    @media (hover: hover) {
      &:hover {
        color: $on-dark;
        transform: translateX(3px);
      }
    }

    i {
      width: 1rem;
      color: $accent;
    }
  }

  &__city {
    @include flex(row, center, flex-start, 0.6rem);
    min-height: 40px;
    color: $on-dark-soft;
    font-size: 0.94rem;

    i {
      width: 1rem;
      color: $accent;
    }
  }

  &__social {
    @include flex(row, center, flex-start, 0.5rem);
    margin-top: 0.6rem;
  }

  &__social-link {
    @include flex(row, center, center);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba($on-dark, 0.18);
    color: $on-dark;
    transition:
      background-color 0.25s ease,
      color 0.25s ease,
      transform 0.3s $ease-spring;
    @include focus-ring($accent);

    @media (hover: hover) {
      &:hover {
        background: $accent;
        color: $navy;
        transform: translateY(-3px);
      }
    }
  }

  &__bottom {
    @include container(1280px);
    @include flex(column, flex-start, space-between, 0.35rem);
    margin-top: $space-lg;
    padding-top: 1.25rem;
    border-top: 1px solid rgba($on-dark, 0.1);
    font-size: $text-xs;
    color: $on-dark-soft;

    @include from('md') {
      flex-direction: row;
      align-items: center;
    }
  }

  &__photo a {
    color: $on-dark;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  &__bakano {
    color: $on-dark;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: $accent;
    text-underline-offset: 3px;
    @include focus-ring($accent);
  }
}
</style>
