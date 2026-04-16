<script setup lang="ts">
import type { ImageFragment, Product, ProductVariationFragment, VariationAttribute } from '#types/gql';
import { ProductTypesEnum, StockStatusEnum, type AddToCartInput } from '#gql/default';

const route = useRoute();
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

// example: ?filter=pa_color[green,blue],pa_size[large]
const paColor = computed(() => (route.query?.filter as string | undefined)?.split('pa_color[')[1]?.split(']')[0]?.split(',') || []);
const placeholderImage = '/images/placeholder.jpg';

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

/** First image aligned with slider list (color filter / gallery order) */
const cardPrimaryImage = computed<ProductImage>(() => {
  const first = sliderImages.value[0];
  if (first) return first;
  return {
    src: mainImage.value,
    alt: props.node?.image?.altText || props.node?.name || 'Product image',
    title: props.node?.image?.title || props.node?.name || 'Product image',
    key: 'fallback',
  };
});

/** Second image for Rey-style hover swap (gallery / variation after main) */
const hoverSecondImage = computed<ProductImage | null>(() => sliderImages.value[1] ?? null);

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
</script>

<template>
  <article class="rey-card group relative h-full">
    <div
      class="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
      <SaleBadge :node class="absolute z-10 top-4 left-4" />

      <NuxtLink v-if="node.slug" :to="productLink" class="block">
        <div class="aspect-4/5 w-full overflow-hidden rounded-xl">
          <div
            class="relative h-full w-full">
            <NuxtImg
              :src="cardPrimaryImage.src"
              :alt="cardPrimaryImage.alt"
              :title="cardPrimaryImage.title"
              fit="contain"
              :loading="index <= 8 ? 'eager' : 'lazy'"
              :modifiers="{ fit: 'contain', background: 'transparent' }"
              class="rey-card-image-primary absolute inset-0 z-[1] h-full w-full !object-contain"
              :class="{ 'rey-card-image-primary--stack': !!hoverSecondImage }"
              placeholder
              placeholder-class="blur-xl" />
            <NuxtImg
              v-if="hoverSecondImage"
              :src="hoverSecondImage.src"
              :alt="hoverSecondImage.alt"
              :title="hoverSecondImage.title"
              fit="contain"
              loading="lazy"
              :modifiers="{ fit: 'contain', background: 'transparent' }"
              class="rey-card-image-secondary absolute inset-0 z-[2] h-full w-full !object-contain"
              placeholder
              placeholder-class="blur-xl" />
          </div>
        </div>
      </NuxtLink>
      <div v-else class="aspect-4/5 w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-700">
        <div
          class="relative h-full w-full">
          <NuxtImg
            :src="cardPrimaryImage.src"
            :alt="cardPrimaryImage.alt"
            :title="cardPrimaryImage.title"
            fit="contain"
            :loading="index <= 8 ? 'eager' : 'lazy'"
            :modifiers="{ fit: 'contain', background: 'transparent' }"
            class="rey-card-image-primary absolute inset-0 z-[1] h-full w-full !object-contain"
            :class="{ 'rey-card-image-primary--stack': !!hoverSecondImage }"
            placeholder
            placeholder-class="blur-xl" />
          <NuxtImg
            v-if="hoverSecondImage"
            :src="hoverSecondImage.src"
            :alt="hoverSecondImage.alt"
            :title="hoverSecondImage.title"
            fit="contain"
            loading="lazy"
            :modifiers="{ fit: 'contain', background: 'transparent' }"
            class="rey-card-image-secondary absolute inset-0 z-[2] h-full w-full !object-contain"
            placeholder
            placeholder-class="blur-xl" />
        </div>
      </div>

      <div class="mt-5 flex flex-1 flex-col">
        <div class="min-h-[1rem] text-[11px] font-semibold uppercase tracking-[0.01em] text-gray-400">
          {{ primaryCategory || ' ' }}
        </div>

        <NuxtLink v-if="node.slug" :to="productLink" :title="node.name || undefined" class="block">
          <h3 class="mt-2 line-clamp-2 text-[17px] font-medium leading-snug text-gray-900 dark:text-gray-100">
            {{ node.name }}
          </h3>
        </NuxtLink>

        <!-- Rey: price visible by default; on hover swap to CTA row (see scoped CSS) -->
        <div class="rey-card-footer relative mt-3 min-h-[1.75rem]">
          <div class="rey-card-price-layer">
            <ProductPrice class="text-sm" :sale-price="node.salePrice ?? undefined" :regular-price="node.regularPrice ?? undefined" />
          </div>
          <div class="rey-card-actions-layer flex w-full items-center justify-between gap-3">
            <button
              v-if="canAddDirectly"
              type="button"
              class="rey-action-link shrink-0"
              :disabled="isOutOfStock || isAddingFromCard"
              @click.stop="handleAddToCart">
              {{ $t('shop.addToCart') }}
            </button>
            <NuxtLink v-else-if="node.slug" :to="productLink" class="rey-action-link shrink-0" @click.stop>
              {{ isVariableProduct ? 'Select options' : 'View product' }}
            </NuxtLink>

            <button type="button" class="rey-action-link shrink-0" @click.stop="isQuickViewOpen = true">Quickview</button>

            <span class="inline-flex shrink-0">
              <WishlistButton v-if="node" :product="node" variant="icon" />
            </span>
          </div>
        </div>

        <!-- keep cards same height without pushing price down -->
        <div class="flex-1" aria-hidden="true" />
      </div>

    </div>

    <ProductQuickViewModal v-model:open="isQuickViewOpen" :product="node" :product-link="productLink" />
  </article>
