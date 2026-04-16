<script setup lang="ts">
import type { ImageFragment, Product, ProductVariationFragment, VariationAttribute } from '#types/gql';
import { ProductTypesEnum, StockStatusEnum, type AddToCartInput } from '#gql/default';

const route = useRoute();
const { storeSettings } = useAppConfig();
const { addToCart, toggleCart } = useCart();

const props = defineProps({
  node: { type: Object as PropType<Product>, required: true },
  index: { type: Number, default: 1 },
});

type ProductImage = {
  src: string;
  alt: string;
  title: string;
  key: string;
};

const imgWidth = 280;
const imgHeight = Math.round(imgWidth * 1.125);

// example: ?filter=pa_color[green,blue],pa_size[large]
const paColor = computed(() => (route.query?.filter as string | undefined)?.split('pa_color[')[1]?.split(']')[0]?.split(',') || []);
const placeholderImage = '/images/placeholder.jpg';

const sliderRef = ref<HTMLElement | null>(null);
const currentSlide = ref(0);

const mainImage = computed<string>(() => props.node?.image?.productCardSourceUrl || props.node?.image?.sourceUrl || placeholderImage);
const primaryCategory = computed(() => props.node?.productCategories?.nodes?.[0]?.name || '');

const matchesSelectedColor = (variation: ProductVariationFragment) => {
  if (!paColor.value.length) return false;
  const hasMatchingAttributes = variation.attributes?.nodes?.some((attribute: VariationAttribute) =>
    paColor.value.some((color) => attribute?.value?.includes(color)),
  );
  const hasMatchingSlug = paColor.value.some((color) => variation.slug?.includes(color));
  return hasMatchingAttributes || hasMatchingSlug;
};

const sliderImages = computed<ProductImage[]>(() => {
  const images: ProductImage[] = [];
  const seen = new Set<string>();
  const addImage = (image: ProductImage) => {
    if (!image?.src || seen.has(image.src)) return;
    seen.add(image.src);
    images.push(image);
  };
  const addVariationImage = (variation: ProductVariationFragment) => {
    const src = variation?.image?.productCardSourceUrl || variation?.image?.sourceUrl;
    if (!src) return;
    addImage({
      src,
      alt: variation?.image?.altText || props.node?.name || 'Product image',
      title: variation?.image?.title || props.node?.name || 'Product image',
      key: `variation-${variation?.databaseId || src}`,
    });
  };
  const addGalleryImage = (image: ImageFragment) => {
    if (!image?.sourceUrl) return;
    addImage({
      src: image.sourceUrl,
      alt: image?.altText || props.node?.name || 'Product image',
      title: image?.title || props.node?.name || 'Product image',
      key: `gallery-${image?.databaseId || image?.sourceUrl}`,
    });
  };

  const variations = props.node?.variations?.nodes || [];
  const gallery = props.node?.galleryImages?.nodes || [];
  const main = {
    src: mainImage.value,
    alt: props.node?.image?.altText || props.node?.name || 'Product image',
    title: props.node?.image?.title || props.node?.name || 'Product image',
    key: `main-${props.node?.image?.databaseId || mainImage.value}`,
  };

  if (paColor.value.length) {
    const matching = variations.filter((variation: ProductVariationFragment) => matchesSelectedColor(variation));
    if (matching.length) {
      if (matching.some((variation: ProductVariationFragment) => (variation?.image?.productCardSourceUrl || variation?.image?.sourceUrl) === main.src)) {
        addImage(main);
      }
      matching.forEach(addVariationImage);
      return images;
    }
  }

  if (main.src !== placeholderImage || (!variations.length && !gallery.length)) {
    addImage(main);
  }

  variations.forEach(addVariationImage);
  gallery.forEach(addGalleryImage);

  return images;
});

const activeVariationImageSrc = computed<string | null>(() => {
  if (!paColor.value.length) return null;
  const variations = props.node?.variations?.nodes || [];
  const activeColorImage = variations.filter((variation: ProductVariationFragment) => matchesSelectedColor(variation));
  if (activeColorImage?.length) return activeColorImage[0]?.image?.productCardSourceUrl || activeColorImage[0]?.image?.sourceUrl || null;
  return null;
});

const activeImageIndex = computed<number>(() => {
  if (!activeVariationImageSrc.value) return 0;
  const index = sliderImages.value.findIndex((image) => image.src === activeVariationImageSrc.value);
  return index >= 0 ? index : 0;
});

const productLink = computed<string>(() => {
  const baseUrl = `/product/${decodeURIComponent(props.node.slug || '')}`;
  if (paColor.value.length) {
    return `${baseUrl}?pa_color=${paColor.value[0]}`;
  }
  return baseUrl;
});

const isSimpleProduct = computed<boolean>(() => props.node?.type === ProductTypesEnum.SIMPLE);
const isVariableProduct = computed<boolean>(() => props.node?.type === ProductTypesEnum.VARIABLE);
const isExternalProduct = computed<boolean>(() => props.node?.type === ProductTypesEnum.EXTERNAL);

const isOutOfStock = computed<boolean>(() => props.node?.stockStatus === StockStatusEnum.OUT_OF_STOCK);
const canAddDirectly = computed<boolean>(() => isSimpleProduct.value && !!props.node?.databaseId && !isExternalProduct.value);

