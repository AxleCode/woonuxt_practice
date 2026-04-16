<script setup lang="ts">
const { toasts, removeToast } = useToasts();
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="fixed top-4 right-4 z-[80] flex w-[min(92vw,360px)] flex-col gap-2">
        <TransitionGroup name="toast" tag="div" class="contents">
          <div
            v-for="t in toasts"
            :key="t.id"
            class="rounded-xl px-4 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-gray-100 dark:ring-white/10">
            <div class="flex items-start gap-3">
              <div class="mt-0.5">
                <Icon v-if="t.variant === 'success'" name="ion:checkmark-circle" size="18" class="text-green-500" />
                <Icon v-else-if="t.variant === 'error'" name="ion:alert-circle" size="18" class="text-red-500" />
                <Icon v-else name="ion:information-circle" size="18" class="text-blue-500" />
              </div>
              <div class="flex-1 text-sm leading-snug">
                {{ t.message }}
              </div>
              <button
                type="button"
                class="-mr-1 -mt-1 rounded-lg p-1 text-gray-500 hover:bg-black/5 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Dismiss"
                @click="removeToast(t.id)">
                <Icon name="ion:close" size="16" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: transform 220ms ease, opacity 220ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>

