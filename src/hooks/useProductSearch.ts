import { useMemo } from 'react';
import { Product, ProductCategory } from '../types';

interface UseProductSearchProps {
  products: Product[];
  searchTerm: string;
  selectedCategory: ProductCategory | 'all';
}

export const useProductSearch = ({ products, searchTerm, selectedCategory }: UseProductSearchProps) => {
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtrar por disponibilidade
      if (!product.available) return false;
      
      // Filtrar por categoria
      if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
      
      // Se não há termo de busca, retornar todos
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase().trim();
      const productName = product.name.toLowerCase();
      const productCode = product.code?.toLowerCase() || '';
      
      // 1. Busca por nome (busca parcial)
      if (productName.includes(searchLower)) return true;
      
      // 2. Busca por código exato
      if (productCode === searchLower) return true;
      
      // 3. Busca por código com zero à esquerda
      if (productCode.padStart(2, '0') === searchLower) return true;
      if (productCode.replace(/^0+/, '') === searchLower) return true;
      
      // 4. Busca numérica (ex: "1" encontra "01")
      const numericSearch = parseInt(searchLower);
      const numericCode = parseInt(productCode);
      if (!isNaN(numericSearch) && !isNaN(numericCode) && numericSearch === numericCode) return true;
      
      // 5. Busca por múltiplos ingredientes (separados por vírgula, espaço ou "e")
      if (product.description) {
        const description = product.description.toLowerCase();
        
        // Dividir termos de busca por vírgula, espaço ou "e"
        const searchTerms = searchLower
          .split(/[,&\s]+/)
          .map(term => term.trim())
          .filter(term => term.length > 0);
        
        // Se há múltiplos termos, todos devem estar presentes
        if (searchTerms.length > 1) {
          return searchTerms.every(term => description.includes(term));
        }
        
        // Busca simples por um termo
        if (description.includes(searchLower)) return true;
      }
      
      return false;
    });
  }, [products, searchTerm, selectedCategory]);

  return filteredProducts;
};
