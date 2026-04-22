interface Destination {
  id: string
  label: string
}

interface ShippingCost {
  service: string
  description: string
  cost: number
  etd: string
}

export const useRajaOngkir = () => {
  const destinations = ref<Destination[]>([])
  const costs = ref<ShippingCost[]>([])
  const loading = ref(false)
  const config = useRuntimeConfig()

  const getWpBase = () => {
    const gqlHost = config.public['graphql-client']?.clients?.default?.host || ''
    return gqlHost.replace('/graphql', '')
  }

  //SEARCH DESTINATION
  const searchDestination = async (keyword: string) => {
    if (!keyword) return
    loading.value = true

    try {
      const res = await fetch(`${getWpBase()}/wp-json/rajaongkir/v1/destination?search=${keyword}`)
      destinations.value = await res.json()
    } finally {
      loading.value = false
    }
  }

  //GET COST
  const getCost = async (destination: string, weight: number) => {
    loading.value = true

    try {
      const res = await fetch(`${getWpBase()}/wp-json/rajaongkir/v1/cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          weight,
          courier: 'jne'
        })
      })

      costs.value = await res.json()
    } finally {
      loading.value = false
    }
  }

  
  return {
    destinations,
    costs,
    loading,
    getWpBase,
    searchDestination,
    getCost
  }
}