<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { A11y, Autoplay, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type HeroBanner = {
  id: string;
  image: string;
  alt: string;
  title: string;
  ctaLabel: string;
  to: string;
  overlayClass: string;
};

type HeroSlide =
  | {
      id: string;
      type: 'grid';
      items: [HeroBanner, HeroBanner];
    }
  | {
      id: string;
      type: 'single';
      item: HeroBanner;
      video?: { src: string };
    };

const modules = [Navigation, Autoplay, Pagination, A11y];

const slides: HeroSlide[] = [
  {
    id: 'hero-grid-1',
    type: 'grid',
    items: [
      {
        id: 'tables-chairs',
        image: 'https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/11/img1.jpg',
        alt: 'Tables and chairs',
        title: 'TABLES & CHAIRS',
        ctaLabel: 'DISCOVER',
        to: '/products',
        overlayClass: 'bg-white text-gray-900',
      },
      {
        id: 'sofas-sale',
        image: 'https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/11/img2.jpg',
        alt: 'Selected sofas promotion',
        title: 'UP TO 40% OFF\nSELECTED SOFAS',
        ctaLabel: 'DISCOVER',
        to: '/products',
        overlayClass: 'bg-[#1f3d7a] text-white',
      },
    ],
  },
  {
    id: 'hero-single-1',
    type: 'single',
    item: {
      id: 'bathroom',
      image: 'https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/11/video1-img.jpg',
      alt: 'Modern bathroom',
      title: 'SPOIL YOURSELF WITH\nA MODERN BATHROOM',
      ctaLabel: 'SEE SELECTION',
      to: '/products',
      overlayClass: 'bg-white text-gray-900',
    },
    video: { src: 'https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/11/video1.mp4' },
  },
];

const prevEl = ref<HTMLElement | null>(null);
const nextEl = ref<HTMLElement | null>(null);
const paginationEl = ref<HTMLElement | null>(null);

function onBeforeInit(swiper: any) {
  // Wire custom navigation buttons before Swiper initializes.
  if (swiper?.params?.navigation && typeof swiper.params.navigation !== 'boolean') {
    swiper.params.navigation.prevEl = prevEl.value;
    swiper.params.navigation.nextEl = nextEl.value;
  }
  if (swiper?.params?.pagination && typeof swiper.params.pagination !== 'boolean') {
    swiper.params.pagination.el = paginationEl.value;
  }
}
</script>

<template>
  <section class="hero-section relative w-full pt-26">
    <div class="px-0 md:px-20">
      <div class="relative">
        <ClientOnly>
          <Swiper
            class="hero-swiper"
            :modules="modules"
            :loop="true"
            direction="vertical"
            :slides-per-view="1"
            :autoplay="{ delay: 4500, disableOnInteraction: false }"
            :navigation="true"
            :speed="750"
            :pagination="{
              el: paginationEl,
              clickable: true,
              bulletClass: 'hero-dot',
              bulletActiveClass: 'is-active',
            }"
            @before-init="onBeforeInit">
            <SwiperSlide v-for="slide in slides" :key="slide.id">
              <div v-if="slide.type === 'grid'" class="grid h-full gap-16 lg:grid-cols-2">
                <div
                  v-for="(item, idx) in slide.items"
                  :key="item.id"
                  class="hero-panel relative overflow-hidden bg-gray-100"
                  :class="idx === 0 ? 'hero-panel--left' : 'hero-panel--right'">
                  <NuxtImg
                    width="1400"
                    height="800"
                    class="hero-media object-cover w-full h-full"
                    :src="item.image"
                    :alt="item.alt"
                    loading="eager"
                    sizes="sm:10vw md:1400px"
                    :preload="{ fetchPriority: 'high' }"
                    placeholder
                    placeholder-class="blur-xl" />
                  <div class="hero-curtain" aria-hidden="true" />

                  <div class="absolute inset-0 flex items-center">
                    <div class="hero-caption" :class="item.overlayClass">
                      <h2 class="whitespace-pre-line hero-title">
                        {{ item.title }}
                      </h2>
                      <NuxtLink
                        class="hero-cta"
                        :class="item.overlayClass.includes('text-white') ? 'text-white' : 'text-gray-900'"
                        :to="item.to">
                        <span>{{ item.ctaLabel }}</span>
                        <span aria-hidden="true" class="hero-ctaLine"></span>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="hero-panel relative overflow-hidden bg-gray-100 h-full">
                <NuxtImg
                  width="1400"
                  height="800"
                  class="hero-media hero-media--poster absolute inset-0 object-cover w-full h-full"
                  :src="slide.item.image"
                  :alt="slide.item.alt"
                  loading="eager"
                  sizes="sm:100vw md:1400px"
                  :preload="{ fetchPriority: 'high' }"
                  placeholder
                  placeholder-class="blur-xl" />

                <video
                  v-if="slide.video"
                  class="hero-video absolute inset-0 h-full w-full object-cover"
                  :src="slide.video.src"
                  muted
                  autoplay
                  loop
                  playsinline
                  preload="auto" />
                <div class="hero-curtain" aria-hidden="true" />

                <div class="hero-captionWrap absolute inset-0 flex items-center justify-end">
                  <div class="hero-caption hero-caption--right mr-6 md:mr-10" :class="slide.item.overlayClass">
                    <h2 class="whitespace-pre-line hero-title">
                      {{ slide.item.title }}
                    </h2>
                    <NuxtLink class="hero-cta text-gray-900" :to="slide.item.to">
                      <span>{{ slide.item.ctaLabel }}</span>
                      <span aria-hidden="true" class="hero-ctaLine"></span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          <div ref="paginationEl" class="hero-pagination" aria-label="Slider pagination" />

          <button
            ref="prevEl"
            type="button"
            class="hero-nav-left hero-prev"
            aria-label="Previous slide (up)">
            <span class="hero-arrow hero-arrow--up" aria-hidden="true">
              <svg role="img" aria-hidden="true" viewBox="0 0 50 8">
                <path
                  d="M0.928904706,3.0387609 L44.0113745,3.0387609 L44.0113745,4.97541883 L0.928904706,4.97541883 C0.415884803,4.97541883 2.13162821e-14,4.54188318 2.13162821e-14,4.00708986 C2.13162821e-14,3.47229655 0.415884803,3.0387609 0.928904706,3.0387609 Z"
                  class="hero-arrowDash" />
                <path
                  d="M49.6399545,3.16320794 L45.1502484,0.129110528 C45.0056033,0.0532149593 44.8474869,0.0092610397 44.685796,3.99680289e-14 C44.5479741,0.0112891909 44.4144881,0.0554642381 44.2956561,0.129110528 C44.0242223,0.2506013 43.8503957,0.531340097 43.8559745,0.839218433 L43.8559745,6.90741326 C43.8503957,7.21529159 44.0242223,7.49603039 44.2956561,7.61752116 C44.5594727,7.77895738 44.8864318,7.77895738 45.1502484,7.61752116 L49.6399545,4.58342375 C49.8682741,4.42554586 50.0055358,4.15892769 50.0055358,3.87331584 C50.0055358,3.587704 49.8682741,3.32108583 49.6399545,3.16320794 Z" />
              </svg>
            </span>
          </button>
          <button
            ref="nextEl"
            type="button"
            class="hero-nav-right hero-next"
            aria-label="Next slide (down)">
            <span class="hero-arrow hero-arrow--down" aria-hidden="true">
              <svg role="img" aria-hidden="true" viewBox="0 0 50 8">
                <path
                  d="M0.928904706,3.0387609 L44.0113745,3.0387609 L44.0113745,4.97541883 L0.928904706,4.97541883 C0.415884803,4.97541883 2.13162821e-14,4.54188318 2.13162821e-14,4.00708986 C2.13162821e-14,3.47229655 0.415884803,3.0387609 0.928904706,3.0387609 Z"
                  class="hero-arrowDash" />
                <path
                  d="M49.6399545,3.16320794 L45.1502484,0.129110528 C45.0056033,0.0532149593 44.8474869,0.0092610397 44.685796,3.99680289e-14 C44.5479741,0.0112891909 44.4144881,0.0554642381 44.2956561,0.129110528 C44.0242223,0.2506013 43.8503957,0.531340097 43.8559745,0.839218433 L43.8559745,6.90741326 C43.8503957,7.21529159 44.0242223,7.49603039 44.2956561,7.61752116 C44.5594727,7.77895738 44.8864318,7.77895738 45.1502484,7.61752116 L49.6399545,4.58342375 C49.8682741,4.42554586 50.0055358,4.15892769 50.0055358,3.87331584 C50.0055358,3.587704 49.8682741,3.32108583 49.6399545,3.16320794 Z" />
              </svg>
            </span>
          </button>

          <template #fallback>
            <div class="hero-fallback grid h-[420px] gap-4 lg:h-[560px] xl:h-[640px] lg:grid-cols-2">
              <div v-for="item in slides[0].type === 'grid' ? slides[0].items : []" :key="item.id" class="relative overflow-hidden bg-gray-100">
                <NuxtImg
                  width="1400"
                  height="800"
                  class="object-cover w-full h-full"
                  :src="item.image"
                  :alt="item.alt"
                  loading="eager"
                  sizes="sm:100vw md:1400px"
                  :preload="{ fetchPriority: 'high' }"
                  placeholder
                  placeholder-class="blur-xl" />
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: #ffffff;
}

