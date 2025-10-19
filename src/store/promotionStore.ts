import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'combo';
  value: number; // Porcentagem, valor fixo, ou quantidade
  minQuantity?: number; // Para buy_x_get_y
  freeQuantity?: number; // Para buy_x_get_y
  applicableProducts: string[]; // IDs dos produtos
  applicableCategories: string[]; // Categorias aplicáveis
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number; // Limite de uso total
  usageCount: number; // Quantas vezes foi usado
  createdAt: string;
  createdBy: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  applicableProducts: string[];
  applicableCategories: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  createdBy: string;
}

interface PromotionState {
  promotions: Promotion[];
  coupons: Coupon[];
  
  // Promotions
  addPromotion: (promotion: Omit<Promotion, 'id' | 'createdAt' | 'usageCount'>) => void;
  updatePromotion: (id: string, updates: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  activatePromotion: (id: string) => void;
  deactivatePromotion: (id: string) => void;
  getActivePromotions: () => Promotion[];
  getPromotionsForProduct: (productId: string) => Promotion[];
  
  // Coupons
  addCoupon: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  activateCoupon: (id: string) => void;
  deactivateCoupon: (id: string) => void;
  validateCoupon: (code: string) => Coupon | null;
  useCoupon: (code: string) => boolean;
  getActiveCoupons: () => Coupon[];
  
  // Utils
  calculateDiscount: (productId: string, quantity: number, couponCode?: string) => number;
  getAvailablePromotions: () => Promotion[];
  getAvailableCoupons: () => Coupon[];
}

const defaultPromotions: Promotion[] = [
  {
    id: '1',
    name: 'Combo X-Bacon + Refrigerante',
    description: 'Combo especial com desconto',
    type: 'combo',
    value: 5.00,
    applicableProducts: ['01', '02'], // X-Bacon e Refrigerante
    applicableCategories: ['lanches', 'bebidas'],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    isActive: true,
    usageLimit: 100,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '2',
    name: '3 por 2 - X-Egg',
    description: 'Leve 3 X-Egg e pague apenas 2',
    type: 'buy_x_get_y',
    value: 0,
    minQuantity: 3,
    freeQuantity: 1,
    applicableProducts: ['03'], // X-Egg
    applicableCategories: ['lanches'],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
    isActive: true,
    usageLimit: 50,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  }
];

const defaultCoupons: Coupon[] = [
  {
    id: '1',
    code: 'LANCHE10',
    name: 'Desconto 10%',
    description: '10% de desconto em qualquer lanche',
    type: 'percentage',
    value: 10,
    minOrderValue: 20.00,
    maxDiscount: 10.00,
    applicableProducts: [],
    applicableCategories: ['lanches'],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
    isActive: true,
    usageLimit: 100,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '2',
    code: 'PRIMEIRA5',
    name: 'R$ 5,00 OFF',
    description: 'R$ 5,00 de desconto na primeira compra',
    type: 'fixed',
    value: 5.00,
    minOrderValue: 15.00,
    applicableProducts: [],
    applicableCategories: [],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    isActive: true,
    usageLimit: 200,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  }
];

export const usePromotionStore = create<PromotionState>()(
  persist(
    (set, get) => ({
      promotions: defaultPromotions,
      coupons: defaultCoupons,

      // Promotions
      addPromotion: (promotion) => {
        const newPromotion: Promotion = {
          ...promotion,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          usageCount: 0,
        };
        set((state) => ({
          promotions: [...state.promotions, newPromotion],
        }));
      },

      updatePromotion: (id, updates) => {
        set((state) => ({
          promotions: state.promotions.map((promotion) =>
            promotion.id === id ? { ...promotion, ...updates } : promotion
          ),
        }));
      },

      deletePromotion: (id) => {
        set((state) => ({
          promotions: state.promotions.filter((promotion) => promotion.id !== id),
        }));
      },

      activatePromotion: (id) => {
        set((state) => ({
          promotions: state.promotions.map((promotion) =>
            promotion.id === id ? { ...promotion, isActive: true } : promotion
          ),
        }));
      },

      deactivatePromotion: (id) => {
        set((state) => ({
          promotions: state.promotions.map((promotion) =>
            promotion.id === id ? { ...promotion, isActive: false } : promotion
          ),
        }));
      },

      getActivePromotions: () => {
        const { promotions } = get();
        const now = new Date();
        return promotions.filter((promotion) => {
          const startDate = new Date(promotion.startDate);
          const endDate = new Date(promotion.endDate);
          return (
            promotion.isActive &&
            now >= startDate &&
            now <= endDate &&
            (!promotion.usageLimit || promotion.usageCount < promotion.usageLimit)
          );
        });
      },

      getPromotionsForProduct: (productId) => {
        const activePromotions = get().getActivePromotions();
        return activePromotions.filter((promotion) =>
          promotion.applicableProducts.includes(productId) ||
          promotion.applicableProducts.length === 0
        );
      },

      // Coupons
      addCoupon: (coupon) => {
        const newCoupon: Coupon = {
          ...coupon,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          usageCount: 0,
        };
        set((state) => ({
          coupons: [...state.coupons, newCoupon],
        }));
      },

      updateCoupon: (id, updates) => {
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === id ? { ...coupon, ...updates } : coupon
          ),
        }));
      },

      deleteCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.filter((coupon) => coupon.id !== id),
        }));
      },

      activateCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === id ? { ...coupon, isActive: true } : coupon
          ),
        }));
      },

      deactivateCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === id ? { ...coupon, isActive: false } : coupon
          ),
        }));
      },

      validateCoupon: (code) => {
        const { coupons } = get();
        const now = new Date();
        const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
        
        if (!coupon) return null;
        
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);
        
        if (
          !coupon.isActive ||
          now < startDate ||
          now > endDate ||
          (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
        ) {
          return null;
        }
        
        return coupon;
      },

      useCoupon: (code) => {
        const coupon = get().validateCoupon(code);
        if (!coupon) return false;
        
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === coupon.id ? { ...c, usageCount: c.usageCount + 1 } : c
          ),
        }));
        
        return true;
      },

      getActiveCoupons: () => {
        const { coupons } = get();
        const now = new Date();
        return coupons.filter((coupon) => {
          const startDate = new Date(coupon.startDate);
          const endDate = new Date(coupon.endDate);
          return (
            coupon.isActive &&
            now >= startDate &&
            now <= endDate &&
            (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
          );
        });
      },

      // Utils
      calculateDiscount: (productId, quantity, couponCode) => {
        let totalDiscount = 0;
        
        // Aplicar promoções
        const promotions = get().getPromotionsForProduct(productId);
        promotions.forEach((promotion) => {
          switch (promotion.type) {
            case 'percentage':
              // Implementar cálculo de porcentagem
              break;
            case 'fixed':
              totalDiscount += promotion.value;
              break;
            case 'buy_x_get_y':
              if (promotion.minQuantity && promotion.freeQuantity) {
                const freeItems = Math.floor(quantity / promotion.minQuantity) * promotion.freeQuantity;
                // Aqui precisaríamos do preço do produto para calcular o desconto
                // totalDiscount += freeItems * productPrice;
              }
              break;
            case 'combo':
              totalDiscount += promotion.value;
              break;
          }
        });
        
        // Aplicar cupom
        if (couponCode) {
          const coupon = get().validateCoupon(couponCode);
          if (coupon) {
            switch (coupon.type) {
              case 'percentage':
                // Implementar cálculo de porcentagem
                break;
              case 'fixed':
                totalDiscount += coupon.value;
                break;
            }
          }
        }
        
        return totalDiscount;
      },

      getAvailablePromotions: () => {
        return get().getActivePromotions();
      },

      getAvailableCoupons: () => {
        return get().getActiveCoupons();
      },
    }),
    {
      name: 'promotion-store',
    }
  )
);





