<script setup lang="ts">
import type { Product } from '#types/gql';
import { ProductsOrderByEnum } from '#gql/default';

const { cart, toggleCart, isCartMutating } = useCart();

const { data: productData } = await useAsyncGql('getProducts', { first: 5, orderby: ProductsOrderByEnum.TOTAL_SALES });
const popularProducts = computed<Product[]>(() => (productData.value?.products?.nodes as Product[]) || []);
</script>

<template>
  <div class="fixed top-0 bottom-0 right-0 z-50 overflow-x-hidden bg-white dark:bg-gray-800 shadow-lg lg:max-w-5xl">
    <div class="relative flex h-full">
      <!-- Left column: popular products -->
      <aside class="hidden lg:flex lg:w-80 xl:w-50 flex-col border-r border-gray-200 dark:border-gray-700">
        <div class="px-6 pt-8 pb-4">
          <div class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
            Bestsellers
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 pb-8 smooth-scrollbar">
          <div v-if="popularProducts.length" class="flex flex-col gap-0">
            <NuxtLink
              v-for="product in popularProducts"
              :key="product.databaseId || product.slug"
              :to="product.slug ? `/product/${decodeURIComponent(product.slug)}` : undefined"
              class="group flex flex-col gap-2 p-3 hover:border-primary/40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
              <NuxtImg
                class="h-36 w-full rounded-md object-contain"
                :src="product.image?.sourceUrl || '/images/placeholder.jpg'"
                :alt="product.image?.altText || product.name || 'Product'"
                :title="product.name || undefined"
                :modifiers="{ fit: 'contain', background: 'transparent' }"
                loading="lazy" />
              <div class="min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary">
                  {{ product.name }}
                </div>
                <ProductPrice class="text-xs mt-1" :sale-price="product.salePrice ?? undefined" :regular-price="product.regularPrice ?? undefined" />
              </div>
            </NuxtLink>
          </div>
          <div v-else class="text-sm text-gray-500 dark:text-gray-400">
            <LoadingIcon class="inline-block align-middle" />
          </div>
        </div>
      </aside>

      <!-- Right column: cart -->
      <div class="relative flex flex-col flex-1 lg:max-w-lg">
        <Icon
          name="ion:close-outline"
          class="absolute p-1 rounded-lg shadow-lg top-6 left-6 md:left-8 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          size="34" 
          @click="toggleCart(false)" />

        <EmptyCart v-if="cart && !cart.isEmpty" class="rounded-lg shadow-lg p-1.5 hover:bg-red-400 hover:text-white" />

        <div class="mt-8 text-center text-gray-900 dark:text-white font-semibold">
          {{ $t('shop.cart') }}
          <span v-if="cart?.contents?.productCount"> ({{ cart?.contents?.productCount }}) </span>
        </div>

        <ClientOnly>
          <template v-if="cart && !cart.isEmpty">
            <ul class="flex flex-col flex-1 gap-4 p-6 overflow-y-scroll md:p-8 smooth-scrollbar">
              <CartCard v-for="item in cart.contents?.nodes" :key="item.key" :item />
            </ul>
            <div class="px-6 pb-8 mb-safe md:px-8 space-y-4">
              <!-- Order Summary -->
              <div class="grid gap-1 text-sm font-semibold text-gray-500 dark:text-gray-300 tabular-nums">
                <!-- Subtotal -->
                <div class="flex justify-between">
                  <span>{{ $t('shop.subtotal') }}</span>
                  <span class="text-gray-800 dark:text-gray-100" v-html="cart.subtotal" />
                </div>
                <!-- Shipping -->
                <div v-if="cart.shippingTotal" class="flex justify-between">
                  <span>{{ $t('general.shipping') }}</span>
                  <span class="text-gray-800 dark:text-gray-100">
                    {{ parseFloat(cart.shippingTotal) > 0 ? '+' : '' }} <span v-html="cart.shippingTotal"></span>
                  </span>
                </div>
                <!-- Discount -->
                <div v-if="cart.discountTotal && parseFloat(cart.rawDiscountTotal || '0') > 0" class="flex justify-between">
                  <span>{{ $t('shop.discount') }}</span>
                  <span class="text-primary dark:text-primary-light">- <span v-html="cart.discountTotal" /></span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4">
                <Button to="/cart" variant="outline" @click="toggleCart()">
                  {{ $t('shop.viewCart') }}
                </Button>
                <Button
                  :to="isCartMutating ? undefined : '/checkout'"
                  class="flex-1"
                  variant="primary"
                  @click="!isCartMutating && toggleCart()"
                  :disabled="isCartMutating">
                  {{ $t('shop.checkout') }} <span v-html="cart.total" />
                </Button>
              </div>
            </div>
          </template>
          <!-- Empty Cart Message -->
          <EmptyCartMessage v-else-if="cart && cart.isEmpty" />
          <!-- Cart Loading -->
          <div v-else class="flex flex-col items-center justify-center flex-1 mb-20">
            <LoadingIcon />
          </div>
        </ClientOnly>

        <!-- Cart Loading Overlay -->
        <div v-if="isCartMutating" class="absolute inset-0 flex items-center justify-center bg-white/25 dark:bg-gray-800/50">
          <LoadingIcon />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth, minimal scrollbar (drawer + inner lists) */
:deep(.smooth-scrollbar) {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(148, 163, 184, 0.55) transparent; /* thumb / track */
  scroll-behavior: smooth;
}

:deep(.smooth-scrollbar::-webkit-scrollbar) {
  width: 8px;
}

:deep(.smooth-scrollbar::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.smooth-scrollbar::-webkit-scrollbar-thumb) {
  background-color: rgba(148, 163, 184, 0.55);
  border-radius: 999px;
  border: 2px solid transparent; /* creates "floating" thumb */
  background-clip: padding-box;
}

:deep(.smooth-scrollbar::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(148, 163, 184, 0.75);
}
</style>