@media (min-width: 1024px) {
  .hero-section {
    background: linear-gradient(90deg, rgba(235, 245, 251, 1) 0 50%, #ffffff 50% 100%);
  }
}

.hero-swiper :deep(.swiper-wrapper) {
  align-items: stretch;
}

.hero-panel {
  isolation: isolate;
}

.hero-panel--left {
  --hero-reveal-dur: 1000ms;
  --hero-reveal-ease: ease-out;
}

.hero-panel--right {
  --hero-reveal-dur: 1850ms;
  --hero-reveal-ease: ease-out;
}

.hero-curtain {
  position: absolute;
  inset: 0;
  background: #efefef;
  transform: scaleY(0);
  transform-origin: bottom;
  pointer-events: none;
  z-index: 5;
}

.hero-media--poster {
  z-index: 1;
}

.hero-video {
  z-index: 2;
}

.hero-captionWrap {
  z-index: 10;
}

/* Top-to-bottom reveal when the slide becomes active */
.hero-swiper :deep(.swiper-slide-active .hero-curtain) {
  animation: heroCurtainReveal var(--hero-reveal-dur, 1750ms) var(--hero-reveal-ease, ease) both;
}

.hero-swiper :deep(.swiper-slide-active .hero-media) {
  animation: heroImageReveal var(--hero-reveal-dur, 850ms) var(--hero-reveal-ease, ease) both;
}

@keyframes heroCurtainReveal {
  0% {
    transform: scaleY(1);
  }
  100% {
    transform: scaleY(0);
  }
}

@keyframes heroImageReveal {
  0% {
    transform: translateY(-6%) scale(1.03);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-swiper :deep(.swiper-slide-active .hero-curtain),
  .hero-swiper :deep(.swiper-slide-active .hero-media) {
    animation: none !important;
  }
}

.hero-swiper {
  height: 420px;
}

@media (min-width: 1024px) {
  .hero-swiper {
    height: 560px;
  }
}

@media (min-width: 1280px) {
  .hero-swiper {
    height: 600px;
  }
}

.hero-caption {
  margin-left: 1.5rem;
  max-width: 420px;
  padding: 2rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.hero-caption--right {
  margin-left: 0;
  margin-right: 0;
}

.hero-title {
  font-size: 1.5rem;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .hero-caption {
    margin-left: 2.5rem;
    padding: 2.5rem;
  }
  .hero-title {
    font-size: 1.875rem;
  }
}

.hero-cta {
  margin-top: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.hero-ctaLine {
  display: inline-block;
  height: 1px;
  width: 2rem;
  background: currentColor;
  opacity: 0.8;
}

.hero-nav-left {
  position: absolute;
  width: 52px;
  height: 152px;
  background: rgba(235, 245, 251);
  display: grid;
  place-items: center;
  padding: 10px 0;
  color: rgba(17, 24, 39, 0.85);
  transition: background 150ms ease;
  z-index: 20;
}

.hero-nav-right {
  position: absolute;
  width: 52px;
  height: 152px;
  background: rgb(254, 254, 254);
  display: grid;
  place-items: center;
  padding: 10px 0;
  color: rgba(17, 24, 39, 0.85);
  transition: background 150ms ease;
  z-index: 20;
}

.hero-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: currentColor;
}

.hero-arrow svg {
  width: 36px;
  height: 10px;
  fill: currentColor;
  transition: transform 180ms ease;
}

.hero-arrow--up svg {
  transform: rotate(-90deg) scaleX(1);
  transform-origin: 50% 50%;
}

.hero-arrow--down svg {
  transform: rotate(90deg) scaleX(1);
  transform-origin: 50% 50%;
}

.hero-arrowDash {
  transform-origin: 100% 50%;
}

.hero-nav-left:hover .hero-arrow--up svg {
  transform: rotate(-90deg) scaleX(0.72);
}

.hero-nav-right:hover .hero-arrow--down svg {
  transform: rotate(90deg) scaleX(0.72);
}

.hero-nav:hover {
  background: rgba(255, 255, 255, 0.98);
}

.hero-prev {
  top: 14px;
  left: -20px;
}
.hero-next {
  right: -20px;
  bottom: 14px;
}

.hero-pagination {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 30;
}

.hero-pagination :deep(.hero-dot) {
  width: 18px;
  height: 2px;
  background: rgba(17, 24, 39, 0.35);
  border-radius: 9999px;
  transition: width 150ms ease, background 150ms ease, opacity 150ms ease;
  opacity: 0.9;
}

.hero-pagination :deep(.hero-dot.is-active) {
  width: 28px;
  background: rgba(17, 24, 39, 0.9);
}
</style>
