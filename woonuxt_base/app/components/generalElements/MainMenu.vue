<script setup lang="ts">
const { wishlistLink, navigateToLogin } = useAuth();
const route = useRoute();
</script>

<template>
  <nav class="rey-main-nav flex flex-wrap items-center gap-x-8 gap-y-2">
    <NuxtLink to="/" exact-active-class="rey-nav-link--active">{{ $t('general.home') }}</NuxtLink>
    <NuxtLink to="/products" active-class="rey-nav-link--active">{{ $t('general.products') }}</NuxtLink>
    <NuxtLink to="/categories" active-class="rey-nav-link--active">{{ $t('shop.category') }}</NuxtLink>
    <!-- <span class="rey-nav-sep" aria-hidden="true" /> -->
    <NuxtLink to="/contact" active-class="rey-nav-link--active">{{ $t('general.contact') }}</NuxtLink>
    <NuxtLink class="lg:hidden" :to="wishlistLink" :prefetch="false">Wishlist</NuxtLink>
    <NuxtLink class="lg:hidden" to="/my-account" :prefetch="false" @click="navigateToLogin(route.fullPath)">My Account</NuxtLink>
  </nav>
</template>

<style scoped>
@reference "#tailwind";

/* Rey Frankfurt–style primary nav + underline grow on hover / active (like demo) */
.rey-main-nav :deep(a:not(.lg\:hidden)) {
  @apply relative inline-block pb-1 text-[13px] font-medium uppercase tracking-[0.1em] text-[#1b1f2e] no-underline transition-colors duration-200 dark:text-gray-200;
}

.rey-main-nav :deep(a:not(.lg\:hidden)::after) {
  content: '';
  @apply pointer-events-none absolute left-0 bottom-0 h-px w-full origin-left bg-current opacity-90;
  transform: scaleX(0);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.rey-main-nav :deep(a:not(.lg\:hidden):hover) {
  @apply text-[#0f1219] dark:text-white;
}

.rey-main-nav :deep(a:not(.lg\:hidden):hover::after),
.rey-main-nav :deep(a.rey-nav-link--active:not(.lg\:hidden)::after) {
  transform: scaleX(1);
}

.rey-main-nav :deep(a.rey-nav-link--active:not(.lg\:hidden)) {
  @apply text-[#1b1f2e] dark:text-white;
}

@media (prefers-reduced-motion: reduce) {
  .rey-main-nav :deep(a:not(.lg\:hidden)::after) {
    transition-duration: 0.01ms;
  }
}

.rey-nav-sep {
  @apply hidden h-3 w-px shrink-0 self-center bg-gray-300 lg:inline-block dark:bg-gray-600;
}

/* Mobile extra links: keep readable, not full Rey bar */
.rey-main-nav :deep(a.lg\:hidden) {
  @apply text-sm text-gray-600 dark:text-gray-300;
}
</style>
