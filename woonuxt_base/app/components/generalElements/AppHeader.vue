<script setup lang="ts">
const { isShowingSearch } = useSearching();

const isScrolled = ref(false);

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = (window.scrollY || 0) > 10;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
});
</script>

<template>
  <div>
    <header
      class="fixed top-0 left-0 right-0 z-40 min-h-20 transition-colors bg-white"
      :class="
        isScrolled
          ? 'bg-white shadow-sm shadow-gray-100 border-b border-gray-100 dark:bg-gray-800/95 dark:border-gray-700 dark:shadow-gray-900'
          : 'bg-transparent border-b border-transparent'
      ">
      <div class="px-15">
        <div class="flex min-h-26 items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <!-- Left: menu (desktop) / trigger (mobile) -->
          <div class="flex items-center gap-3">
            <MenuTrigger class="lg:hidden" />
            <MainMenu class="hidden lg:flex" />
          </div>

          <!-- Center: logo -->
          <div class="flex justify-center">
            <Logo class="w-28 sm:w-32" />
          </div>

          <!-- Right: search + icons -->
          <div class="flex items-center justify-end gap-4">
            <ProductSearch class="hidden lg:inline-flex max-w-80 w-[320px]" />
            <SearchTrigger class="lg:hidden" />
            <div class="flex items-center gap-4">
              <SignInLink />
              <CartTrigger />
            </div>
          </div>
        </div>

        <Transition name="scale-y" mode="out-in">
          <div class="pb-3 -mt-1 sm:hidden" v-if="isShowingSearch">
            <ProductSearch class="flex w-full" />
          </div>
        </Transition>
      </div>
    </header>

    <!-- Spacer so fixed header doesn't overlap content -->
    <div class="h-26" />
  </div>
</template>
