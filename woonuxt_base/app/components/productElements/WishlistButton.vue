<script setup lang="ts">
import type { Product } from '#types/gql';

const { addToWishlist, removeFromWishlist, isInList } = useWishlist();
const { pushToast } = useToasts();

const props = withDefaults(
  defineProps<{
    product: Product;
    variant?: 'text' | 'icon';
    showToast?: boolean;
  }>(),
  {
    variant: 'text',
    showToast: true,
  },
);

const isWishlisted = computed(() => (props.product.databaseId ? isInList(props.product.databaseId) : false));

const toggleWishlist = () => {
  const id = props.product.databaseId;
  if (!id) return;

  if (isWishlisted.value) {
    removeFromWishlist(id);
    if (props.showToast) pushToast('Removed from wishlist', 'info');
    return;
  }

  addToWishlist(props.product);
  if (props.showToast) pushToast('Added to wishlist', 'success');
};
</script>

<template>
  <button
    v-if="variant === 'icon'"
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
    :aria-label="isWishlisted ? $t('shop.wishlistRemove') : $t('shop.wishlistAdd')"
    :title="isWishlisted ? $t('shop.wishlistRemove') : $t('shop.wishlistAdd')"
    @click="toggleWishlist">
    <Icon v-if="isWishlisted" name="ion:heart" size="18" class="text-red-500" />
    <Icon v-else name="ion:heart-outline" size="18" />
  </button>

  <button v-else type="button" class="cursor-pointer flex mt-4 text-sm text-gray-400 gap-2 items-center" @click="toggleWishlist">
    <Icon v-if="isWishlisted" name="ion:heart" size="18" class="text-red-400" />
    <Icon v-else name="ion:heart-outline" size="18" />
    <span>{{ isWishlisted ? $t('shop.wishlistRemove') : $t('shop.wishlistAdd') }}</span>
  </button>
</template>
