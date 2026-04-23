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
  };
}
