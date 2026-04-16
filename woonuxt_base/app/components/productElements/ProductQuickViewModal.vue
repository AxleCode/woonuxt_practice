<script setup lang="ts">
import { ProductTypesEnum, type AddToCartInput } from '#gql/default';
import type { Product, ProductDetail } from '#types/gql';

const props = defineProps<{
  open: boolean;
  product: Product;
  productLink: string;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const { frontEndUrl } = useHelpers();
const { addToCart, toggleCart } = useCart();

const isSimpleProduct = computed(() => props.product?.type === ProductTypesEnum.SIMPLE);
const isVariableProduct = computed(() => props.product?.type === ProductTypesEnum.VARIABLE);
const isExternalProduct = computed(() => props.product?.type === ProductTypesEnum.EXTERNAL);
const canAddDirectly = computed(() => isSimpleProduct.value && !!props.product?.databaseId && !isExternalProduct.value);

const close = () => emit('update:open', false);

const productDetail = ref<ProductDetail | null>(null);
const isLoading = ref(false);

const imageSrc = computed(() => props.product?.image?.sourceUrl || '/images/placeholder.jpg');
const descriptionHtml = computed(() => productDetail.value?.shortDescription || productDetail.value?.description || '');

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    if (productDetail.value) return;
    if (!props.product?.slug) return;
    isLoading.value = true;
    try {
      const { data } = await useAsyncGql('getProduct', { slug: props.product.slug, frontEndUrl });
      productDetail.value = (data.value?.product as ProductDetail) || null;
    } catch (e) {
      console.warn('[ProductQuickViewModal] failed to load product', e);
    } finally {
      isLoading.value = false;
    }
  },
);

const isAdding = ref(false);
const handleAddToCart = async () => {
  if (!canAddDirectly.value || isAdding.value) return;
  isAdding.value = true;
  try {
    const input: AddToCartInput = { productId: props.product.databaseId, quantity: 1 };
    await addToCart(input);
    toggleCart(true);
    close();
  } finally {
    isAdding.value = false;
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close();
};

watch(
  () => props.open,
  (v) => {
    if (!import.meta.client) return;
    if (v) window.addEventListener('keydown', onKeydown);
    else window.removeEventListener('keydown', onKeydown);
  },
  { immediate: true },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[60]">
        <button type="button" class="absolute inset-0 bg-black/40" aria-label="Close quick view" @click="close" />

        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="w-full max-w-3xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/10">
            <div class="flex items-start justify-between gap-4 p-5 border-b border-gray-100 dark:border-gray-800">
              <div class="min-w-0">
                <div class="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  {{ product?.productCategories?.nodes?.[0]?.name || '' }}
                </div>
                <div class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {{ product.name }}
                </div>
              </div>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close"
                @click="close">
                <Icon name="ion:close-outline" size="22" />
              </button>
            </div>

            <div class="grid gap-6 p-5 md:grid-cols-2">
              <div class="overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
                <NuxtImg class="h-80 w-full object-contain" :src="imageSrc" :alt="product?.name || 'Product'" loading="lazy" />
              </div>

              <div class="flex flex-col">
                <ProductPrice class="text-base" :sale-price="product.salePrice ?? undefined" :regular-price="product.regularPrice ?? undefined" />

                <div class="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <div v-if="isLoading" class="text-gray-400">Loading…</div>
                  <div v-else v-html="descriptionHtml" class="prose prose-sm max-w-none dark:prose-invert" />
                </div>

                <div class="mt-6 flex gap-3">
                  <Button v-if="canAddDirectly" class="flex-1" :loading="isAdding" :disabled="isAdding" type="button" @click="handleAddToCart">
                    {{ $t('shop.addToCart') }}
                  </Button>
                  <NuxtLink v-else :to="productLink" class="flex-1">
                    <Button class="w-full" type="button">
                      {{ isVariableProduct ? 'View options' : 'View product' }}
                    </Button>
                  </NuxtLink>
                  <WishlistButton :product="product" variant="icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
