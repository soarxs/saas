import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => void;
  getLowStockProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
}

// Produtos do cardápio Saas PDV
const defaultProducts: Product[] = [
  { id: '01', name: 'X-EGG', price: 18.50, category: 'hamburguer', available: true, code: '01', description: 'Pão, Carne, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '02', name: 'BAURU', price: 17.50, category: 'hamburguer', available: true, code: '02', description: 'Pão, Ovo, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '03', name: 'HAMBURGUER', price: 15.00, category: 'hamburguer', available: true, code: '03', description: 'Pão, Carne, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '04', name: 'X-BACON EGG', price: 20.00, category: 'hamburguer', available: true, code: '04', description: 'Pão, Carne, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '05', name: 'MISTO QUENTE', price: 13.00, category: 'hamburguer', available: true, code: '05', description: 'Pão de Forma, Presunto e Queijo', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '06', name: 'X-BURGUER', price: 17.50, category: 'hamburguer', available: true, code: '06', description: 'Pão, Carne, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '07', name: 'MISTO ESPECIAL', price: 17.00, category: 'hamburguer', available: true, code: '07', description: 'Pão, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '08', name: 'X-ESPECIAL', price: 23.00, category: 'hamburguer', available: true, code: '08', description: 'Pão, Carne, Bacon, Frango, Ovo, Presunto, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '09', name: 'X-BACON', price: 19.00, category: 'hamburguer', available: true, code: '09', description: 'Pão, Carne, Bacon, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '10', name: 'PIK-NIK', price: 19.00, category: 'hamburguer', available: true, code: '10', description: 'Pão, Bacon, Ovo, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '11', name: 'CALAFRANGO', price: 20.00, category: 'hamburguer', available: true, code: '11', description: 'Pão, 2 Frangos, Calabresa, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '12', name: 'KIKOKÓ', price: 19.00, category: 'hamburguer', available: true, code: '12', description: 'Pão, 2 Frangos, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '13', name: 'FRAMBURGUER', price: 20.00, category: 'hamburguer', available: true, code: '13', description: 'Pão, Frango, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '14', name: 'X-BLACK', price: 20.00, category: 'hamburguer', available: true, code: '14', description: 'Pão, Carne, Bacon, Ovo, Presunto, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '15', name: 'X-FRANGO', price: 21.00, category: 'hamburguer', available: true, code: '15', description: 'Pão, Carne, Frango, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '16', name: 'BELISCÃO', price: 15.00, category: 'hamburguer', available: true, code: '16', description: 'Pão, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '17', name: 'X-FRANGO ESPECIAL', price: 27.00, category: 'hamburguer', available: true, code: '17', description: 'Pão de Gergelim, Hambúrguer de Picanha, Cebola Roxa, Frango, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '18', name: 'À MODA', price: 20.00, category: 'hamburguer', available: true, code: '18', description: 'Pão, Frango, Ovo, Queijo, Salsicha, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '19', name: 'X-TUDO', price: 28.00, category: 'hamburguer', available: true, code: '19', description: 'Pão, Carne, Frango, Bacon, Ovo, Queijo, Presunto, Calabresa, Salsicha, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '20', name: 'X-EGG BURGUER', price: 19.00, category: 'hamburguer', available: true, code: '20', description: 'Pão, Carne, Ovo, Queijo, Presunto, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '21', name: 'X-SALADA', price: 20.00, category: 'hamburguer', available: true, code: '21', description: 'Pão, Carne, Bacon, Queijo, Abacaxi, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '22', name: 'HAMBURGUER ESPECIAL', price: 17.00, category: 'hamburguer', available: true, code: '22', description: 'Pão, Carne, Ovo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '23', name: 'SEM RECLAMAÇÃO', price: 30.00, category: 'hamburguer', available: true, code: '23', description: 'Pão, 2 Carnes, Frango, Bacon, Ovo, Queijo, Presunto, Calabresa, Salsicha, Abacaxi, Banana, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '24', name: 'GOSTOSÃO', price: 21.00, category: 'hamburguer', available: true, code: '24', description: 'Pão, Carne, Bacon, Salsicha, Presunto, Ovo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '25', name: 'X-PICANHA', price: 23.00, category: 'hamburguer', available: true, code: '25', description: 'Pão de Gergelim, Hambúrguer de Picanha, Cebola Roxa, Bacon, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '26', name: 'X-EGG BURGUER ESPECIAL', price: 20.00, category: 'hamburguer', available: true, code: '26', description: 'Pão, 2 Carnes, Presunto, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '27', name: 'MEXICANO', price: 21.00, category: 'hamburguer', available: true, code: '27', description: 'Pão, Frango, Catupiry, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
  { id: '28', name: 'X-PICANHA ESPECIAL', price: 28.00, category: 'hamburguer', available: true, code: '28', description: 'Pão de Gergelim, 2 Hambúrgueres de Picanha, Cebola Roxa, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', currentStock: 50, minStock: 10, maxStock: 100 },
];

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: defaultProducts.map(product => ({
        ...product,
        currentStock: product.currentStock || 50,
        minStock: product.minStock || 10,
        maxStock: product.maxStock || 100
      })),
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: Date.now().toString(),
          code: product.code || Date.now().toString().slice(-3),
          currentStock: product.currentStock || 0,
          minStock: product.minStock || 0,
          maxStock: product.maxStock || 100
        };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },
      updateProduct: (id, productData) => {
        set((state) => ({
          products: state.products.map(product =>
            product.id === id ? { ...product, ...productData } : product
          ),
        }));
      },
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter(product => product.id !== id),
        }));
      },
      updateStock: (id, quantity, operation) => {
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id === id) {
              let newStock = product.currentStock || 0;
              
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
                ...product,
                currentStock: newStock,
                available: newStock > 0
              };
            }
            return product;
          }),
        }));
      },
      getLowStockProducts: () => {
        const { products } = get();
        return products.filter(
          (product) => (product.currentStock || 0) <= (product.minStock || 0) && product.available
        );
      },
      getProductById: (id) => {
        const { products } = get();
        return products.find((product) => product.id === id);
      },
    }),
    {
      name: 'product-store',
      onRehydrateStorage: () => (state) => {
        // Se não há produtos ou array vazio, inicializar com produtos padrão
        if (!state || !state.products || state.products.length === 0) {
          console.log('🔄 Inicializando produtos padrão...');
          state.products = defaultProducts.map(product => ({
            ...product,
            currentStock: product.currentStock || 50,
            minStock: product.minStock || 10,
            maxStock: product.maxStock || 100
          }));
        }
      },
    }
  )
);