<script setup lang="ts">
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import EmptyState from '@/components/admin/EmptyState.vue'
import FormRow from '@/components/admin/FormRow.vue'
import I18nField from '@/components/admin/I18nField.vue'
import { useSettings } from '@/composables/admin/useSettings'
import { useUserStore } from '@/stores/user'
import { copy } from '@/config/admin'

const { form, loading, saving, error, load, save } = useSettings()
// Configuración: el empleado la consulta; solo un administrador la guarda.
const userStore = useUserStore()
</script>

<template>
  <div>
    <PageHeader title="Configuración" subtitle="Datos del negocio que aparecen en la web, los correos y los mensajes de WhatsApp." />

    <div v-if="loading" class="settings">
      <div v-for="i in 3" :key="i" class="skeleton settings__sk"></div>
    </div>
    <EmptyState v-else-if="error" error :message="error.message" @retry="load" />

    <form v-else class="settings" @submit.prevent="save">
      <p v-if="!userStore.isAdmin" class="settings__readonly"><i class="fa-solid fa-lock"></i> {{ copy.readOnly }}</p>
      <fieldset class="settings__fields" :disabled="!userStore.isAdmin">
      <AdminCard title="Contacto" icon="fa-solid fa-address-card">
        <div class="settings__stack">
          <div>
            <label for="s-name">Nombre comercial</label>
            <input id="s-name" v-model="form.business.name" type="text" />
          </div>
          <FormRow>
            <div>
              <label for="s-phone">Teléfono</label>
              <input id="s-phone" v-model.trim="form.business.phone" type="tel" placeholder="+593998119853" />
            </div>
            <div>
              <label for="s-wa">WhatsApp (solo dígitos con código de país)</label>
              <input id="s-wa" v-model.trim="form.business.whatsapp" type="tel" inputmode="numeric" placeholder="593998119853" />
            </div>
          </FormRow>
          <div>
            <label for="s-email">Correo</label>
            <input id="s-email" v-model.trim="form.business.email" type="email" placeholder="reservas@poncesrentacar.com.ec" />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Ubicación y horario" icon="fa-solid fa-location-dot">
        <div class="settings__stack">
          <div>
            <label for="s-addr">Dirección</label>
            <input id="s-addr" v-model="form.business.address" type="text" />
          </div>
          <div>
            <label for="s-maps">Enlace de Google Maps</label>
            <input id="s-maps" v-model.trim="form.business.mapsUrl" type="url" placeholder="https://maps.app.goo.gl/…" />
          </div>
          <I18nField v-model="form.business.hours" label="Horario de atención" hint="Ej.: Lunes a domingo, 7:00 a 22:00" />
        </div>
      </AdminCard>

      <AdminCard title="Redes sociales" icon="fa-solid fa-share-nodes">
        <div class="settings__stack">
          <div class="settings__social">
            <i class="fa-brands fa-instagram"></i>
            <input v-model.trim="form.business.instagram" type="url" placeholder="https://instagram.com/…" aria-label="Instagram" />
          </div>
          <div class="settings__social">
            <i class="fa-brands fa-facebook"></i>
            <input v-model.trim="form.business.facebook" type="url" placeholder="https://facebook.com/…" aria-label="Facebook" />
          </div>
          <div class="settings__social">
            <i class="fa-brands fa-tiktok"></i>
            <input v-model.trim="form.business.tiktok" type="url" placeholder="https://tiktok.com/@…" aria-label="TikTok" />
          </div>
        </div>
      </AdminCard>

      </fieldset>

      <div v-if="userStore.isAdmin" class="settings__bar">
        <button class="btn btn--primary" type="submit" :disabled="saving">
          <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i>
          {{ saving ? copy.saving : 'Guardar configuración' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.settings {
  @include flex(column, stretch, flex-start, 1rem);
  max-width: 820px;

  &__sk {
    height: 180px;
    border-radius: 14px;
  }

  &__stack {
    @include flex(column, stretch, flex-start, 0.9rem);
  }

  &__social {
    position: relative;
    @include flex(row, center);

    i {
      position: absolute;
      left: 1rem;
      font-size: 1.05rem;
      color: $ink-soft;
    }

    input {
      padding-left: 2.7rem;
    }
  }

  &__fields {
    border: 0;
    padding: 0;
    margin: 0;
    min-width: 0;
    @include flex(column, stretch, flex-start, 1rem);
  }

  &__readonly {
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-muted;
    @include flex(row, center, flex-start, 0.4rem);
  }

  &__bar {
    position: sticky;
    bottom: calc(76px + env(safe-area-inset-bottom));
    @include flex(row, center, flex-end);
    padding: 0.75rem;
    background: rgba($paper, 0.9);
    backdrop-filter: blur(8px);
    border-radius: 16px;

    @include from('lg') {
      bottom: 1rem;
    }
  }
}
</style>
