<template>
  <div class="csk" aria-hidden="true">
    <div class="csk__img skeleton"></div>
    <div class="csk__body">
      <div class="csk__line skeleton" style="width: 55%"></div>
      <div class="csk__line skeleton" style="width: 80%"></div>
      <div class="csk__line skeleton" style="width: 65%"></div>
      <div class="csk__btn skeleton"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.csk {
  @include card;
  border-radius: $radius-lg;
  overflow: hidden;

  &__img {
    aspect-ratio: 16 / 10;
    border-radius: 0;
  }

  &__body {
    padding: 1.2rem;
    @include flex(column, stretch, flex-start, 0.7rem);
  }

  &__line {
    height: 14px;
  }

  &__btn {
    height: $tap;
    border-radius: $radius-pill;
    margin-top: 0.5rem;
  }
}
</style>
