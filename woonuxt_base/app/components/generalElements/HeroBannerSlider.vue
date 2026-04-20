<template>
  <div class="relative mx-auto flex flex-col gap-4">
    <div>
      <NuxtImg
        width="1400"
        height="800"
        class="object-cover w-full h-[420px] lg:h-[560px] xl:h-[640px]"
        src="https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/11/img1.jpg"
        alt="Hero image"
        loading="eager"
        sizes="sm:100vw md:1400px"
        :preload="{ fetchPriority: 'high' }"
        placeholder
        placeholder-class="blur-xl" />
    </div>
    <div>
      <NuxtImg
        width="1400"
        height="800"
        class="object-cover w-full h-[420px] lg:h-[560px] xl:h-[640px]"
        src="https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/11/img1.jpg"
        alt="Hero image"
        loading="eager"
        sizes="sm:100vw md:1400px"
        :preload="{ fetchPriority: 'high' }"
        placeholder
        placeholder-class="blur-xl" />
    </div>
   
  </div>
</template>
