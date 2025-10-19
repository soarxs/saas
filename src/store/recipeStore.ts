import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductRecipe, IngredientStock } from '../types';

// RECEITAS DE TODOS OS PRODUTOS (APENAS INGREDIENTES CONTROLADOS)
const DEFAULT_RECIPES: ProductRecipe[] = [
  {
    productId: '01',
    productName: 'X-EGG',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '02',
    productName: 'BAURU',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '03',
    productName: 'HAMBURGUER',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '04',
    productName: 'X-BACON EGG',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '05',
    productName: 'MISTO QUENTE',
    ingredients: [
      { ingredientName: 'Pão de Forma', quantity: 2, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '06',
    productName: 'X-BURGUER',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '07',
    productName: 'MISTO ESPECIAL',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '08',
    productName: 'X-ESPECIAL',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '09',
    productName: 'X-BACON',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '10',
    productName: 'PIK-NIK',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '11',
    productName: 'CALAFRANGO',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 2, unit: 'un' },
      { ingredientName: 'Calabresa', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '12',
    productName: 'KIKOKÓ',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 2, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '13',
    productName: 'FRAMBURGUER',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '14',
    productName: 'X-BLACK',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '15',
    productName: 'X-FRANGO',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '16',
    productName: 'BELISCÃO',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '17',
    productName: 'X-FRANGO ESPECIAL',
    ingredients: [
      { ingredientName: 'Pão de Gergelim', quantity: 1, unit: 'un' },
      { ingredientName: 'Hambúrguer Picanha', quantity: 1, unit: 'un' },
      { ingredientName: 'Cebola Roxa', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '18',
    productName: 'À MODA',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
      { ingredientName: 'Salsicha', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '19',
    productName: 'X-TUDO',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
      { ingredientName: 'Calabresa', quantity: 1, unit: 'un' },
      { ingredientName: 'Salsicha', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '20',
    productName: 'X-EGG BURGUER',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '21',
    productName: 'X-SALADA',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '22',
    productName: 'HAMBÚRGUER ESPECIAL',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '23',
    productName: 'SEM RECLAMAÇÃO',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 2, unit: 'un' },
      { ingredientName: 'Frango', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
      { ingredientName: 'Calabresa', quantity: 1, unit: 'un' },
      { ingredientName: 'Salsicha', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '24',
    productName: 'GOSTOSÃO',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Salsicha', quantity: 1, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '25',
    productName: 'X-PICANHA',
    ingredients: [
      { ingredientName: 'Pão de Gergelim', quantity: 1, unit: 'un' },
      { ingredientName: 'Hambúrguer Picanha', quantity: 1, unit: 'un' },
      { ingredientName: 'Cebola Roxa', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '26',
    productName: 'X-EGG BURGUER ESPECIAL',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Carne (Hambúrguer)', quantity: 2, unit: 'un' },
      { ingredientName: 'Presunto', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '27',
    productName: 'MEXICANO',
    ingredients: [
      { ingredientName: 'Pão', quantity: 1, unit: 'un' },
      { ingredientName: 'Frango', quantity: 1, unit: 'un' },
      { ingredientName: 'Catupiry', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
  {
    productId: '28',
    productName: 'X-PICANHA ESPECIAL',
    ingredients: [
      { ingredientName: 'Pão de Gergelim', quantity: 1, unit: 'un' },
      { ingredientName: 'Hambúrguer Picanha', quantity: 2, unit: 'un' },
      { ingredientName: 'Cebola Roxa', quantity: 1, unit: 'un' },
      { ingredientName: 'Bacon', quantity: 1, unit: 'un' },
      { ingredientName: 'Ovo', quantity: 1, unit: 'un' },
      { ingredientName: 'Queijo', quantity: 1, unit: 'un' },
    ],
  },
];

// ESTOQUE DE INGREDIENTES (APENAS OS CRÍTICOS)
const DEFAULT_INGREDIENT_STOCK: IngredientStock[] = [
  // PÃES
  { id: 'ing-pao', name: 'Pão', currentStock: 200, minStock: 50, unit: 'un', cost: 1.00 },
  { id: 'ing-pao-forma', name: 'Pão de Forma', currentStock: 100, minStock: 20, unit: 'un', cost: 1.50 },
  { id: 'ing-pao-gergelim', name: 'Pão de Gergelim', currentStock: 50, minStock: 15, unit: 'un', cost: 2.00 },
  
  // PROTEÍNAS PRINCIPAIS
  { id: 'ing-carne', name: 'Carne (Hambúrguer)', currentStock: 150, minStock: 30, unit: 'un', cost: 3.00 },
  { id: 'ing-frango', name: 'Frango', currentStock: 150, minStock: 30, unit: 'un', cost: 2.50 },
  { id: 'ing-picanha', name: 'Hambúrguer Picanha', currentStock: 50, minStock: 10, unit: 'un', cost: 5.00 },
  
  // PROTEÍNAS SECUNDÁRIAS
  { id: 'ing-bacon', name: 'Bacon', currentStock: 100, minStock: 20, unit: 'un', cost: 2.00 },
  { id: 'ing-presunto', name: 'Presunto', currentStock: 100, minStock: 20, unit: 'un', cost: 1.00 },
  { id: 'ing-calabresa', name: 'Calabresa', currentStock: 80, minStock: 15, unit: 'un', cost: 2.00 },
  { id: 'ing-salsicha', name: 'Salsicha', currentStock: 80, minStock: 15, unit: 'un', cost: 1.00 },
  
  // OUTROS CRÍTICOS
  { id: 'ing-ovo', name: 'Ovo', currentStock: 200, minStock: 40, unit: 'un', cost: 0.50 },
  { id: 'ing-queijo', name: 'Queijo', currentStock: 150, minStock: 30, unit: 'un', cost: 1.50 },
  { id: 'ing-catupiry', name: 'Catupiry', currentStock: 50, minStock: 10, unit: 'un', cost: 3.00 },
  { id: 'ing-cebola-roxa', name: 'Cebola Roxa', currentStock: 50, minStock: 10, unit: 'un', cost: 0.50 },
];

interface RecipeState {
  recipes: ProductRecipe[];
  ingredientStock: IngredientStock[];
  
  // Ações
  getRecipe: (productId: string) => ProductRecipe | undefined;
  decrementStock: (productId: string, modifications?: string) => boolean;
  getLowStockIngredients: () => IngredientStock[];
  updateIngredientStock: (ingredientName: string, quantity: number) => void;
  processModifications: (modifications: string) => void;
  mapIngredientName: (name: string) => string;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: DEFAULT_RECIPES,
      ingredientStock: DEFAULT_INGREDIENT_STOCK,
      
      getRecipe: (productId) => {
        return get().recipes.find(r => r.productId === productId);
      },
      
      decrementStock: (productId, modifications) => {
        const recipe = get().getRecipe(productId);
        if (!recipe) {
          console.error('❌ Receita não encontrada para produto:', productId);
          return false;
        }
        
        console.log('📋 Decrementando estoque para:', recipe.productName);
        
        // Verificar se há estoque suficiente
        const { ingredientStock } = get();
        for (const ing of recipe.ingredients) {
          const stock = ingredientStock.find(s => s.name === ing.ingredientName);
          if (!stock || stock.currentStock < ing.quantity) {
            console.error(`❌ Estoque insuficiente de ${ing.ingredientName}`);
            return false;
          }
        }
        
        // Decrementar estoque
        set(state => ({
          ingredientStock: state.ingredientStock.map(stock => {
            const ingredient = recipe.ingredients.find(i => i.ingredientName === stock.name);
            if (ingredient) {
              const newStock = stock.currentStock - ingredient.quantity;
              console.log(`✅ ${stock.name}: ${stock.currentStock} → ${newStock}`);
              return { ...stock, currentStock: newStock };
            }
            return stock;
          })
        }));
        
        // Processar modificações (acréscimos)
        if (modifications) {
          get().processModifications(modifications);
        }
        
        return true;
      },
      
      processModifications: (modifications: string) => {
        if (!modifications) return;
        
        const parts = modifications.split(',').map(m => m.trim());
        
        parts.forEach(mod => {
          if (mod.startsWith('+')) {
            // Acréscimo - exemplo: "+2 BACON"
            const match = mod.match(/\+(\d+)\s+(.+)/);
            if (match) {
              const qty = parseInt(match[1]);
              const ingredientName = match[2].trim().toUpperCase();
              
              // Mapear nome para nome do estoque
              const stockName = get().mapIngredientName(ingredientName);
              
              // Decrementar ingrediente adicional
              set(state => ({
                ingredientStock: state.ingredientStock.map(stock => {
                  if (stock.name.toUpperCase() === stockName.toUpperCase()) {
                    console.log(`✅ Acréscimo: -${qty} ${stock.name}`);
                    return { ...stock, currentStock: stock.currentStock - qty };
                  }
                  return stock;
                })
              }));
            }
          }
          // "SEM X" não afeta estoque (ingrediente não usado, mas já estava na receita)
        });
      },
      
      // Função auxiliar para mapear nomes
      mapIngredientName: (name: string) => {
        const mapping: Record<string, string> = {
          'CARNE': 'Carne (Hambúrguer)',
          'FRANGO': 'Frango',
          'BACON': 'Bacon',
          'OVO': 'Ovo',
          'QUEIJO': 'Queijo',
          'PRESUNTO': 'Presunto',
          'CALABRESA': 'Calabresa',
          'SALSICHA': 'Salsicha',
          'CATUPIRY': 'Catupiry',
          'PICANHA': 'Hambúrguer Picanha',
        };
        
        return mapping[name.toUpperCase()] || name;
      },
      
      getLowStockIngredients: () => {
        return get().ingredientStock.filter(ing => ing.currentStock <= ing.minStock);
      },
      
      updateIngredientStock: (ingredientName, quantity) => {
        set(state => ({
          ingredientStock: state.ingredientStock.map(stock => {
            if (stock.name === ingredientName) {
              return { ...stock, currentStock: quantity };
            }
            return stock;
          })
        }));
      },
    }),
    {
      name: 'recipe-storage',
      onRehydrateStorage: () => (state) => {
        // Se não há receitas ou array vazio, inicializar com receitas padrão
        if (!state || !state.recipes || state.recipes.length === 0) {
          console.log('🔄 Inicializando receitas padrão...');
          state.recipes = DEFAULT_RECIPES;
        }
        // Se não há estoque ou array vazio, inicializar com estoque padrão
        if (!state || !state.ingredientStock || state.ingredientStock.length === 0) {
          console.log('🔄 Inicializando estoque padrão...');
          state.ingredientStock = DEFAULT_INGREDIENT_STOCK;
        }
      },
    }
  )
);