import { useCallback } from 'react';
import { useOffline } from './useOffline';
import { useSalesStore } from '../store/salesStore';
import { useTableStore } from '../store/tableStore';
import { useProductStore } from '../store/productStore';
import { useIngredientStore } from '../store/ingredientStore';
import { usePromotionStore } from '../store/promotionStore';

export const useOfflineOperations = () => {
  const { executeOperation, isOnline } = useOffline();
  const { completeSale } = useSalesStore();
  const { completeTableSale } = useTableStore();
  const { addProduct, updateProduct, deleteProduct } = useProductStore();
  const { addIngredient, updateIngredient, deleteIngredient, updateStock } = useIngredientStore();
  const { addPromotion, updatePromotion, deletePromotion, addCoupon, updateCoupon, deleteCoupon } = usePromotionStore();

  // Operações de vendas
  const completeSaleOffline = useCallback(async (paymentMethod: PaymentMethod, discount: number, discountType: 'value' | 'percentage') => {
    await executeOperation('sale', { paymentMethod, discount, discountType }, async () => {
      await completeSale(paymentMethod, discount, discountType);
    });
  }, [executeOperation, completeSale]);

  const completeTableSaleOffline = useCallback(async (tableNumber: number, paymentMethod: PaymentMethod) => {
    await executeOperation('sale', { tableNumber, paymentMethod }, async () => {
      await completeTableSale(tableNumber, paymentMethod);
    });
  }, [executeOperation, completeTableSale]);

  // Operações de produtos
  const addProductOffline = useCallback(async (product: any) => {
    await executeOperation('product', { action: 'add', data: product }, async () => {
      await addProduct(product);
    });
  }, [executeOperation, addProduct]);

  const updateProductOffline = useCallback(async (id: string, product: any) => {
    await executeOperation('product', { action: 'update', id, data: product }, async () => {
      await updateProduct(id, product);
    });
  }, [executeOperation, updateProduct]);

  const deleteProductOffline = useCallback(async (id: string) => {
    await executeOperation('product', { action: 'delete', id }, async () => {
      await deleteProduct(id);
    });
  }, [executeOperation, deleteProduct]);

  // Operações de ingredientes
  const addIngredientOffline = useCallback(async (ingredient: any) => {
    await executeOperation('ingredient', { action: 'add', data: ingredient }, async () => {
      await addIngredient(ingredient);
    });
  }, [executeOperation, addIngredient]);

  const updateIngredientOffline = useCallback(async (id: string, ingredient: any) => {
    await executeOperation('ingredient', { action: 'update', id, data: ingredient }, async () => {
      await updateIngredient(id, ingredient);
    });
  }, [executeOperation, updateIngredient]);

  const deleteIngredientOffline = useCallback(async (id: string) => {
    await executeOperation('ingredient', { action: 'delete', id }, async () => {
      await deleteIngredient(id);
    });
  }, [executeOperation, deleteIngredient]);

  const updateStockOffline = useCallback(async (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => {
    await executeOperation('ingredient', { action: 'updateStock', id, quantity, operation }, async () => {
      await updateStock(id, quantity, operation);
    });
  }, [executeOperation, updateStock]);

  // Operações de promoções
  const addPromotionOffline = useCallback(async (promotion: any) => {
    await executeOperation('promotion', { action: 'add', data: promotion }, async () => {
      await addPromotion(promotion);
    });
  }, [executeOperation, addPromotion]);

  const updatePromotionOffline = useCallback(async (id: string, promotion: any) => {
    await executeOperation('promotion', { action: 'update', id, data: promotion }, async () => {
      await updatePromotion(id, promotion);
    });
  }, [executeOperation, updatePromotion]);

  const deletePromotionOffline = useCallback(async (id: string) => {
    await executeOperation('promotion', { action: 'delete', id }, async () => {
      await deletePromotion(id);
    });
  }, [executeOperation, deletePromotion]);

  const addCouponOffline = useCallback(async (coupon: any) => {
    await executeOperation('promotion', { action: 'addCoupon', data: coupon }, async () => {
      await addCoupon(coupon);
    });
  }, [executeOperation, addCoupon]);

  const updateCouponOffline = useCallback(async (id: string, coupon: any) => {
    await executeOperation('promotion', { action: 'updateCoupon', id, data: coupon }, async () => {
      await updateCoupon(id, coupon);
    });
  }, [executeOperation, updateCoupon]);

  const deleteCouponOffline = useCallback(async (id: string) => {
    await executeOperation('promotion', { action: 'deleteCoupon', id }, async () => {
      await deleteCoupon(id);
    });
  }, [executeOperation, deleteCoupon]);

  return {
    // Vendas
    completeSaleOffline,
    completeTableSaleOffline,
    
    // Produtos
    addProductOffline,
    updateProductOffline,
    deleteProductOffline,
    
    // Ingredientes
    addIngredientOffline,
    updateIngredientOffline,
    deleteIngredientOffline,
    updateStockOffline,
    
    // Promoções
    addPromotionOffline,
    updatePromotionOffline,
    deletePromotionOffline,
    addCouponOffline,
    updateCouponOffline,
    deleteCouponOffline,
    
    // Status
    isOnline
  };
};





