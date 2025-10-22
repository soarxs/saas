// Sistema de configuração de bairros e taxas de entrega

export interface Neighborhood {
  id: string
  name: string
  delivery_fee: number
  created_at: string
  updated_at: string
}

// Bairros padrão
const defaultNeighborhoods: Neighborhood[] = [
  {
    id: '1',
    name: 'Centro',
    delivery_fee: 3.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Bairro Norte',
    delivery_fee: 5.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Bairro Sul',
    delivery_fee: 5.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Bairro Leste',
    delivery_fee: 7.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Bairro Oeste',
    delivery_fee: 7.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const neighborhoodsStorage = {
  getNeighborhoods: (): Neighborhood[] => {
    const stored = localStorage.getItem('neighborhoods')
    if (!stored) {
      localStorage.setItem('neighborhoods', JSON.stringify(defaultNeighborhoods))
      return defaultNeighborhoods
    }
    return JSON.parse(stored)
  },

  saveNeighborhoods: (neighborhoods: Neighborhood[]): void => {
    localStorage.setItem('neighborhoods', JSON.stringify(neighborhoods))
  },

  addNeighborhood: (name: string, deliveryFee: number): Neighborhood => {
    const neighborhoods = neighborhoodsStorage.getNeighborhoods()
    const newNeighborhood: Neighborhood = {
      id: Date.now().toString(),
      name,
      delivery_fee: deliveryFee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const updatedNeighborhoods = [...neighborhoods, newNeighborhood]
    neighborhoodsStorage.saveNeighborhoods(updatedNeighborhoods)
    return newNeighborhood
  },

  updateNeighborhood: (id: string, name: string, deliveryFee: number): void => {
    const neighborhoods = neighborhoodsStorage.getNeighborhoods()
    const updatedNeighborhoods = neighborhoods.map(neighborhood =>
      neighborhood.id === id
        ? { ...neighborhood, name, delivery_fee: deliveryFee, updated_at: new Date().toISOString() }
        : neighborhood
    )
    neighborhoodsStorage.saveNeighborhoods(updatedNeighborhoods)
  },

  deleteNeighborhood: (id: string): void => {
    const neighborhoods = neighborhoodsStorage.getNeighborhoods()
    const updatedNeighborhoods = neighborhoods.filter(neighborhood => neighborhood.id !== id)
    neighborhoodsStorage.saveNeighborhoods(updatedNeighborhoods)
  },

  getNeighborhoodByName: (name: string): Neighborhood | null => {
    const neighborhoods = neighborhoodsStorage.getNeighborhoods()
    return neighborhoods.find(n => n.name.toLowerCase() === name.toLowerCase()) || null
  }
}
