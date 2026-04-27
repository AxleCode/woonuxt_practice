<script setup>
const { cart, isCartMutating } = useCart();

const formatRupiah = (value) => {
  const number = Math.abs(parseFloat(value || 0))
  return new Intl.NumberFormat('id-ID').format(number)
}
</script>

<template>
  <aside
    v-if="cart"
    class="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 mb-8 w-full min-h-70 p-4 sm:p-8 relative md:max-w-md md:top-32 md:sticky">
    <h2 class="mb-6 text-xl font-semibold leading-none dark:text-white">{{ $t('shop.orderSummary') }}</h2>

    <ul class="flex flex-col gap-4 overflow-y-auto">
      <CartCard v-for="item in cart.contents.nodes" :key="item.key" :item />
    </ul>

    <AddCoupon class="my-8" />

    <div class="grid gap-1 text-sm font-semibold text-gray-500 dark:text-gray-300">
      <div class="flex justify-between">
        <span>{{ $t('shop.subtotal') }}</span>
        <span class="text-gray-800 dark:text-gray-100 tabular-nums" v-html="cart.subtotal" />
      </div>
      <div class="flex justify-between">
        <span>{{ $t('general.shipping') }}</span>
        <span class="text-gray-800 dark:text-gray-100 tabular-nums">
          {{ parseFloat(cart.shippingTotal) > 0 ? '+' : '' }} <span v-html="cart.shippingTotal"></span>
        </span>
      </div>
      <Transition name="scale-y" mode="out-in">
        <div v-if="cart && cart.appliedCoupons" class="flex justify-between">
          <span>{{ $t('shop.discount') }}</span>
          <span class="text-primary dark:text-primary-light tabular-nums">- <span v-html="cart.discountTotal" /></span>
        </div>
      </Transition>

      <!-- Additional Fees (Payment Fee, Handling, etc) -->
      <div v-for="fee in (Array.isArray(cart.fees) ? cart.fees : cart.fees ? [cart.fees] : [])" :key="fee.id || fee.name" class="flex justify-between">
        <span>{{ fee.name }}</span>
        <span class="font-medium tabular-nums" :class="{ 'text-primary dark:text-primary-light': parseFloat(fee.amount || 0) < 0 }">
            - Rp{{ formatRupiah(fee.amount) }}
        </span>
      </div>

      <div class="flex justify-between mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <span class="text-base">{{ $t('shop.total') }}</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white tabular-nums" v-html="cart.total" />
      </div>
    </div>

    <slot></slot>

    <div v-if="isCartMutating" class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50">
      <LoadingIcon />
    </div>
  </aside>
</template>
