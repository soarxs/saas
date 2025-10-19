import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ingredient } from '../types';

interface IngredientState {
  ingredients: Ingredient[];
  
  // Ações
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  toggleAvailability: (id: string) => void;
  
  // Consultas
  getAvailableIngredients: () => Ingredient[];
  getIngredientsByCategory: (category: Ingredient['category']) => Ingredient[];
}

// Ingredientes padrão baseados no sistema atual
const DEFAULT_INGREDIENTS: Ingredient[] = [
  // Premium (R$ 5,00 cada)
  { id: 'ing-001', name: 'CARNE', price: 5.00, maxQuantity: 5, category: 'premium', available: true },
  { id: 'ing-002', name: 'FRANGO', price: 5.00, maxQuantity: 5, category: 'premium', available: true },
  { id: 'ing-003', name: 'BACON', price: 5.00, maxQuantity: 5, category: 'premium', available: true },
  
  // Standard (R$ 4,00 cada)
  { id: 'ing-004', name: 'OVO', price: 4.00, maxQuantity: 4, category: 'standard', available: true },
  { id: 'ing-005', name: 'PRESUNTO', price: 4.00, maxQuantity: 4, category: 'standard', available: true },
  { id: 'ing-006', name: 'QUEIJO', price: 4.00, maxQuantity: 4, category: 'standard', available: true },
  { id: 'ing-007', name: 'SALSICHA', price: 4.00, maxQuantity: 4, category: 'standard', available: true },
  
  // Basic (R$ 2-3,00 cada)
  { id: 'ing-008', name: 'ABACAXI', price: 3.00, maxQuantity: 3, category: 'basic', available: true },
  { id: 'ing-009', name: 'BANANA', price: 2.00, maxQuantity: 2, category: 'basic', available: true },
  { id: 'ing-010', name: 'PICANHA', price: 7.00, maxQuantity: 7, category: 'premium', available: true },
];

export const useIngredientStore = create<IngredientState>()(
  persist(
    (set, get) => ({
      ingredients: DEFAULT_INGREDIENTS,
      
      addIngredient: (ingredientData) => {
        const newIngredient: Ingredient = {
          ...ingredientData,
          id: `ing-${Date.now()}`,
        };
        
        set(state => ({
          ingredients: [...state.ingredients, newIngredient]
        }));
      },
      
      updateIngredient: (id, updates) => {
        set(state => ({
          ingredients: state.ingredients.map(ing =>
            ing.id === id ? { ...ing, ...updates } : ing
          )
        }));
      },
      
      toggleAvailability: (id) => {
        set(state => ({
          ingredients: state.ingredients.map(ing =>
            ing.id === id ? { ...ing, available: !ing.available } : ing
          )
        }));
      },
      
      getAvailableIngredients: () => {
        return get().ingredients.filter(ing => ing.available);
      },
      
      getIngredientsByCategory: (category) => {
        return get().ingredients.filter(ing => 
          ing.category === category && ing.available
        );
      },
    }),
    {
      name: 'ingredient-storage',
    }
  )
);
