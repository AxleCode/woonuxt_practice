import type { CountriesEnum, GeoLocation } from '#types/gql';

/**
 * Parse label destinasi RajaOngkir Indonesia (dipisah koma).
 * Contoh: "BATUNUNGGAL, BANDUNG KIDUL, BANDUNG, JAWA BARAT, 40266"
 */
function parseRajaOngkirDestinationLabel(text: string): { city: string; provinceName: string; postcode: string } | null {
  const parts = text
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 3) return null;

  const lastRaw = parts[parts.length - 1] ?? '';
  const postcodeDigits = lastRaw.replace(/\D/g, '');
  const hasPostcode = postcodeDigits.length >= 5;

  if (hasPostcode) {
    const postcode = postcodeDigits.slice(-5);
    if (parts.length >= 4) {
      const provinceName = parts[parts.length - 2] ?? '';
      const city = parts[parts.length - 3] ?? '';
      if (!city || !provinceName) return null;
      return { city, provinceName, postcode };
    }
    if (parts.length === 3) {
      const provinceName = parts[1] ?? '';
      const city = parts[0] ?? '';
      if (!city || !provinceName) return null;
      return { city, provinceName, postcode };
    }
    return null;
  }

  // Tanpa kode pos di label — isi kota & provinsi saja
  if (parts.length >= 2) {
    return {
      city: parts[parts.length - 2] ?? '',
      provinceName: parts[parts.length - 1] ?? '',
      postcode: '',
    };
  }
  return null;
}

function findStateCodeForProvince(states: GeoLocation[], provinceLabel: string): string {
  const needle = provinceLabel.trim().toLowerCase();
  if (!needle) return '';

  for (const s of states) {
    const name = s.name.trim().toLowerCase();
    if (name === needle) return s.code;
  }
  for (const s of states) {
    const name = s.name.trim().toLowerCase();
    if (name.includes(needle) || needle.includes(name)) return s.code;
  }
  return '';
}

/**
 * useRajaOngkir
 *
 * Composable untuk integrasi RajaOngkir di WooNuxt.
 *
 * Flow:
 * 1. User mengetik nama kota/kecamatan di field destinasi
 * 2. Query `cekongkirDestinations` mencari destination ID dari database RajaOngkir
 * 3. User memilih destinasi → mutation `setCekongkirDestination` menyimpan destination ID ke WC session
 * 4. WooCommerce dapat menghitung ongkir via RajaOngkir API
 * 5. `refreshCart()` memuat ulang cart dengan shipping methods yang sudah terhitung
 */
export function useRajaOngkir() {
  const { refreshCart, isUpdatingCart } = useCart();
  const { customer } = useAuth();
  const { getStatesForCountry, countryStatesDict } = useCountry();

  /**
   * Isi city / state (kode provinsi WC) / postcode dari teks destinasi RajaOngkir.
   */
  async function syncAddressFromDestinationLabel(
    address: { city?: string | null; state?: string | null; postcode?: string | null; country?: string | null },
    destinationText: string,
  ): Promise<void> {
    const parsed = parseRajaOngkirDestinationLabel(destinationText);
    if (!parsed || !parsed.city) return;

    const country = (address.country || 'ID') as CountriesEnum;

    await getStatesForCountry(country);

    for (let i = 0; i < 30; i++) {
      const states = countryStatesDict.value[country];
      if (states?.length) break;
      await new Promise((r) => setTimeout(r, 50));
    }

    const states = countryStatesDict.value[country] ?? [];
    const stateCode = findStateCodeForProvince(states, parsed.provinceName);

    address.city = parsed.city;
    if (parsed.postcode) address.postcode = parsed.postcode;
    if (stateCode) address.state = stateCode;
  }

  // State untuk autocomplete destinasi
  const destinationQuery = useState<string>('rajaongkir_destination_query', () => '');
  const destinationResults = useState<Array<{ id: string; text: string }>>('rajaongkir_destination_results', () => []);
  const selectedDestination = useState<{ id: string; text: string } | null>('rajaongkir_selected_destination', () => null);
  const isSearchingDestination = useState<boolean>('rajaongkir_is_searching', () => false);
  const isSettingDestination = useState<boolean>('rajaongkir_is_setting', () => false);
  const destinationError = useState<string | null>('rajaongkir_destination_error', () => null);

  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Cari destinasi RajaOngkir berdasarkan keyword.
   * Untuk Indonesia (ID) akan mencari kota/kecamatan di database RajaOngkir.
   */
  async function searchDestination(query: string, country = 'ID'): Promise<void> {
    if (!query || query.length < 2) {
      destinationResults.value = [];
      return;
    }

    // Debounce 400ms agar tidak spam request
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

    await new Promise<void>((resolve) => {
      searchDebounceTimer = setTimeout(resolve, 400);
    });

    isSearchingDestination.value = true;
    destinationError.value = null;

    try {
      const { cekongkirDestinations } = await GqlCekongkirDestinations({ query, country });
      destinationResults.value = (cekongkirDestinations ?? []).filter(
        (d: unknown): d is { id: string; text: string } =>
          !!d && typeof (d as any).id === 'string' && typeof (d as any).text === 'string',
      );
    } catch (error) {
      console.error('[useRajaOngkir] searchDestination error:', error);
      destinationResults.value = [];
    } finally {
      isSearchingDestination.value = false;
    }
  }

  /**
   * Set destinasi yang dipilih ke WC session via GraphQL mutation.
   * Setelah berhasil, refresh cart agar shipping methods muncul.
   */
  async function setDestination(destination: { id: string; text: string }, country = 'ID'): Promise<boolean> {
    isSettingDestination.value = true;
    isUpdatingCart.value = true;
    destinationError.value = null;

    try {
      const { setCekongkirDestination } = await GqlSetCekongkirDestination({
        country,
        destinationId: destination.id,
        destinationLabel: destination.text,
      });

      const payload = setCekongkirDestination?.payload;

      if (!payload?.success) {
        destinationError.value = 'Gagal menyimpan destinasi. Coba lagi.';
        return false;
      }

      selectedDestination.value = destination;
      destinationResults.value = [];
      destinationQuery.value = destination.text;

      // Refresh cart agar WooCommerce menghitung ulang ongkir dengan destination baru
      await refreshCart();

      return true;
    } catch (error) {
      console.error('[useRajaOngkir] setDestination error:', error);
      destinationError.value = 'Terjadi kesalahan saat menghitung ongkir.';
      return false;
    } finally {
      isSettingDestination.value = false;
      isUpdatingCart.value = false;
    }
  }

  /**
   * Cek apakah negara membutuhkan pemilihan destinasi RajaOngkir.
   * Hanya Indonesia (ID) yang membutuhkan destination ID.
   */
  const needsDestinationSelection = computed(() => {
    const country = customer.value?.shipping?.country ?? customer.value?.billing?.country ?? '';
    return country === 'ID';
  });

  /**
   * Reset state destinasi (misal saat country berubah)
   */
  function resetDestination(): void {
    selectedDestination.value = null;
    destinationQuery.value = '';
    destinationResults.value = [];
    destinationError.value = null;
  }

  return {
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
  };
}
