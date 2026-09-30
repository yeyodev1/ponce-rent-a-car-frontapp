<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import AdminWordmark from '@/components/admin/AdminWordmark.vue'
import { loginCopy as t } from '@/config/admin'
import type { ApiError } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const toast = useToastStore()

const email = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const user = await userStore.login(email.value.trim(), password.value)
    // Entra el personal (empleado o administrador); un cliente no tiene panel.
    if (user.accountType !== 'admin' && user.accountType !== 'employee') {
      userStore.clear()
      error.value = t.notAdmin
      return
    }
    toast.success(t.hello(user.name || user.email))
    // Solo rutas internas: un "next" externo no debe sacar al usuario del sitio.
    const next = typeof route.query.next === 'string' && route.query.next.startsWith('/') ? route.query.next : '/admin'
    router.replace(next)
  } catch (e) {
    error.value = (e as ApiError).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login">
    <div class="login__glow" aria-hidden="true"></div>

    <div class="login__inner">
      <header class="login__brand">
        <AdminWordmark />
        <p>{{ t.eyebrow }}</p>
      </header>

      <form class="login__card" @submit.prevent="submit">
        <div class="login__head">
          <h1 class="login__title">{{ t.title }}</h1>
          <p class="login__subtitle">{{ t.subtitle }}</p>
        </div>

        <div class="login__field">
          <label for="email">{{ t.email }}</label>
          <div class="login__input">
            <i class="fa-regular fa-envelope"></i>
            <input id="email" v-model="email" type="email" autocomplete="email" required />
          </div>
        </div>

        <div class="login__field">
          <label for="password">{{ t.password }}</label>
          <div class="login__input">
            <i class="fa-solid fa-lock"></i>
            <input id="password" v-model="password" :type="show ? 'text' : 'password'" autocomplete="current-password" required />
            <button class="login__eye" type="button" :aria-label="show ? t.hide : t.show" @click="show = !show">
              <i :class="show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
            </button>
          </div>
        </div>

        <Transition name="rise">
          <p v-if="error" class="login__error" role="alert">
            <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
          </p>
        </Transition>

        <button class="btn btn--primary btn--lg btn--block" type="submit" :disabled="loading">
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ loading ? t.loading : t.submit }}
          <i v-if="!loading" class="fa-solid fa-arrow-right"></i>
        </button>
      </form>

      <RouterLink to="/" class="login__back"><i class="fa-solid fa-arrow-left"></i> {{ t.back }}</RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.login {
  position: relative;
  flex: 1;
  min-height: 100vh;
  min-height: 100dvh;
  @include flex(column, center, center);
  padding: 2rem 1.25rem;
  background: $navy;
  overflow: hidden;
  isolation: isolate;

  // Luz de ciudad nocturna: azul arriba, un toque amarillo abajo.
  &__glow {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(60% 45% at 15% 0%, rgba($blue, 0.45), transparent 70%),
      radial-gradient(50% 40% at 100% 100%, rgba($accent, 0.18), transparent 70%),
      repeating-linear-gradient(115deg, rgba($on-dark, 0.025) 0 2px, transparent 2px 22px);
  }

  &__inner {
    width: 100%;
    max-width: 420px;
    @include flex(column, stretch, flex-start, 1.4rem);
    animation: login-in 0.6s $ease both;
  }

  &__brand {
    @include flex(column, center, center, 0.4rem);
    text-align: center;

    :deep(.mark__main) {
      font-size: 1.9rem;
    }

    p {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba($on-dark, 0.55);
    }
  }

  &__card {
    background: $surface;
    border-radius: 22px;
    padding: 1.8rem 1.4rem;
    box-shadow: 0 30px 80px rgba(#000, 0.35);
    @include flex(column, stretch, flex-start, 1.05rem);

    @include from('sm') {
      padding: 2.2rem 2rem;
    }
  }

  &__head {
    margin-bottom: 0.3rem;
  }

  &__title {
    @include display($text-xl, 800);
    color: $navy;
  }

  &__subtitle {
    font-size: $text-sm;
    color: $ink-muted;
    margin-top: 0.35rem;
  }

  &__input {
    position: relative;
    @include flex(row, center);

    > i {
      position: absolute;
      left: 1rem;
      color: $ink-muted;
      font-size: 0.9rem;
      pointer-events: none;
    }

    input {
      padding-left: 2.6rem;
    }
  }

  &__eye {
    position: absolute;
    right: 0.35rem;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    color: $ink-muted;

    &:hover {
      color: $ink;
      background: $sand;
    }
  }

  &__error {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-sm;
    color: $danger;
    background: $danger-bg;
    padding: 0.7rem 0.9rem;
    border-radius: $radius-sm;
  }

  &__back {
    align-self: center;
    @include flex(row, center, center, 0.45rem);
    font-size: 0.82rem;
    font-weight: 700;
    color: rgba($on-dark, 0.6);

    &:hover {
      color: $accent;
    }
  }
}

@keyframes login-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}
</style>
