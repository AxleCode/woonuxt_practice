<script setup lang="ts">
import { ProductTypesEnum, StockStatusEnum, type AddToCartInput } from '#gql/default';
import type { Product, ProductAttribute, ProductDetail } from '#types/gql';

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
const loadedSlug = ref<string | null>(null);
const isLoading = ref(false);

const displayProduct = computed<Product>(() => (productDetail.value ?? props.product) as Product);

const primaryBrand = computed(() => displayProduct.value?.productBrands?.nodes?.[0]?.name || '');
const categoryLabel = computed(() => displayProduct.value?.productCategories?.nodes?.[0]?.name || '');

const galleryImages = computed(() => {
  const p = displayProduct.value;
  const out: { src: string; alt: string; key: string }[] = [];
  const seen = new Set<string>();
  const push = (src: string | undefined | null, alt: string, key: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    out.push({ src, alt, key });
  };
  push(p?.image?.sourceUrl, p?.image?.altText || p?.name || '', `main-${p?.image?.databaseId ?? 'main'}`);
  const nodes = p?.galleryImages?.nodes ?? [];
  for (const img of nodes) {
    if (!img?.sourceUrl) continue;
    push(img.sourceUrl, img.altText || p?.name || '', `g-${img.databaseId ?? img.sourceUrl}`);
  }
  return out;
});

const activeImageIndex = ref(0);
watch(
  () => galleryImages.value.map((g) => g.src).join('|'),
  () => {
    activeImageIndex.value = 0;
  },
);

const activeImage = computed(() => galleryImages.value[activeImageIndex.value] ?? galleryImages.value[0]);

const descriptionHtml = computed(() => productDetail.value?.shortDescription || productDetail.value?.description || '');

function attributeDisplayValue(attr: ProductAttribute): string {
  const terms = (attr as { terms?: { nodes?: { name?: string | null }[] | null } | null }).terms?.nodes;
  if (terms?.length) {
    return terms.map((t) => t?.name).filter(Boolean).join(', ');
  }
  if (attr.options?.length) {
    return attr.options.join(', ');
  }
  return '';
}

const specificationRows = computed(() => {
  const nodes = displayProduct.value?.attributes?.nodes ?? [];
  return nodes
    .map((attr) => ({
      label: (attr.label || attr.name || '').toString(),
      value: attributeDisplayValue(attr),
    }))
    .filter((row) => row.label && row.value);
});

