<script lang="ts" setup>
import type { Address } from '#types/gql';

const { updateShippingLocation, isUpdatingShipping } = useCheckout();
const {
  destinationQuery,
  destinationResults,
  selectedDestination,
  isSearchingDestination,
  isSettingDestination,
  destinationError,
  needsDestinationSelection,
  searchDestination,
  setDestination,
  resetDestination,
  syncAddressFromDestinationLabel,
} = useRajaOngkir();

const props = defineProps({
  modelValue: { type: Object as PropType<Address>, required: true },
});

const shipping = toRef(props, 'modelValue');

// Reset destinasi saat country berubah ke non-ID
watch(
  () => shipping.value.country,
  (newCountry, oldCountry) => {
    if (oldCountry && newCountry !== oldCountry) {
      resetDestination();
    }
    updateShippingLocation();
  },
);

// Trigger shipping rate recalculation when postcode loses focus
const onPostcodeBlur = () => {
  if (shipping.value.postcode && shipping.value.country) {
    updateShippingLocation();
  }
};

// Handle input di field destinasi RajaOngkir
const onDestinationInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  destinationQuery.value = value;
  if (shipping.value.country) {
    searchDestination(value, shipping.value.country);
  }
};

// Handle pilih destinasi dari dropdown — isi kota / provinsi / kode pos dari label RajaOngkir
const onSelectDestination = async (destination: { id: string; text: string }) => {
  const ok = await setDestination(destination, shipping.value.country || 'ID');
  if (!ok) return;
  await syncAddressFromDestinationLabel(shipping.value, destination.text);
  await updateShippingLocation();
};

const isLoading = computed(() => isSettingDestination.value || isUpdatingShipping.value);
</script>

<template>
  <div class="grid w-full gap-4 lg:grid-cols-2">
    <div class="w-full">
      <label for="first-name">{{ $t('billing.firstName') }}</label>
      <input id="first-name" v-model="shipping.firstName" placeholder="John" autocomplete="given-name" type="text" required />
    </div>

    <div class="w-full">
      <label for="last-name">{{ $t('billing.lastName') }}</label>
      <input id="last-name" v-model="shipping.lastName" placeholder="Doe" autocomplete="family-name" type="text" required />
    </div>

    <div class="w-full col-span-full">
      <label for="address1">{{ $t('billing.address1') }}</label>
      <input id="address1" v-model="shipping.address1" placeholder="O'Connell Street 47" autocomplete="street-address" type="text" required />
    </div>

    <div class="w-full col-span-full">
      <label for="address2">{{ $t('billing.address2') }} ({{ $t('general.optional') }})</label>
      <input id="address2" v-model="shipping.address2" placeholder="Apartment, studio, or floor" autocomplete="address-line2" type="text" />
    </div>

    <div class="w-full col-span-full">
      <label for="phone">{{ $t('billing.phone') }}  <span class="text-red-500">*</span></label>
      <input id="phone" v-model="shipping.phone" placeholder="+1 234 567 8901" autocomplete="tel" type="tel" required />
    </div>

    <div class="w-full col-span-full" >
      <label for="country">{{ $t('billing.country') }}</label>
      <CountrySelect id="country" v-model="shipping.country" :default-value="shipping.country" @change="updateShippingLocation" />
    </div>

    <div class="w-full" hidden>
      <label for="state">{{ $t('billing.state') }}</label>
      <StateSelect id="state" v-model="shipping.state" disabled class="bg-gray-200 cursor-not-allowed" :default-value="shipping.state" :country-code="shipping.country" @change="updateShippingLocation" />
    </div>

    <div class="w-full" hidden>
      <label for="city">{{ $t('billing.city') }}</label>
      <input id="city" v-model="shipping.city" placeholder="New York" disabled class="bg-gray-200 cursor-not-allowed" autocomplete="locality" type="text" required />
    </div>

    <div class="w-full" hidden>
      <label for="zip">{{ $t('billing.zip') }}</label>
      <input
        id="zip"
        v-model="shipping.postcode"
        placeholder="10001"
        disabled class="bg-gray-200 cursor-not-allowed"
        autocomplete="postal-code"
        type="text"
        required
        @blur="onPostcodeBlur" />
    </div>

    <!-- Destinasi RajaOngkir — hanya tampil untuk Indonesia -->
    <div v-if="needsDestinationSelection" class="w-full col-span-full">
      <label for="rajaongkir-destination">
        City or district
        <span class="text-red-500">*</span>
      </label>
      <p class="mb-1 text-xs text-gray-500">Select a city or district to calculate shipping costs</p>

      <!-- Input autocomplete -->
      <div class="relative">
        <input
          id="rajaongkir-destination"
          :value="destinationQuery"
          type="text"
          placeholder="Search for a city or sub-district, for example: Jakarta, Kemayoran, Senen"
          autocomplete="off"
          class="w-full"
          :disabled="isLoading"
          @input="onDestinationInput" />

        <!-- Loading indicator saat mencari -->
        <div v-if="isSearchingDestination" class="absolute right-3 top-1/2 -translate-y-1/2">
          <LoadingIcon size="16" />
        </div>

        <!-- Dropdown hasil pencarian -->
        <ul
          v-if="destinationResults.length > 0"
          class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-600">
          <li
            v-for="dest in destinationResults"
            :key="dest.id"
            class="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
            @mousedown.prevent="onSelectDestination(dest)">
            {{ dest.text }}
          </li>
        </ul>
      </div>

      <!-- Destinasi terpilih -->
      <div v-if="selectedDestination" class="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
        <Icon name="ion:checkmark-circle" size="16" />
        <span>{{ selectedDestination.text }}</span>
      </div>

      <!-- Error -->
      <p v-if="destinationError" class="mt-1 text-sm text-red-500">{{ destinationError }}</p>
    </div>

    <!-- Tombol Cek Ongkir -->
    <div class="col-span-full" hidden>
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isLoading || (needsDestinationSelection && !selectedDestination)"
        @click="updateShippingLocation">
        <LoadingIcon v-if="isLoading" size="16" />
        <span>{{ isLoading ? 'Menghitung...' : 'Cek Ongkir' }}</span>
      </button>
      <p v-if="needsDestinationSelection && !selectedDestination" class="mt-1 text-xs text-amber-600">
        Pilih kota/kecamatan tujuan terlebih dahulu
      </p>
    </div>
  </div>
</template>
