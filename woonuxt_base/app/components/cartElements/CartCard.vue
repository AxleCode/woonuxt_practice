<script setup>
const { updateItemQuantity } = useCart();
const { addToWishlist } = useWishlist();
const { FALLBACK_IMG } = useHelpers();
const { storeSettings } = useAppConfig();

const { item } = defineProps({
  item: { type: Object, required: true },
});

const productType = computed(() => (item.variation ? item.variation?.node : item.product?.node));
const productSlug = computed(() => `/product/${decodeURIComponent(item.product.node.slug)}`);
const isLowStock = computed(() => (productType.value.stockQuantity ? productType.value.lowStockAmount >= productType.value.stockQuantity : false));
const imgScr = computed(() => productType.value.image?.productCardSourceUrl || productType.value.image?.sourceUrl || item.product.image?.sourceUrl || FALLBACK_IMG);
const regularPrice = computed(() => parseFloat(productType.value.rawRegularPrice));
const salePrice = computed(() => parseFloat(productType.value.rawSalePrice));
const salePercentage = computed(() => Math.round(((regularPrice.value - salePrice.value) / regularPrice.value) * 100) + '%');
const isOptimisticItem = computed(() => String(item.key || '').startsWith('optimistic:'));

// Deteksi item bonus dari extraData
const isBonus = computed(() => {
  const extra = item.extraData || [];
  return extra.some((d) => d.key === 'is_bonus' && d.value === '1');
});

const removeItem = () => {
  if (isOptimisticItem.value || isBonus.value) return;
  updateItemQuantity(item.key, 0);
};

const moveToWishList = () => {
  addToWishlist(item.product.node);
  removeItem();
};
</script>

<template>
  <SwipeCard :disabled="isOptimisticItem || isBonus" @remove="removeItem">
    <div v-if="productType" class="flex items-center gap-3 group">
      <NuxtLink :to="productSlug">
        <NuxtImg
          class="w-16 h-16 rounded-md object-contain"
          :src="imgScr"
          :alt="productType.image?.altText || productType.name"
          :title="productType.image?.title || productType.name"
          fit="contain"
          :modifiers="{ fit: 'contain', bg: 'transparent' }"
          loading="lazy" />
      </NuxtLink>
      <div class="flex-1">
        <div class="flex gap-x-2 gap-y-1 flex-wrap items-center">
          <NuxtLink class="leading-tight line-clamp-2 text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary" :to="productSlug">{{
            productType.name
          }}</NuxtLink>
          <!-- Badge Bonus -->
          <span
            v-if="isBonus"
            class="text-[10px] border-emerald-200 dark:border-emerald-800 leading-none bg-emerald-100 dark:bg-emerald-900/30 inline-block p-0.5 rounded-sm text-emerald-600 dark:text-emerald-400 border">
            🎁 Bonus Gratis
          </span>
          <span
            v-if="!isBonus && productType.salePrice"
            class="text-[10px] border-green-200 dark:border-green-800 leading-none bg-green-100 dark:bg-green-900/30 inline-block p-0.5 rounded-sm text-green-600 dark:text-green-400 border">
            Save {{ salePercentage }}
          </span>
          <span
            v-if="isLowStock"
            class="text-[10px] border-yellow-200 dark:border-yellow-800 leading-none bg-yellow-100 dark:bg-yellow-900/30 inline-block p-0.5 rounded-sm text-orange-500 dark:text-orange-400 border">
            Low Stock
          </span>
        </div>
        <!-- Harga: tampilkan "Gratis" untuk item bonus -->
        <template v-if="isBonus">
          <div class="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 line-through-original">
            <span class="line-through text-gray-400 dark:text-gray-500 mr-1">{{ productType.regularPrice }}</span>
            <span>Gratis</span>
          </div>
        </template>
        <ProductPrice v-else class="mt-1 text-xs" :sale-price="productType.salePrice" :regular-price="productType.regularPrice" />
      </div>
      <div class="inline-flex gap-2 flex-col items-end">
        <!-- Item bonus: hanya tampilkan qty, tanpa kontrol ubah/hapus -->
        <template v-if="isBonus">
          <span class="text-sm text-gray-500 dark:text-gray-400">Qty. {{ item.quantity }}</span>
        </template>
        <template v-else>
          <QuantityInput :item />
          <div class="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 flex leading-none items-center">
            <button
              v-if="storeSettings.showMoveToWishlist"
              class="mr-2 pr-2 border-r border-gray-300 dark:border-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isOptimisticItem"
              @click="moveToWishList"
              type="button">
              Move to Wishlist
            </button>
            <button
              title="Remove Item"
              aria-label="Remove Item"
              @click="removeItem"
              type="button"
              :disabled="isOptimisticItem"
              class="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
              <Icon name="ion:trash" class="hidden md:inline-block" size="12" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </SwipeCard>
</template>
