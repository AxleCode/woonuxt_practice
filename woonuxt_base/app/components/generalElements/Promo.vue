<script setup lang="ts">
// No extra logic needed for now
</script>

<template>
  <section class="promo-section relative w-full py-16 px-4 md:px-20 overflow-hidden">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Newsletter Column -->
      <div class="lg:col-span-3 flex flex-col space-y-3 lg:pr-12 relative promo-wrapper">
        <!-- Notch diagonal lines -->
        <span class="promo-notch-right" aria-hidden="true"></span>
        <div class="">
          <h3 class="text-xl md:text-3xl tracking-tight leading-tight uppercase">
            <b>GET 10% OFF</b>
          </h3>
          <h3 class="text-xl md:text-3xl tracking-tight leading-tight uppercase">
            YOUR FIRST PURCHASE
          </h3>
        </div>

        <div class="promo-newsletter">
          <form class="flex flex-col sm:flex-row gap-0 border-b border-gray-300 focus-within:border-gray-900 transition-colors pb-1" @submit.prevent>
            <input type="email" placeholder="Your email address" class="flex-1 bg-transparent py-3 outline-none text-md font-medium uppercase" required />
            <button type="submit" class="py-3 px-6 text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors">JOIN</button>
          </form>
        </div>

        <p class="leading-relaxed tracking-[0.1px]" style="font-size: 11.5px;">Subscribe to our newsletter for new products, trends and offers, plus your chance to win a $250 gift card!</p>

        <div class="flex items-center space-x-6 pt-4">
          <a href="#" target="_blank" class="text-gray-900 hover:text-gray-600 transition-colors" aria-label="Facebook">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 56.693 56.693">
              <path d="M40.43,21.739h-7.645v-5.014c0-1.883,1.248-2.322,2.127-2.322c0.877,0,5.395,0,5.395,0V6.125l-7.43-0.029 c-8.248,0-10.125,6.174-10.125,10.125v5.518h-4.77v8.53h4.77c0,10.947,0,24.137,0,24.137h10.033c0,0,0-13.32,0-24.137h6.77 L40.43,21.739z" />
            </svg>
          </a>
          <a href="#" target="_blank" class="text-gray-900 hover:text-gray-600 transition-colors" aria-label="Instagram">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 512 512">
              <path d="M256.052,138.088c-65.268,0-117.913,52.646-117.913,117.912c0,65.267,52.645,117.91,117.913,117.91 c65.267,0,117.911-52.644,117.911-117.91C373.963,190.734,321.318,138.088,256.052,138.088z M256.052,332.659 c-42.177,0-76.659-34.38-76.659-76.659c0-42.279,34.378-76.657,76.659-76.657c42.277,0,76.657,34.378,76.657,76.657 C332.709,298.279,298.229,332.659,256.052,332.659L256.052,332.659z M406.288,133.266c0,15.291-12.315,27.502-27.502,27.502 c-15.292,0-27.502-12.314-27.502-27.502c0-15.188,12.313-27.503,27.502-27.503C393.973,105.763,406.288,118.077,406.288,133.266z M484.382,161.177c-1.743-36.839-10.158-69.474-37.148-96.36c-26.886-26.887-59.52-35.302-96.36-37.148 c-37.971-2.155-151.777-2.155-189.747,0c-36.739,1.743-69.372,10.159-96.361,37.046c-26.99,26.887-35.302,59.52-37.149,96.36 c-2.155,37.969-2.155,151.777,0,189.747c1.745,36.842,10.159,69.473,37.149,96.361c26.989,26.887,59.521,35.301,96.361,37.148 c37.969,2.154,151.776,2.154,189.747,0c36.841-1.744,69.475-10.161,96.36-37.148c26.887-26.889,35.302-59.52,37.148-96.361 C486.538,312.853,486.538,199.147,484.382,161.177z M435.329,391.563c-8.004,20.112-23.5,35.61-43.716,43.716 c-30.273,12.009-102.108,9.236-135.562,9.236c-33.456,0-105.393,2.669-135.563-9.236c-20.114-8.005-35.611-23.498-43.717-43.716 C64.766,361.29,67.538,289.455,67.538,256s-2.669-105.391,9.234-135.562c8.006-20.114,23.5-35.61,43.717-43.716 c30.273-12.007,102.107-9.236,135.563-9.236c33.453,0,105.391-2.668,135.562,9.236c20.113,8.002,35.609,23.5,43.716,43.716 c12.007,30.272,9.237,102.107,9.237,135.562S447.336,361.392,435.329,391.563z" />
            </svg>
          </a>
          <a href="#" target="_blank" class="text-gray-900 hover:text-gray-600 transition-colors" aria-label="Pinterest">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.05689,3.41667A6.92132,6.92132,0,0,0,4.99219,10.187a3.93842,3.93842,0,0,0,1.937,3.67044.53625.53625,0,0,0,.79812-.33718l.19277-.823a.50436.50436,0,0,0-.14323-.499,2.69066,2.69066,0,0,1-.73672-2.39653,5.03722,5.03722,0,0,1,4.975-4.57643c3.12027-.05518,5.00867,1.8975,4.3626,5.66614-.68545,3.99861-3.9774,4.86143-4.75694,2.69328a2.00728,2.00728,0,0,1,.02829-1.21247c.17891-.61969.4894-1.59175.64116-2.13062.35887-1.27427.23248-2.45578-.92719-2.74062-.89886-.22077-1.805.38623-2.19719,1.76525a3.88589,3.88589,0,0,0,.22638,2.4543L8.01981,17.405a4.37535,4.37535,0,0,0-.118,1.21957l.12181,2.76261A.236.236,0,0,0,8.468,21.487l1.32992-2.51835a4.37535,4.37535,0,0,0,.36863-.954l.71136-2.7678c2.35839,3.0342,7.31862.59536,7.99979-3.96644C19.651,6.10086,16.68257,3.45868,12.05689,3.41667Z" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Beds Column -->
      <div class="lg:col-span-6 relative group overflow-hidden bg-gray-100 aspect-[1000/600]">
        <NuxtImg
          src="https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/11/beds.jpg"
          alt="Beds & Mattresses"
          class="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          width="1000"
          height="600"
          loading="lazy" />
        <div class="absolute inset-0 flex items-end p-8 ">
          <div class="bg-white p-4 justify-center items-center flex flex-col">
            <NuxtLink to="/products" class="promo-link text-sm font-bold tracking-widest uppercase relative">
              <span>BEDS & MATTRESSES</span>
              <span class="promo-link-line absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 transition-transform duration-300 origin-right scale-x-0 group-hover:scale-x-100 group-hover:origin-left"></span>
              <span class="promo-link-line-static absolute bottom-0 left-0 w-full h-[2px] bg-gray-900"></span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Chairs Column -->
      <div class="lg:col-span-3 relative group overflow-hidden bg-gray-100 aspect-[492/620]">
        <NuxtImg
          src="https://demos.reytheme.com/frankfurt/wp-content/uploads/sites/15/2019/11/chairs.jpg"
          alt="Chairs"
          class="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          width="492"
          height="620"
          loading="lazy" />
        <div class="absolute inset-0 flex items-start p-8">
          <NuxtLink to="/products" class="promo-link text-sm font-bold tracking-widest uppercase relative pb-1">
            <span>CHAIRS</span>
            <span class="promo-link-line absolute bottom-0 left-0 w-full h-[1px] bg-gray-900 transition-transform duration-300 origin-right scale-x-0 group-hover:scale-x-100 group-hover:origin-left"></span>
            <span class="promo-link-line-static absolute bottom-0 left-0 w-full h-[1px] bg-gray-900 opacity-20"></span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.promo-section {
  background-color: #fff;
}

.promo-newsletter input::placeholder {
  color: #999;
  letter-spacing: 0.05em;
}

/* Custom underline animation for links */
.promo-link {
  display: inline-block;
}

.promo-link-line {
  transition: transform 0.4s cubic-bezier(0.2, 1, 0.3, 1);
}

.promo-wrapper {
  position: relative;
  padding: 40px;
  background: #e8edf4;
  border: 4px solid #4a5060;
}

/* Tutup bagian tengah border atas dengan warna background */
.promo-wrapper::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 38%;
  width: 24%;
  height: 4px;
  background: #e8edf4;
  z-index: 1;
}

/* Garis kanan notch (miring ke kiri-bawah, dari tepi kanan gap) */
.promo-notch-right {
  position: absolute;
  top: -2px;
  left: calc(62% - 0px);
  width: 4px;
  height: 32px;
  background: #4a5060;
  transform: rotate(35deg);
  transform-origin: top right;
  z-index: 2;
}
</style>
