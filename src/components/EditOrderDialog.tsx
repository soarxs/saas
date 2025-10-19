import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { Plus, Minus, X, Edit } from 'lucide-react';

interface EditOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  productId: string;
  uniqueId: string;
  productName: string;
  currentQuantity: number;
  currentPrice: number;
}

// Definição dos ingredientes e seus valores
const INGREDIENTS = {
  // Grupo 1: R$ 5,00
  premium: {
    items: ['carne', 'frango', 'bacon', 'frutas'],
    price: 5.00
  },
  // Grupo 2: R$ 3,00
  standard: {
    items: ['ovo', 'presunto', 'queijo', 'calabresa', 'salsicha'],
    price: 3.00
  },
  // Grupo 3: R$ 2,00
  basic: {
    items: ['abacaxi', 'banana', 'catupiry', 'cebola'],
    price: 2.00
  },
  // Grupo 4: R$ 0,00
  free: {
    items: ['alface', 'tomate', 'milho', 'batata', 'maionese'],
    price: 0.00
  }
};

// Grupos de permuta (ingredientes de mesmo valor que podem ser trocados)
const EXCHANGE_GROUPS = {
  premium: ['carne', 'frango', 'bacon', 'frutas'], // R$ 5,00
  standard: ['ovo', 'presunto', 'queijo', 'calabresa', 'salsicha'], // R$ 3,00
  basic: ['abacaxi', 'banana', 'catupiry', 'cebola'], // R$ 2,00
  free: ['alface', 'tomate', 'milho', 'batata', 'maionese'] // R$ 0,00
};

// Sistema de Estoque de Ingredientes
const INGREDIENT_STOCK: Record<string, number> = {
  // Premium (R$ 5,00)
  'carne': 100,
  'frango': 100,
  'bacon': 100,
  'frutas': 100,
  
  // Padrão (R$ 3,00)
  'ovo': 100,
  'presunto': 100,
  'queijo': 100,
  'calabresa': 100,
  'salsicha': 100,
  
  // Básico (R$ 2,00)
  'abacaxi': 100,
  'banana': 100,
  'catupiry': 100,
  'cebola': 100,
  
  // Gratuito (R$ 0,00)
  'alface': 100,
  'tomate': 100,
  'milho': 100,
  'batata': 100,
  'maionese': 100
};

