interface RajaOngkirResponse<T> {
  meta: { message: string; code: number; status: string };
  data: T[];
}

interface Province {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

export const useRajaOngkir = () => {
  const provinces = ref<Province[]>([]);
  const cities = ref<City[]>([]);
  const loading = ref(false);
  const config = useRuntimeConfig();

  // Get WordPress base URL from GraphQL host
  const getWpBase = () => {
    try {
      const gqlHost = config.public['graphql-client']?.clients?.default?.host || '';
      return gqlHost.replace('/graphql', '');
    } catch (e) {
      return '';
    }
  };

  const fetchProvinces = async () => {
    loading.value = true;
    try {
      const wpBase = getWpBase();
      const res = await fetch(`${wpBase}/wp-json/rajaongkir/v1/provinces`);
      const json = (await res.json()) as RajaOngkirResponse<Province>;
      provinces.value = json.data || [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchCities = async (provinceId: string | number) => {
    if (!provinceId) return;
    loading.value = true;
    try {
      const wpBase = getWpBase();
      const res = await fetch(`${wpBase}/wp-json/rajaongkir/v1/cities?province_id=${provinceId}`);
      const json = (await res.json()) as RajaOngkirResponse<City>;
      cities.value = json.data || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    provinces,
    cities,
    loading,
    fetchProvinces,
    fetchCities,
  };
};