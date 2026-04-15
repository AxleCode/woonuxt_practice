<script setup lang="ts">
import type { ProductCategory } from '#types/gql';

const props = withDefaults(
  defineProps<{
    /** Main heading in the white bar (shown uppercase) */
    title?: string;
    /** Last segment label in the breadcrumb (e.g. SHOP) */
    breadcrumbCurrent?: string;
  }>(),
  {
    title: 'Shop',
    breadcrumbCurrent: 'Shop',
  },
);

const { data } = await useAsyncGql('getProductCategories', { first: 7 });
const categoryNodes = computed<ProductCategory[]>(() => (data.value?.productCategories?.nodes as ProductCategory[]) || []);

const categoryHref = (slug: string | null | undefined) =>
  slug ? `/product-category/${decodeURIComponent(slug)}` : '/products';
</script>

<template>
  <section class="relative w-full overflow-hidden px-14">
    <NuxtImg
      width="1400"
      height="800"
      class="h-[280px] w-full object-cover object-center sm:h-[320px] rounded-[4px] md:h-[380px] lg:h-[360px]"
      src="https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/12/bg-cover.jpg"
      alt=""
      loading="eager"
      sizes="100vw"
      :preload="{ fetchPriority: 'high' }"
      placeholder
      placeholder-class="blur-xl" />

    <!-- Overlay: left-aligned blocks like Rey Frankfurt shop hero -->
    <div class="absolute inset-0 flex flex-col justify-center px-25 pt-18">
      <!-- Breadcrumb chip -->
      <nav
        class="inline-flex w-max max-w-full items-center gap-1 bg-white px-3 py-3 text-[12px] font-normal uppercase tracking-[0.04em] text-black shadow-sm"
        aria-label="Breadcrumb">
        <NuxtLink to="/" class="font-bold text-black no-underline transition-opacity px-2 hover:opacity-70">{{ $t('general.home') }}</NuxtLink>
        <span class="text-black/60 " aria-hidden="true">›</span>
        <span class="font-bold text-black/80 px-2">{{ breadcrumbCurrent }}</span>
      </nav>

      <!-- Title + category strip -->
       <div
        class="inline-flex w-full max-w-full items-center gap-0">

      <div
        class="flex w-full max-w-[min(18%,56rem)] max-h-[min(55%,56rem)] flex-col gap-5 bg-[#f3f9fc] mt-8 px-10 py-6 sm:flex-row sm:items-center">
        <h1 class="shrink-0 text-4xl mt-2 font-bold uppercase leading-none tracking-tight text-black sm:text-5xl md:text-6xl">
          {{ title }}
        </h1>

      </div>
      <div
        class="flex w-full max-w-[min(40%,56rem)] flex-col gap-5 bg-[#f3f9fc] mt-3 px-5 py-5 sm:flex-row sm:items-center">
        <ul
          class="rey-hero-category-nav flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/10 pt-4 sm:border-t-0 sm:pt-0 md:gap-x-7">
          <li>
            <NuxtLink to="/products" exact-active-class="rey-nav-link--active"> All </NuxtLink>
          </li>
          <li v-for="cat in categoryNodes" :key="cat.databaseId || cat.slug">
            <NuxtLink :to="categoryHref(cat.slug)" class="whitespace-nowrap" active-class="rey-nav-link--active">
              {{ cat.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
    </div>
  </section>
</template>

<style scoped>
@reference "#tailwind";

/* Same hover + underline animation as MainMenu.vue */
.rey-hero-category-nav :deep(a) {
  @apply relative inline-block pb-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#1b1f2e] no-underline transition-colors duration-200;
}

.rey-hero-category-nav :deep(a::after) {
  content: '';
  @apply pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left bg-current opacity-90;
  transform: scaleX(0);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.rey-hero-category-nav :deep(a:hover) {
  @apply text-[#0f1219];
}

.rey-hero-category-nav :deep(a:hover::after),
.rey-hero-category-nav :deep(a.rey-nav-link--active::after) {
  transform: scaleX(1);
}

.rey-hero-category-nav :deep(a.rey-nav-link--active) {
  @apply font-bold text-[#1b1f2e];
}

@media (prefers-reduced-motion: reduce) {
  .rey-hero-category-nav :deep(a::after) {
    transition-duration: 0.01ms;
  }
}
</style>