// Receitas dos produtos baseadas nas descrições reais do cardápio
const PRODUCT_RECIPES: Record<string, Record<string, number>> = {
  '01': { // X-EGG: Pão, Carne, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '02': { // BAURU: Pão, Ovo, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'ovo': 1,
    'presunto': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '03': { // HAMBURGUER: Pão, Carne, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '04': { // X-BACON EGG: Pão, Carne, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'bacon': 1,
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '05': { // MISTO QUENTE: Pão de Forma, Presunto e Queijo
    'presunto': 1,
    'queijo': 1
  },
  '06': { // X-BURGUER: Pão, Carne, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '07': { // MISTO ESPECIAL: Pão, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'presunto': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '08': { // X-ESPECIAL: Pão, Carne, Bacon, Frango, Ovo, Presunto, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'bacon': 1,
    'frango': 1,
    'ovo': 1,
    'presunto': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '09': { // X-BACON: Pão, Carne, Bacon, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'bacon': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '10': { // PIK-NIK: Pão, Bacon, Ovo, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'bacon': 1,
    'ovo': 1,
    'presunto': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '11': { // CALAFRANGO: Pão, 2 Frangos, Calabresa, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'frango': 2,
    'calabresa': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '12': { // KIKOKÓ: Pão, 2 Frangos, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'frango': 2,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '13': { // FRAMBURGUER: Pão, Frango, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'frango': 1,
    'bacon': 1,
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '14': { // X-BLACK: Pão, Carne, Bacon, Ovo, Presunto, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'bacon': 1,
    'ovo': 1,
    'presunto': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '15': { // X-FRANGO: Pão, Carne, Frango, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'frango': 1,
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '16': { // BELISCÃO: Pão, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '17': { // X-FRANGO ESPECIAL: Pão de Gergelim, Hambúrguer de Picanha, Cebola Roxa, Frango, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1, // Hambúrguer de Picanha
    'cebola': 1, // Cebola Roxa
    'frango': 1,
    'bacon': 1,
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '18': { // Á MODA: Pão, Frango, Ovo, Queijo, Salsicha, Maionese, Alface, Tomate, Batata e Milho
    'frango': 1,
    'ovo': 1,
    'queijo': 1,
    'salsicha': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '19': { // X-TUDO: Pão, Carne, Frango, Bacon, Ovo, Queijo, Presunto, Calabresa, Salsicha, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'frango': 1,
    'bacon': 1,
    'ovo': 1,
    'queijo': 1,
    'presunto': 1,
    'calabresa': 1,
    'salsicha': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '20': { // X-EGG BURGUER: Pão, Carne, Ovo, Queijo, Presunto, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'ovo': 1,
    'queijo': 1,
    'presunto': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '21': { // X-SALADA: Pão, Carne, Bacon, Queijo, Abacaxi, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'bacon': 1,
    'queijo': 1,
    'abacaxi': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '22': { // HAMBURGUER ESPECIAL: Pão, Carne, Ovo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'ovo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '23': { // SEM RECLAMAÇÃO: Pão, 2 Carnes, Frango, Bacon, Ovo, Queijo, Presunto, Calabresa, Salsicha, Abacaxi, Banana, Maionese, Alface, Tomate, Batata e Milho
    'carne': 2,
    'frango': 1,
    'bacon': 1,
    'ovo': 1,
    'queijo': 1,
    'presunto': 1,
    'calabresa': 1,
    'salsicha': 1,
    'abacaxi': 1,
    'banana': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '24': { // GOSTOSÃO: Pão, Carne, Bacon, Salsicha, Presunto, Ovo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1,
    'bacon': 1,
    'salsicha': 1,
    'presunto': 1,
    'ovo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '25': { // X-PICANHA: Pão de Gergelim, Hambúrguer de Picanha, Cebola Roxa, Bacon, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 1, // Hambúrguer de Picanha
    'cebola': 1, // Cebola Roxa
    'bacon': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '26': { // X-EGG BURGUER ESPECIAL: Pão, 2 Carnes, Presunto, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 2,
    'presunto': 1,
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '27': { // MEXICANO: Pão, Frango, Catupiry, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'frango': 1,
    'catupiry': 1,
    'bacon': 1,
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  },
  '28': { // X-PICANHA ESPECIAL: Pão de Gergelim, 2 Hambúrgueres de Picanha, Cebola Roxa, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho
    'carne': 2, // 2 Hambúrgueres de Picanha
    'cebola': 1, // Cebola Roxa
    'bacon': 1,
    'ovo': 1,
    'queijo': 1,
    'maionese': 1,
    'alface': 1,
    'tomate': 1,
    'batata': 1,
    'milho': 1
  }
};

const EditOrderDialog = ({ 
  isOpen, 
  onClose, 
  tableNumber, 
  productId, 
  uniqueId,
  productName, 
  currentQuantity, 
  currentPrice 
}: EditOrderDialogProps) => {
  const { updateTableQuantity, updateIndividualProduct } = useStore();
  const [quantity, setQuantity] = useState(currentQuantity);
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({});
  const [basePrice, setBasePrice] = useState(currentPrice / currentQuantity);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    quantity: number;
    newPrice: number;
    ingredients: Record<string, number>;
  } | null>(null);
  const [editingIngredientPrice, setEditingIngredientPrice] = useState<string | null>(null);
  const [customIngredientPrices, setCustomIngredientPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      setQuantity(currentQuantity);
      setBasePrice(currentPrice / currentQuantity);
      
      // Carregar receita do produto (sempre resetar para a receita original)
      const productRecipe = PRODUCT_RECIPES[productId] || {};
      
      setIngredientQuantities({ ...productRecipe }); // Cópia da receita original
      setShowAllIngredients(false); // Reset show all when dialog opens
      setCustomIngredientPrices({}); // Reset preços customizados
      setEditingIngredientPrice(null); // Reset edição de preço
    }
  }, [isOpen, currentQuantity, currentPrice, productId]);

  const calculateTotalPrice = () => {
    const priceBreakdown = getPriceBreakdown();
    return (basePrice + priceBreakdown.total) * quantity;
  };

  const handleIngredientQuantity = (ingredient: string, change: number) => {
    setIngredientQuantities(prev => {
      const currentQty = prev[ingredient] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [ingredient]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [ingredient]: newQty };
    });
  };

  const handleSave = () => {
    const newTotalPrice = calculateTotalPrice();
    
    // Preparar mudanças para confirmação
    setPendingChanges({
      quantity,
      newPrice: newTotalPrice / quantity,
      ingredients: { ...ingredientQuantities }
    });
    setShowConfirmation(true);
  };

  const confirmChanges = () => {
    if (!pendingChanges) return;

    // Atualizar produto individual com novo preço e modificações
    const modifications = Object.entries(ingredientQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ingredient, qty]) => `${ingredient}: ${qty}x`)
      .join(', ');

    updateIndividualProduct(tableNumber, uniqueId, pendingChanges.newPrice, modifications);
    
    toast.success('Pedido atualizado com sucesso!');
    setShowConfirmation(false);
    setPendingChanges(null);
    onClose();
  };

  const cancelChanges = () => {
    setShowConfirmation(false);
    setPendingChanges(null);
  };

  const handleClose = () => {
    // Reset todos os estados quando fechar
    setShowConfirmation(false);
    setPendingChanges(null);
    setEditingIngredientPrice(null);
    setCustomIngredientPrices({});
    setShowAllIngredients(false);
    onClose();
  };

  const getIngredientPrice = (ingredient: string) => {
    // Verificar se há preço customizado
    if (customIngredientPrices[ingredient] !== undefined) {
      return customIngredientPrices[ingredient];
    }
    
    // Usar preço padrão do grupo
    for (const [groupKey, group] of Object.entries(INGREDIENTS)) {
      if (group.items.includes(ingredient)) {
        return group.price;
      }
    }
    return 0;
  };

  const getIngredientQuantity = (ingredient: string) => {
    const qty = ingredientQuantities[ingredient] || 0;
    console.log(`Ingrediente ${ingredient}: quantidade ${qty} (de ingredientQuantities:`, ingredientQuantities, ')');
    return qty;
  };

  const getIngredientStock = (ingredient: string) => {
    return INGREDIENT_STOCK[ingredient] || 0;
  };

  const handleEditIngredientPrice = (ingredient: string) => {
    setEditingIngredientPrice(ingredient);
  };

  const handleSaveIngredientPrice = (ingredient: string, newPrice: number) => {
    setCustomIngredientPrices(prev => ({
      ...prev,
      [ingredient]: newPrice
    }));
    setEditingIngredientPrice(null);
  };

  const handleCancelEditPrice = () => {
    setEditingIngredientPrice(null);
  };

  const getPriceBreakdown = () => {
    const productRecipe = PRODUCT_RECIPES[productId] || {};
    
    // Calcular acréscimos (ingredientes extras que não estavam na receita original)
    const extraIngredientsTotal = Object.entries(ingredientQuantities).reduce((total, [ingredient, qty]) => {
      const originalQty = productRecipe[ingredient] || 0;
      
      // Se tem mais que o original, cobra só a diferença
      if (qty > originalQty) {
        return total + (getIngredientPrice(ingredient) * (qty - originalQty));
      }
      
      return total;
    }, 0);

    return {
      extraIngredients: extraIngredientsTotal,
      total: extraIngredientsTotal
    };
  };

  const priceBreakdown = getPriceBreakdown();

  const generateObservations = () => {
    const productRecipe = PRODUCT_RECIPES[productId] || {};
    const observations: string[] = [];
    
    // Separar ingredientes por categoria
    const additions: string[] = [];
    const removals: string[] = [];
    const exchanges: string[] = [];
    const saladRemovals: string[] = [];
    
    // Coletar todas as remoções e adições
    const allRemovals: {ingredient: string, originalQty: number, currentQty: number, price: number}[] = [];
    const allAdditions: {ingredient: string, originalQty: number, currentQty: number, price: number}[] = [];
    
    // Verificar ingredientes que estavam na receita original
    Object.entries(productRecipe).forEach(([ingredient, originalQty]) => {
      const currentQty = ingredientQuantities[ingredient] || 0;
      const difference = currentQty - originalQty;
      const price = getIngredientPrice(ingredient);
      
      if (difference < 0) {
        allRemovals.push({ingredient, originalQty, currentQty, price});
      } else if (difference > 0) {
        allAdditions.push({ingredient, originalQty, currentQty, price});
      }
    });
    
    // Verificar ingredientes adicionados que não estavam na receita
    Object.entries(ingredientQuantities).forEach(([ingredient, currentQty]) => {
      const originalQty = productRecipe[ingredient] || 0;
      const difference = currentQty - originalQty;
      const price = getIngredientPrice(ingredient);
      
      if (originalQty === 0 && currentQty > 0) {
        allAdditions.push({ingredient, originalQty, currentQty, price});
      }
    });
    
    // Processar trocas (remoções + adições)
    const processedRemovals = new Set<string>();
    const processedAdditions = new Set<string>();
    
    allRemovals.forEach(removal => {
      if (processedRemovals.has(removal.ingredient)) return;
      
      // Procurar adição correspondente para troca
      const correspondingAddition = allAdditions.find(addition => 
        !processedAdditions.has(addition.ingredient) &&
        addition.ingredient !== removal.ingredient
      );
      
      if (correspondingAddition) {
        // É uma troca
        const removalName = removal.ingredient.charAt(0).toUpperCase() + removal.ingredient.slice(1);
        const additionName = correspondingAddition.ingredient.charAt(0).toUpperCase() + correspondingAddition.ingredient.slice(1);
        
        // Verificar se é permuta (mesmo preço) ou troca com diferença
        if (removal.price === correspondingAddition.price) {
          // Permuta - mesmo preço
          exchanges.push(`${removalName} → ${additionName}`);
        } else {
          // Troca com diferença de preço
          const priceDiff = correspondingAddition.price - removal.price;
          if (priceDiff > 0) {
            exchanges.push(`${removalName} → ${additionName} (+R$ ${priceDiff.toFixed(2)})`);
          } else {
            exchanges.push(`${removalName} → ${additionName} (R$ ${priceDiff.toFixed(2)})`);
          }
        }
        
        processedRemovals.add(removal.ingredient);
        processedAdditions.add(correspondingAddition.ingredient);
      } else {
        // Não é troca, é remoção simples
        const ingredientName = removal.ingredient.charAt(0).toUpperCase() + removal.ingredient.slice(1);
        
        if (['alface', 'tomate', 'milho', 'batata', 'maionese'].includes(removal.ingredient)) {
          saladRemovals.push(`--${ingredientName}`);
        } else {
          removals.push(`--${ingredientName}`);
        }
        
        processedRemovals.add(removal.ingredient);
      }
    });
    
    // Processar adições restantes (que não foram usadas em trocas)
    allAdditions.forEach(addition => {
      if (!processedAdditions.has(addition.ingredient)) {
        const ingredientName = addition.ingredient.charAt(0).toUpperCase() + addition.ingredient.slice(1);
        const quantity = addition.currentQty - addition.originalQty;
        additions.push(`+${ingredientName}${quantity > 1 ? ` (${quantity}x)` : ''}`);
      }
    });
    
    // Adicionar observações na ordem correta
    observations.push(...exchanges); // Trocas primeiro
    observations.push(...removals);
    observations.push(...additions);
    
    // Se tem remoções de salada, agrupar como "Salada"
    if (saladRemovals.length > 0) {
      observations.push('--Salada');
    }
    
    return observations;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Editar Pedido - {productName}
          </DialogTitle>
          <DialogDescription>
            Ajuste a quantidade e adicione ingredientes extras ao pedido
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Coluna Esquerda - Quantidade e Ingredientes */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Quantidade */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Quantidade</h3>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold text-gray-800 w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Ingredientes em Tabela */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Ingredientes Disponíveis</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Ingrediente</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-700">Valor</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-700">Estoque</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-700">Quantidade</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(INGREDIENTS).map(([groupKey, group]) => {
                      // Mostrar menos: esconder ingredientes de R$ 2,00 e R$ 0,00 inicialmente
                      // NÃO mostrar ingredientes básicos/gratuitos por padrão, mesmo se estiverem na receita
                      const itemsToShow = showAllIngredients ? group.items : 
                        group.items.filter(ingredient => 
                          groupKey === 'basic' || groupKey === 'free' ? 
                          false : // Nunca mostrar ingredientes básicos/gratuitos por padrão
                          true // Se for premium/standard, sempre mostra
                        );
                      
                      const hasMoreItems = (groupKey === 'basic' || groupKey === 'free') && 
                        group.items.length > 0;
                      
                      return (
                        <React.Fragment key={`group-${groupKey}`}>
                          {itemsToShow.map((ingredient) => {
                          const currentQty = getIngredientQuantity(ingredient);
                          const getRowColor = () => {
                            if (groupKey === 'premium') {
                              return 'bg-red-50 border-l-4 border-red-400';
                            } else if (groupKey === 'standard') {
                              return 'bg-blue-50 border-l-4 border-blue-400';
                            } else if (groupKey === 'basic') {
                              return 'bg-yellow-50 border-l-4 border-yellow-400';
                            } else {
                              return 'bg-gray-50 border-l-4 border-gray-400';
                            }
                          };
                          return (
                            <tr key={ingredient} className={getRowColor()}>
                              <td className="p-3 text-sm text-gray-800">
                                {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
                              </td>
                              <td className="p-3 text-center text-sm font-medium text-gray-600">
                                {editingIngredientPrice === ingredient ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      defaultValue={getIngredientPrice(ingredient)}
                                      className="w-16 px-1 py-1 text-xs border rounded"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          const target = e.target as HTMLInputElement;
                                          handleSaveIngredientPrice(ingredient, parseFloat(target.value) || 0);
                                        }
                                      }}
                                      onBlur={(e) => {
                                        handleSaveIngredientPrice(ingredient, parseFloat(e.target.value) || 0);
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => {
                                        const input = document.querySelector(`input[type="number"]`) as HTMLInputElement;
                                        if (input) {
                                          handleSaveIngredientPrice(ingredient, parseFloat(input.value) || 0);
                                        }
                                      }}
                                    >
                                      ✓
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={handleCancelEditPrice}
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span>R$ {getIngredientPrice(ingredient).toFixed(2)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                                      onClick={() => handleEditIngredientPrice(ingredient)}
                                    >
                                      ✏️
                                    </Button>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center text-sm text-gray-500">
                                {getIngredientStock(ingredient)}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleIngredientQuantity(ingredient, -1)}
                                    className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                                    disabled={currentQty === 0}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="text-sm font-medium text-gray-800 w-8 text-center">
                                    {currentQty}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleIngredientQuantity(ingredient, 1)}
                                    className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        
                        {/* Botão "Mostrar mais" para grupos com mais de 2 itens */}
                        {hasMoreItems && !showAllIngredients && (
                          <tr className="bg-gray-100 hover:bg-gray-200">
                            <td colSpan={4} className="p-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAllIngredients(true)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                Mostrar mais ingredientes de R$ {group.price.toFixed(2)} ({group.items.length} restantes)
                              </Button>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                      );
                    })}
                    
                    {/* Botão "Mostrar menos" quando todos estão visíveis */}
                    {showAllIngredients && (
                      <tr className="bg-gray-100 hover:bg-gray-200">
                        <td colSpan={4} className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllIngredients(false)}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          >
                            Mostrar menos ingredientes
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Resumo e Ingredientes Selecionados */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Resumo */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Resumo do Pedido</h3>
              {quantity > 1 && (
                <div className="mb-3 p-2 bg-blue-100 border border-blue-200 rounded text-sm text-blue-800">
                  <strong>ℹ️ Importante:</strong> As alterações de ingredientes se aplicam a todos os {quantity} produtos desta quantidade.
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Produto (já inclui receita):</span>
                  <span>R$ {basePrice.toFixed(2)}</span>
                </div>
                {priceBreakdown.extraIngredients > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Acréscimos:</span>
                    <span>+R$ {priceBreakdown.extraIngredients.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Preço unitário:</span>
                  <span>R$ {(basePrice + priceBreakdown.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span>{quantity}x</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Ingredientes selecionados */}
            {Object.keys(ingredientQuantities).length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Observações</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {generateObservations().map((observation, index) => (
                    <div key={index} className="text-sm text-gray-700 font-mono bg-white rounded p-2">
                      {observation}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>

      {/* Popup de Confirmação */}
      {showConfirmation && pendingChanges && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-800">
                Confirmar Alterações
              </DialogTitle>
              <DialogDescription>
                Você está prestes a fazer as seguintes alterações no pedido:
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Resumo das mudanças */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Quantidade:</span>
                  <span>{currentQuantity} → {pendingChanges.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Preço unitário:</span>
                  <span>R$ {(currentPrice / currentQuantity).toFixed(2)} → R$ {pendingChanges.newPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {currentPrice.toFixed(2)} → R$ {(pendingChanges.newPrice * pendingChanges.quantity).toFixed(2)}</span>
                </div>
              </div>

              {/* Ingredientes modificados */}
              {Object.keys(pendingChanges.ingredients).length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Ingredientes:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(pendingChanges.ingredients).map(([ingredient, qty]) => (
                      <div key={ingredient} className="flex justify-between text-sm">
                        <span>{ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}:</span>
                        <span className="font-medium">{qty}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={cancelChanges}>
                Cancelar
              </Button>
              <Button onClick={confirmChanges} className="bg-green-600 hover:bg-green-700">
                Confirmar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default EditOrderDialog;