</template>

<style scoped>
@reference "#tailwind";

/* Rey: gallery second image crossfade on hover (fine pointer), like Frankfurt shop */
.rey-card-image-primary {
  @apply transition-opacity duration-500 ease-out;
}

.rey-card-image-secondary {
  @apply pointer-events-none opacity-0 transition-opacity duration-500 ease-out;
}

@media (hover: hover) and (pointer: fine) {
  .rey-card:hover .rey-card-image-primary--stack,
  .rey-card:focus-within .rey-card-image-primary--stack {
    @apply opacity-0;
  }

  .rey-card:hover .rey-card-image-secondary,
  .rey-card:focus-within .rey-card-image-secondary {
    @apply opacity-100;
  }
}

/* Touch / coarse: first image only (no hover swap) */
@media (hover: none), (pointer: coarse) {
  .rey-card-image-primary--stack {
    @apply opacity-100;
  }

  .rey-card-image-secondary {
    @apply opacity-0;
  }
}

/* Rey Frankfurt shop: price row default; hover hides price and reveals CTA row */
.rey-card-footer {
  @apply w-full;
}

.rey-card-price-layer,
.rey-card-actions-layer {
  @apply transition-[opacity,transform] duration-300 ease-out;
}

/* Touch / no-hover: show price + actions stacked (no swap) */
@media (hover: none), (pointer: coarse) {
  .rey-card-price-layer {
    @apply relative opacity-100;
  }
  .rey-card-actions-layer {
    @apply relative mt-3 flex-wrap justify-start gap-x-4 gap-y-2 opacity-100;
    transform: none;
  }
}

/* Fine pointer: single row swap — price out, actions in */
@media (hover: hover) and (pointer: fine) {
  .rey-card-price-layer {
    @apply relative z-[1] opacity-100;
    transform: translateY(0);
  }

  .rey-card-actions-layer {
    @apply absolute inset-x-0 bottom-0 z-[2] flex-nowrap justify-between opacity-0;
    transform: translateY(8px);
    pointer-events: none;
  }

  .rey-card:hover .rey-card-price-layer,
  .rey-card:focus-within .rey-card-price-layer {
    @apply opacity-0;
    transform: translateY(-6px);
    pointer-events: none;
  }

  .rey-card:hover .rey-card-actions-layer,
  .rey-card:focus-within .rey-card-actions-layer {
    @apply opacity-100;
    transform: translateY(0);
    pointer-events: auto;
  }
}

/* Letter-spacing: set via Tailwind `tracking-*` on each control — not here, or it overrides those classes */
.rey-action-link {
  @apply relative inline-flex items-center gap-1 pb-1 text-[13px] font-bold uppercase tracking-[0.01em] text-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200;
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
  .rey-card-image-primary,
  .rey-card-image-secondary {
    transition-duration: 0.01ms;
  }

  .rey-card:hover .rey-card-image-primary--stack,
  .rey-card:focus-within .rey-card-image-primary--stack {
    @apply opacity-100;
  }

  .rey-card:hover .rey-card-image-secondary,
  .rey-card:focus-within .rey-card-image-secondary {
    @apply opacity-0;
  }

  .rey-card-price-layer,
  .rey-card-actions-layer {
    transition-duration: 0.01ms;
  }

  .rey-action-link::after {
    transition-duration: 0.01ms;
  }
}
</style>
