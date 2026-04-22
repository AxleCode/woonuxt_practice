<script lang="ts" setup>
import type { Address } from '#types/gql';

const { updateShippingLocation } = useCheckout();
const { isBillingAddressEnabled } = useCart();

const { destinations, searchDestination, getWpBase } = useRajaOngkir()

const { refreshCart } = useCart()

const wpBase = getWpBase()

const selectDestination = async (d: any) => {
  billing.value.city = String(d.id)

  await fetch(`${wpBase}/wp-json/custom/v1/set-destination`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination: d.id
    })
  })

  await updateShippingLocation()

  // 3. refresh cart (INI YANG PALING PENTING 🔥)
  await refreshCart()
}

const props = defineProps({
  modelValue: { type: Object as PropType<Address>, required: true },
});



const billing = toRef(props, 'modelValue');
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
      <label for="country">{{ $t('billing.country') }}</label>
      <CountrySelect id="country" v-model="billing.country" :default-value="billing.country" @change="updateShippingLocation" autocomplete="country" />
    </div>

    <div v-if="billing.country === 'ID'" class="relative w-full col-span-full">
      <label>Destination</label>
      <input
        type="text"
        placeholder="Find Direct Destination City..."
        @input="searchDestination($event.target.value)"
      />

      <ul v-if="destinations.length" class="absolute z-50 bg-white border rounded-md shadow-lg w-full mt-1 max-h-60 overflow-y-auto">
        <li
          v-for="d in destinations"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          :key="d.id"
          @click="selectDestination(d)"
        >
          {{ d.label }}
        </li>
      </ul>
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full">
      <label for="zip">{{ $t('billing.zip') }}</label>
      <input id="zip" v-model="billing.postcode" placeholder="10001" autocomplete="postal-code" type="text" required />
    </div>

    <div v-if="isBillingAddressEnabled" class="w-full col-span-full">
      <label for="phone">{{ $t('billing.phone') }} ({{ $t('general.optional') }})</label>
      <input id="phone" v-model="billing.phone" placeholder="+1 234 567 8901" autocomplete="tel" type="tel" />
    </div>
    
  </div>
</template>