const isAddingFromCard = ref(false);
const handleAddToCart = async (): Promise<void> => {
  if (!canAddDirectly.value || isAddingFromCard.value) return;
  isAddingFromCard.value = true;
  try {
    const input: AddToCartInput = { productId: props.node.databaseId, quantity: 1 };
    await addToCart(input);
    toggleCart(true);
  } finally {
    isAddingFromCard.value = false;
  }
};

const isQuickViewOpen = ref(false);

const updateCurrentSlide = () => {
  const container = sliderRef.value;
  if (!container) return;
  const firstSlide = container.querySelector('.product-card-slide') as HTMLElement | null;
  const slideWidth = firstSlide?.offsetWidth || container.clientWidth;
  const styles = getComputedStyle(container);
  const gap = parseFloat(styles.columnGap || styles.gap || '0');
  const stride = slideWidth + gap;
  const index = stride ? Math.round(container.scrollLeft / stride) : 0;
  currentSlide.value = Math.min(Math.max(index, 0), Math.max(sliderImages.value.length - 1, 0));
};

const scrollToSlide = (index: number) => {
  const container = sliderRef.value;
  if (!container) return;
  const target = container.querySelector(`[data-index="${index}"]`) as HTMLElement | null;
  if (!target) return;
  container.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
};

watch(
  () => [activeImageIndex.value, sliderImages.value.length],
  () => {
    nextTick(() => {
      const container = sliderRef.value;
      if (!container?.children?.length) return;
      const target = container.querySelector(`[data-index="${activeImageIndex.value}"]`) as HTMLElement | null;
      if (target) {
        container.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
      }
      currentSlide.value = activeImageIndex.value;
    });
  },
  { immediate: true },
);
</script>

<template>
  <article class="rey-card group relative">
    <div class="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
      <SaleBadge :node class="absolute z-10 top-4 left-4" />

      <NuxtLink v-if="node.slug" :to="productLink" class="block">
        <div class="aspect-4/5 w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-700">
          <NuxtImg
            :width="imgWidth"
            :height="imgHeight"
            :src="mainImage"
            :alt="node?.image?.altText || node?.name || 'Product image'"
            :title="node?.image?.title || node?.name || 'Product image'"
            :loading="index <= 8 ? 'eager' : 'lazy'"
            :sizes="`sm:${imgWidth / 2}px md:${imgWidth}px`"
            class="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            placeholder
            placeholder-class="blur-xl" />
        </div>
      </NuxtLink>
      <div v-else class="aspect-4/5 w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-700">
        <NuxtImg
          :width="imgWidth"
          :height="imgHeight"
          :src="mainImage"
          :alt="node?.image?.altText || node?.name || 'Product image'"
          :title="node?.image?.title || node?.name || 'Product image'"
          :loading="index <= 8 ? 'eager' : 'lazy'"
          :sizes="`sm:${imgWidth / 2}px md:${imgWidth}px`"
          class="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          placeholder
          placeholder-class="blur-xl" />
      </div>

      <div class="mt-5">
        <div v-if="primaryCategory" class="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
          {{ primaryCategory }}
        </div>

        <NuxtLink v-if="node.slug" :to="productLink" :title="node.name || undefined" class="block">
          <h3 class="mt-2 text-[17px] font-medium leading-snug text-gray-900 dark:text-gray-100">
            {{ node.name }}
          </h3>
        </NuxtLink>
        <ProductPrice class="mt-2 text-sm" :sale-price="node.salePrice ?? undefined" :regular-price="node.regularPrice ?? undefined" />
      </div>

      <div class="rey-card-actions mt-5 flex items-center justify-between gap-4">
        <button
          v-if="canAddDirectly"
          type="button"
          class="rey-action-link"
          :disabled="isOutOfStock || isAddingFromCard"
          @click="handleAddToCart">
          {{ $t('shop.addToCart') }}
        </button>
        <NuxtLink v-else-if="node.slug" :to="productLink" class="rey-action-link">
          {{ isVariableProduct ? 'View options' : 'View product' }}
        </NuxtLink>

        <button type="button" class="rey-action-link" @click="isQuickViewOpen = true">Quickview</button>

        <WishlistButton v-if="node" :product="node" variant="icon" />
      </div>
    </div>

    <ProductQuickViewModal v-model:open="isQuickViewOpen" :product="node" :product-link="productLink" />
  </article>
</template>

<style scoped>
@reference "#tailwind";

.rey-card-actions {
  @apply opacity-100 translate-y-0 transition-all duration-300;
}

@media (hover: hover) and (pointer: fine) {
  .rey-card-actions {
    @apply opacity-0 translate-y-2;
  }
  .rey-card:hover .rey-card-actions,
  .rey-card:focus-within .rey-card-actions {
    @apply opacity-100 translate-y-0;
  }
}

.rey-action-link {
  @apply relative inline-flex items-center gap-1 pb-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200;
}

.rey-action-link::after {
  content: '';
  @apply pointer-events-none absolute left-0 bottom-0 h-px w-full origin-left bg-current opacity-90;
  transform: scaleX(0);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.rey-action-link:hover {
  @apply text-gray-900 dark:text-white;
}

.rey-action-link:hover::after {
  transform: scaleX(1);
}

@media (prefers-reduced-motion: reduce) {
  .rey-action-link::after {
    transition-duration: 0.01ms;
  }
}
</style>