const shareUrl = computed(() => {
  const path = props.productLink.startsWith('http') ? props.productLink : props.productLink;
  if (import.meta.client) {
    return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return `${frontEndUrl}${path.startsWith('/') ? path : `/${path}`}`;
});

const twitterShare = computed(() => `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.product.name || '')}&url=${encodeURIComponent(shareUrl.value)}`);
const facebookShare = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`);
const linkedinShare = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`);
const pinterestShare = computed(() => {
  const media = displayProduct.value?.image?.sourceUrl || '';
  return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl.value)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(props.product.name || '')}`;
});
const mailShare = computed(() => `mailto:?subject=${encodeURIComponent(props.product.name || '')}&body=${encodeURIComponent(shareUrl.value)}`);

const copyStatus = ref<'idle' | 'copied' | 'err'>('idle');
const copyLink = async () => {
  if (!import.meta.client) return;
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copyStatus.value = 'copied';
    setTimeout(() => {
      copyStatus.value = 'idle';
    }, 2000);
  } catch {
    copyStatus.value = 'err';
    setTimeout(() => {
      copyStatus.value = 'idle';
    }, 2000);
  }
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    const slug = props.product?.slug;
    if (!slug) return;
    if (loadedSlug.value === slug && productDetail.value) return;

    isLoading.value = true;
    if (loadedSlug.value !== slug) {
      productDetail.value = null;
    }
    try {
      const { data } = await useAsyncGql('getProduct', { slug, frontEndUrl });
      productDetail.value = (data.value?.product as ProductDetail) || null;
      loadedSlug.value = slug;
    } catch (e) {
      console.warn('[ProductQuickViewModal] failed to load product', e);
    } finally {
      isLoading.value = false;
    }
  },
);

const quantity = ref(1);
watch(
  () => props.open,
  (v) => {
    if (v) quantity.value = 1;
  },
);

const isOutOfStock = computed(() => displayProduct.value?.stockStatus === StockStatusEnum.OUT_OF_STOCK);

const isAdding = ref(false);
const handleAddToCart = async () => {
  if (!canAddDirectly.value || isAdding.value || isOutOfStock.value) return;
  isAdding.value = true;
  try {
    const input: AddToCartInput = { productId: props.product.databaseId, quantity: quantity.value };
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
    <Transition name="rey-qv-backdrop">
      <div v-if="open" class="fixed inset-0 z-[60]">
        <!-- Dim overlay (Rey quick view) -->
        <button type="button" class="absolute inset-0 bg-black/55 transition-opacity" aria-label="Close quick view" @click="close" />

        <!-- Centered indeterminate bar while fetching (matches Frankfurt loading line) -->
        <div
          v-if="isLoading"
          class="pointer-events-none fixed left-1/2 top-1/2 z-[62] h-[3px] w-56 max-w-[40vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
          <div class="rey-qv-indeterminate h-full w-1/3 rounded-full bg-[#1e3a5f]" />
        </div>

        <div class="absolute inset-0 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <Transition name="rey-qv-modal">
            <div
              v-if="open"
              role="dialog"
              aria-modal="true"
              aria-labelledby="rey-qv-title"
              class="relative z-[61] flex w-full max-w-6xl flex-col bg-white shadow-2xl dark:bg-gray-950"
              @click.stop>
              <!-- Close -->
              <button
                type="button"
                class="absolute right-3 top-3 z-10 rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close"
                @click="close">
                <Icon name="ion:close-outline" size="24" />
              </button>

              <div class="grid min-h-[min(85vh,720px)] grid-cols-1 lg:grid-cols-2">
                <!-- Left: gallery -->
                <div class="relative flex flex-col bg-gray-50 dark:bg-gray-900 lg:min-h-[480px]">
                  <template v-if="isLoading">
                    <div class="flex flex-1 items-center justify-center p-8">
                      <div class="rey-qv-shimmer aspect-square w-full max-w-md rounded-md" />
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex flex-1 items-center justify-center p-6 lg:p-10">
                      <NuxtImg
                        v-if="activeImage"
                        :key="activeImage.key"
                        class="max-h-[min(55vh,520px)] w-full object-contain"
                        :src="activeImage.src"
                        :alt="activeImage.alt"
                        loading="eager" />
                    </div>
                    <div v-if="galleryImages.length > 1" class="flex flex-wrap gap-2 border-t border-gray-200/80 bg-white/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/80">
                      <button
                        v-for="(img, i) in galleryImages"
                        :key="img.key"
                        type="button"
                        class="h-14 w-14 shrink-0 overflow-hidden border-2 transition-colors"
                        :class="i === activeImageIndex ? 'border-gray-900 dark:border-white' : 'border-transparent hover:border-gray-300'"
                        @click="activeImageIndex = i">
                        <NuxtImg class="h-full w-full object-cover" :src="img.src" :alt="img.alt" width="56" height="56" />
                      </button>
                    </div>
                  </template>
                </div>

                <!-- Right: details (scroll) -->
                <div class="flex max-h-[min(85vh,720px)] flex-col overflow-y-auto px-5 pb-8 pt-12 sm:px-8 lg:pt-10">
                  <template v-if="isLoading">
                    <div class="space-y-4">
                      <div class="rey-qv-shimmer h-3 w-24 rounded" />
                      <div class="rey-qv-shimmer h-8 w-full max-w-md rounded" />
                      <div class="rey-qv-shimmer h-6 w-40 rounded" />
                      <div class="rey-qv-shimmer mt-4 h-24 w-full rounded" />
                      <div class="rey-qv-shimmer h-32 w-full rounded" />
                    </div>
                  </template>

                  <template v-else>
                    <div v-if="primaryBrand" class="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                      {{ primaryBrand }}
                    </div>
                    <h2 id="rey-qv-title" class="mt-1 text-xl font-semibold leading-snug text-gray-900 dark:text-gray-50 sm:text-2xl">
                      {{ product.name }}
                    </h2>

                    <div class="mt-4">
                      <ProductPrice class="text-lg" :sale-price="displayProduct.salePrice ?? undefined" :regular-price="displayProduct.regularPrice ?? undefined" />
                    </div>

                    <div v-if="descriptionHtml" class="mt-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      <div v-html="descriptionHtml" class="prose prose-sm max-w-none dark:prose-invert" />
                    </div>

                    <div class="mt-6 flex flex-wrap items-stretch gap-3">
                      <div v-if="canAddDirectly" class="flex items-center border border-gray-300 dark:border-gray-600">
                        <button
                          type="button"
                          class="px-3 py-2 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
                          :disabled="quantity <= 1"
                          aria-label="Decrease quantity"
                          @click="quantity = Math.max(1, quantity - 1)">
                          −
                        </button>
                        <span class="min-w-[2.5rem] select-none px-2 py-2 text-center text-sm font-medium tabular-nums">{{ quantity }}</span>
                        <button
                          type="button"
                          class="px-3 py-2 text-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                          aria-label="Increase quantity"
                          @click="quantity += 1">
                          +
                        </button>
                      </div>

                      <Button
                        v-if="canAddDirectly"
                        class="min-h-[44px] flex-1 bg-[#1e3a5f] uppercase tracking-wide text-white hover:bg-[#162d4a] dark:bg-[#1e3a5f]"
                        :loading="isAdding"
                        :disabled="isAdding || isOutOfStock"
                        type="button"
                        @click="handleAddToCart">
                        {{ $t('shop.addToCart') }}
                      </Button>
                      <NuxtLink v-else :to="productLink" class="min-h-[44px] flex-1" @click="close">
                        <Button class="h-full w-full bg-[#1e3a5f] uppercase tracking-wide text-white hover:bg-[#162d4a]" type="button">
                          {{ isVariableProduct ? 'Select options' : 'View product' }}
                        </Button>
                      </NuxtLink>

                      <div class="flex min-h-[44px] items-center justify-center border border-gray-200 px-3 dark:border-gray-700">
                        <WishlistButton :product="product" variant="icon" />
                        <span class="ml-1 hidden text-xs font-semibold uppercase tracking-wide text-gray-600 sm:inline">Wishlist</span>
                      </div>
                    </div>

                    <div v-if="categoryLabel" class="mt-6 text-xs text-gray-500">
                      <span class="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                      {{ categoryLabel }}
                    </div>

                    <!-- Share row (Rey-style) -->
                    <div class="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                      <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Share</span>
                      <div class="flex flex-wrap items-center gap-2 text-gray-400">
                        <a :href="twitterShare" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700 dark:hover:text-gray-200" title="X">
                          <Icon name="ion:logo-twitter" size="20" />
                        </a>
                        <a :href="facebookShare" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700 dark:hover:text-gray-200" title="Facebook">
                          <Icon name="ion:logo-facebook" size="20" />
                        </a>
                        <a :href="linkedinShare" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700 dark:hover:text-gray-200" title="LinkedIn">
                          <Icon name="ion:logo-linkedin" size="20" />
                        </a>
                        <a :href="pinterestShare" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700 dark:hover:text-gray-200" title="Pinterest">
                          <Icon name="ion:logo-pinterest" size="20" />
                        </a>
                        <a :href="mailShare" class="hover:text-gray-700 dark:hover:text-gray-200" title="Email">
                          <Icon name="ion:mail-outline" size="22" />
                        </a>
                        <button
                          type="button"
                          class="hover:text-gray-700 dark:hover:text-gray-200"
                          title="Copy link"
                          @click="copyLink">
                          <Icon name="ion:link-outline" size="22" />
                        </button>
                      </div>
                      <span v-if="copyStatus === 'copied'" class="text-xs text-green-600">Copied</span>
                      <span v-else-if="copyStatus === 'err'" class="text-xs text-red-500">Copy failed</span>
                    </div>

                    <!-- Specifications -->
                    <div v-if="specificationRows.length" class="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
                      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Specifications</h3>
                      <dl class="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
                        <div v-for="row in specificationRows" :key="row.label" class="flex justify-between gap-4 py-3 text-sm">
                          <dt class="font-semibold uppercase tracking-wide text-gray-500">{{ row.label }}</dt>
                          <dd class="text-right text-gray-800 dark:text-gray-200">{{ row.value }}</dd>
                        </div>
                      </dl>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop fade */
.rey-qv-backdrop-enter-active,
.rey-qv-backdrop-leave-active {
  transition: opacity 0.35s ease-out;
}
.rey-qv-backdrop-enter-from,
.rey-qv-backdrop-leave-to {
  opacity: 0;
}

/* Modal enter (Frankfurt-style ease) */
.rey-qv-modal-enter-active {
  transition:
    opacity 0.35s ease-out,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.rey-qv-modal-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.985);
}
.rey-qv-modal-leave-active {
  transition: opacity 0.2s ease-in;
}
.rey-qv-modal-leave-to {
  opacity: 0;
}

/* Indeterminate loading bar */
@keyframes rey-qv-indeterminate {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(380%);
  }
}
.rey-qv-indeterminate {
  animation: rey-qv-indeterminate 1.15s ease-in-out infinite;
}

/* Skeleton shimmer */
@keyframes rey-qv-shimmer-move {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
.rey-qv-shimmer {
  background: linear-gradient(90deg, rgb(243 244 246 / 0.3) 0%, rgb(229 231 235 / 0.95) 45%, rgb(243 244 246 / 0.3) 100%);
  background-size: 200% 100%;
  animation: rey-qv-shimmer-move 1.3s ease-in-out infinite;
}
.dark .rey-qv-shimmer {
  background: linear-gradient(90deg, rgb(31 41 55 / 0.4) 0%, rgb(55 65 81 / 0.9) 45%, rgb(31 41 55 / 0.4) 100%);
  background-size: 200% 100%;
}
</style>
