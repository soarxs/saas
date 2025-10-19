import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Ingredient {
  id: string;
  name: string;
  category: 'premium' | 'basic' | 'free';
  price: number;
  unit: 'unidade' | 'kg' | 'litro' | 'pacote';
  currentStock: number;
  minStock: number;
  maxStock: number;
  cost: number;
  supplier?: string;
  lastUpdated: string;
  isActive: boolean;
}

interface IngredientState {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'lastUpdated'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => void;
  getLowStockIngredients: () => Ingredient[];
  getIngredientById: (id: string) => Ingredient | undefined;
  getIngredientsByCategory: (category: string) => Ingredient[];
}

// Ingredientes padrão baseados no sistema atual
const defaultIngredients: Ingredient[] = [
  // Premium (R$ 5,00)
  { id: '1', name: 'Carne', category: 'premium', price: 5.00, unit: 'unidade', currentStock: 50, minStock: 10, maxStock: 100, cost: 3.50, supplier: 'Açougue Central', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '2', name: 'Frango', category: 'premium', price: 5.00, unit: 'unidade', currentStock: 30, minStock: 5, maxStock: 80, cost: 3.20, supplier: 'Açougue Central', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '3', name: 'Bacon', category: 'premium', price: 5.00, unit: 'kg', currentStock: 5, minStock: 2, maxStock: 15, cost: 35.00, supplier: 'Distribuidora ABC', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '4', name: 'Frutas (Abacaxi + Banana)', category: 'premium', price: 5.00, unit: 'unidade', currentStock: 20, minStock: 5, maxStock: 50, cost: 2.80, supplier: 'Hortifruti Verde', lastUpdated: new Date().toISOString(), isActive: true },
  
  // Basic (R$ 3,00)
  { id: '5', name: 'Ovo', category: 'basic', price: 3.00, unit: 'unidade', currentStock: 100, minStock: 20, maxStock: 200, cost: 0.50, supplier: 'Granja São José', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '6', name: 'Presunto', category: 'basic', price: 3.00, unit: 'kg', currentStock: 3, minStock: 1, maxStock: 10, cost: 25.00, supplier: 'Distribuidora ABC', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '7', name: 'Queijo', category: 'basic', price: 3.00, unit: 'kg', currentStock: 4, minStock: 1, maxStock: 12, cost: 28.00, supplier: 'Distribuidora ABC', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '8', name: 'Calabresa', category: 'basic', price: 3.00, unit: 'kg', currentStock: 2, minStock: 1, maxStock: 8, cost: 22.00, supplier: 'Distribuidora ABC', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '9', name: 'Salsicha', category: 'basic', price: 3.00, unit: 'kg', currentStock: 3, minStock: 1, maxStock: 10, cost: 18.00, supplier: 'Distribuidora ABC', lastUpdated: new Date().toISOString(), isActive: true },
  
  // Basic (R$ 2,00)
  { id: '10', name: 'Abacaxi', category: 'basic', price: 2.00, unit: 'unidade', currentStock: 15, minStock: 3, maxStock: 30, cost: 1.20, supplier: 'Hortifruti Verde', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '11', name: 'Banana', category: 'basic', price: 2.00, unit: 'unidade', currentStock: 25, minStock: 5, maxStock: 50, cost: 0.80, supplier: 'Hortifruti Verde', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '12', name: 'Catupiry', category: 'basic', price: 2.00, unit: 'kg', currentStock: 2, minStock: 1, maxStock: 6, cost: 15.00, supplier: 'Distribuidora ABC', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '13', name: 'Cebola', category: 'basic', price: 2.00, unit: 'kg', currentStock: 8, minStock: 2, maxStock: 20, cost: 4.50, supplier: 'Hortifruti Verde', lastUpdated: new Date().toISOString(), isActive: true },
  
  // Free (R$ 0,00)
  { id: '14', name: 'Alface', category: 'free', price: 0.00, unit: 'unidade', currentStock: 20, minStock: 5, maxStock: 40, cost: 0.30, supplier: 'Hortifruti Verde', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '15', name: 'Tomate', category: 'free', price: 0.00, unit: 'kg', currentStock: 5, minStock: 1, maxStock: 15, cost: 6.00, supplier: 'Hortifruti Verde', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '16', name: 'Milho', category: 'free', price: 0.00, unit: 'kg', currentStock: 3, minStock: 1, maxStock: 8, cost: 8.00, supplier: 'Distribuidora ABC', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '17', name: 'Batata', category: 'free', price: 0.00, unit: 'kg', currentStock: 10, minStock: 3, maxStock: 25, cost: 3.50, supplier: 'Hortifruti Verde', lastUpdated: new Date().toISOString(), isActive: true },
  { id: '18', name: 'Maionese', category: 'free', price: 0.00, unit: 'kg', currentStock: 2, minStock: 1, maxStock: 5, cost: 12.00, supplier: 'Distribuidora ABC', lastUpdated: new Date().toISOString(), isActive: true },
];

export const useIngredientStore = create<IngredientState>()(
  persist(
    (set, get) => ({
      ingredients: defaultIngredients,

      addIngredient: (ingredient) => {
        const newIngredient: Ingredient = {
          ...ingredient,
          id: Date.now().toString(),
          lastUpdated: new Date().toISOString(),
        };
        set((state) => ({
          ingredients: [...state.ingredients, newIngredient],
        }));
      },

      updateIngredient: (id, updates) => {
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) =>
            ingredient.id === id
              ? { ...ingredient, ...updates, lastUpdated: new Date().toISOString() }
              : ingredient
          ),
        }));
      },

      deleteIngredient: (id) => {
        set((state) => ({
          ingredients: state.ingredients.filter((ingredient) => ingredient.id !== id),
        }));
      },

      updateStock: (id, quantity, operation) => {
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) => {
            if (ingredient.id === id) {
              let newStock = ingredient.currentStock;
              
              switch (operation) {
                case 'add':
                  newStock += quantity;
                  break;
                case 'subtract':
                  newStock = Math.max(0, newStock - quantity);
                  break;
                case 'set':
                  newStock = Math.max(0, quantity);
                  break;
              }

              return {
                ...ingredient,
                currentStock: newStock,
                lastUpdated: new Date().toISOString(),
              };
            }
            return ingredient;
          }),
        }));
      },

      getLowStockIngredients: () => {
        const { ingredients } = get();
        return ingredients.filter(
          (ingredient) => ingredient.currentStock <= ingredient.minStock && ingredient.isActive
        );
      },

      getIngredientById: (id) => {
        const { ingredients } = get();
        return ingredients.find((ingredient) => ingredient.id === id);
      },

      getIngredientsByCategory: (category) => {
        const { ingredients } = get();
        return ingredients.filter((ingredient) => ingredient.category === category);
      },
    }),
    {
      name: 'ingredient-store',
    }
  )
);





