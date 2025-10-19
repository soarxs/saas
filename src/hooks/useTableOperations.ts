import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useRecipeStore } from '../store/recipeStore';
import { toast } from 'sonner';

/**
 * Hook para operações de mesa
 */
export const useTableOperations = () => {
  const { 
    products, 
    tables, 
    addToTable, 
    removeFromTable, 
    updateIndividualProduct, 
    completeTableSale,
    syncAllStores 
  } = useStore();
  const { decrementStock } = useRecipeStore();

  /**
   * Adiciona produto à mesa com validação de estoque
   */
  const addProductToTable = useCallback((
    tableNumber: number,
    product: any,
    quantity: number,
    modifications: string,
    customPrice: number
  ) => {
    console.log('Adicionando produto à mesa:', {
      product: product.name,
      quantity,
      modifications,
      customPrice,
      tableNumber
    });
    
    // Verificar estoque antes de adicionar
    let stockSuccess = true;
    for (let i = 0; i < quantity; i++) {
      const success = decrementStock(product.id, modifications);
      if (!success) {
        stockSuccess = false;
        break;
      }
    }
    
    if (!stockSuccess) {
      toast.error('Estoque insuficiente! Verifique os ingredientes disponíveis.');
      return false;
    }
    
    // Adicionar à mesa múltiplas vezes (uma para cada quantidade)
    for (let i = 0; i < quantity; i++) {
      addToTable(tableNumber, {
        ...product,
        price: customPrice,
        modifications: modifications
      }, 1);
    }
    
    toast.success(`${quantity}x ${product.name} adicionado!`);
    return true;
  }, [addToTable, decrementStock]);

  /**
   * Remove produto da mesa
   */
  const removeProductFromTable = useCallback((
    tableNumber: number,
    productId: string,
    uniqueId?: string
  ) => {
    removeFromTable(tableNumber, productId, uniqueId);
    toast.success('Produto removido!');
  }, [removeFromTable]);

  /**
   * Finaliza venda da mesa
   */
  const finalizeTableSale = useCallback(async (
    tableNumber: number,
    paymentMethod: any
  ) => {
    try {
      console.log('Finalizando venda da mesa:', {
        paymentMethod,
        tableNumber
      });
      
      // Finalizar mesa (isso já cria a venda e limpa a mesa)
      completeTableSale(tableNumber, paymentMethod);
      
      // Sincronizar stores após finalizar venda
      setTimeout(() => {
        syncAllStores();
      }, 100);
      
      toast.success('Pagamento confirmado!');
      return true;
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast.error('Erro ao processar pagamento');
      return false;
    }
  }, [completeTableSale, syncAllStores]);

  /**
   * Busca produto por código
   */
  const searchProductByCode = useCallback((code: string) => {
    if (!code.trim()) {
      toast.error('Digite um código');
      return null;
    }
    
    // Normalizar código (remover zeros à esquerda extras)
    const normalizedCode = code.trim().padStart(2, '0');
    
    console.log('🔍 Buscando código:', normalizedCode);
    console.log('📦 Produtos disponíveis:', products.length);
    
    // Buscar produto por código
    const product = products.find(p => {
      const productCode = p.code.padStart(2, '0');
      console.log(`Comparando: "${productCode}" === "${normalizedCode}"`);
      return productCode === normalizedCode;
    });

    if (product) {
      console.log('✅ Produto encontrado:', product);
      return product;
    } else {
      console.error('❌ Produto NÃO encontrado para código:', code);
      console.log('Códigos disponíveis:', products.map(p => p.code));
      toast.error(`Produto ${code} não encontrado`);
      return null;
    }
  }, [products]);

  /**
   * Obtém dados da mesa
   */
  const getTableData = useCallback((tableNumber: number) => {
    const currentTable = tables.find(t => t.id === tableNumber);
    const tableOrders = currentTable?.orders || [];
    const tableTotal = tableOrders.reduce((sum, item) => sum + item.subtotal, 0);
    
    return {
      table: currentTable,
      orders: tableOrders,
      total: tableTotal,
      hasItems: tableOrders.length > 0
    };
  }, [tables]);

  return {
    addProductToTable,
    removeProductFromTable,
    finalizeTableSale,
    searchProductByCode,
    getTableData
  };
};
