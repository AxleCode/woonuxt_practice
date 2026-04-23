<script lang="ts" setup>
import type { Address } from '#types/gql';

const { updateShippingLocation, isUpdatingShipping } = useCheckout();
const { isBillingAddressEnabled } = useCart();
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
} = useRajaOngkir();

const props = defineProps({
  modelValue: { type: Object as PropType<Address>, required: true },
});

const billing = toRef(props, 'modelValue');

// Reset destinasi saat country berubah
watch(
  () => billing.value.country,
  (newCountry, oldCountry) => {
    if (oldCountry && newCountry !== oldCountry) {
      resetDestination();
    }
    updateShippingLocation();
  },
);

// Trigger shipping rate recalculation when postcode loses focus
const onPostcodeBlur = () => {
  if (billing.value.postcode && billing.value.country) {
    updateShippingLocation();
  }
};

// Handle input di field destinasi RajaOngkir
const onDestinationInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  destinationQuery.value = value;
  if (billing.value.country) {
    searchDestination(value, billing.value.country);
  }
};

// Handle pilih destinasi dari dropdown
const onSelectDestination = async (destination: { id: string; text: string }) => {
  await setDestination(destination, billing.value.country || 'ID');
};

const isLoading = computed(() => isSettingDestination.value || isUpdatingShipping.value);
</script>

<template>
  <div class="grid w-full gap-4 lg:grid-cols-2">
    <div class="w-full">
      <label for="first-name">{{ $t('billing.firstName') }}</label>
      <input id="first-name" v-model="billing.firstName" placeholder="John" autocomplete="given-name" type="text" required />
    </div>

    <div class="w-full">
      <label for="last-name">{{ $t('billing.lastName') }}</label>
      <input id="last-name" v-model="billing.lastName" placeholder="Doe" autocomplete="family-name" type="text" required />
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full col-span-full">
      <label for="address1">{{ $t('billing.address1') }}</label>
      <input id="address1" v-model="billing.address1" placeholder="O'Connell Street 47" autocomplete="street-address" type="text" required />
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full col-span-full">
      <label for="address2">{{ $t('billing.address2') }} ({{ $t('general.optional') }})</label>
      <input id="address2" v-model="billing.address2" placeholder="Apartment, studio, or floor" autocomplete="address-line2" type="text" />
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full">
      <label for="city">{{ $t('billing.city') }}</label>
      <input id="city" v-model="billing.city" placeholder="New York" autocomplete="locality" type="text" required />
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full">
      <label for="state">{{ $t('billing.state') }} ({{ $t('general.optional') }})</label>
      <StateSelect
        id="state"
        v-model="billing.state"
        :default-value="billing.state"
        :country-code="billing.country"
        @change="updateShippingLocation"
        autocomplete="address-level1" />
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full">
      <label for="country">{{ $t('billing.country') }}</label>
      <CountrySelect id="country" v-model="billing.country" :default-value="billing.country" @change="updateShippingLocation" autocomplete="country" />
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full">
      <label for="zip">{{ $t('billing.zip') }}</label>
      <input
        id="zip"
        v-model="billing.postcode"
        placeholder="10001"
        autocomplete="postal-code"
        type="text"
        required
        @blur="onPostcodeBlur" />
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full col-span-full">
      <label for="phone">{{ $t('billing.phone') }} ({{ $t('general.optional') }})</label>
      <input id="phone" v-model="billing.phone" placeholder="+1 234 567 8901" autocomplete="tel" type="tel" />
    </div>

    <!-- Destinasi RajaOngkir — hanya tampil untuk Indonesia -->
    <div v-if="isBillingAddressEnabled && needsDestinationSelection" class="w-full col-span-full">
      <label for="rajaongkir-destination-billing">
        Kota / Kecamatan Tujuan
        <span class="text-red-500">*</span>
      </label>
      <p class="mb-1 text-xs text-gray-500">Pilih kota atau kecamatan untuk menghitung ongkos kirim</p>

      <div class="relative">
        <input
          id="rajaongkir-destination-billing"
          :value="destinationQuery"
          type="text"
          placeholder="Cari kota atau kecamatan... (min. 2 karakter)"
          autocomplete="off"
          class="w-full"
          :disabled="isLoading"
          @input="onDestinationInput" />

        <div v-if="isSearchingDestination" class="absolute right-3 top-1/2 -translate-y-1/2">
          <LoadingIcon size="16" />
        </div>

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

      <div v-if="selectedDestination" class="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
        <Icon name="ion:checkmark-circle" size="16" />
        <span>{{ selectedDestination.text }}</span>
      </div>

      <p v-if="destinationError" class="mt-1 text-sm text-red-500">{{ destinationError }}</p>
    </div>

    <!-- Tombol Cek Ongkir -->
    <div v-if="isBillingAddressEnabled" class="col-span-full">
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
