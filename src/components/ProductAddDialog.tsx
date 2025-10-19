import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '../types';
import { Plus, Minus, Check, X, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ProductAddDialogProps {
  isOpen: boolean;
  product: Product;
  tableNumber: number;
  onClose: () => void;
  onAdd: (
    product: Product,
    quantity: number,
    modifications: string,
    customPrice: number
  ) => void;
}

// Ingredientes disponíveis para acréscimos (apenas os controlados)
const INGREDIENTS = {
  premium: [
    { id: 'carne', name: 'CARNE', price: 5.00, max: 3 },
    { id: 'frango', name: 'FRANGO', price: 5.00, max: 3 },
    { id: 'bacon', name: 'BACON', price: 5.00, max: 3 },
    { id: 'picanha', name: 'PICANHA', price: 8.00, max: 2 },
  ],
  standard: [
    { id: 'ovo', name: 'OVO', price: 4.00, max: 3 },
    { id: 'presunto', name: 'PRESUNTO', price: 4.00, max: 3 },
    { id: 'queijo', name: 'QUEIJO', price: 4.00, max: 3 },
    { id: 'calabresa', name: 'CALABRESA', price: 4.00, max: 3 },
    { id: 'salsicha', name: 'SALSICHA', price: 4.00, max: 3 },
  ],
  special: [
    { id: 'catupiry', name: 'CATUPIRY', price: 5.00, max: 2 },
  ],
};

const ProductAddDialog: React.FC<ProductAddDialogProps> = ({
  isOpen,
  product,
  tableNumber,
  onClose,
  onAdd
}) => {
  // Estados
  const [quantity, setQuantity] = useState(1);
  const [addedIngredients, setAddedIngredients] = useState<Record<string, number>>({});
  const [observations, setObservations] = useState('');

  // Encontrar ingrediente por ID
  const findIngredient = (id: string) => {
    return [...INGREDIENTS.premium, ...INGREDIENTS.standard, ...INGREDIENTS.special]
      .find(ing => ing.id === id);
  };

  // Adicionar ingrediente
  const handleAddIngredient = (ingredientId: string, max: number) => {
    setAddedIngredients(prev => {
      const current = prev[ingredientId] || 0;
      if (current >= max) {
        toast.error(`Máximo de ${max} unidades`);
        return prev;
      }
      return { ...prev, [ingredientId]: current + 1 };
    });
  };

  // Remover ingrediente
  const handleRemoveIngredient = (ingredientId: string) => {
    setAddedIngredients(prev => {
      const current = prev[ingredientId] || 0;
      if (current <= 0) return prev;
      
      const newValue = current - 1;
      if (newValue === 0) {
        const { [ingredientId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ingredientId]: newValue };
    });
  };

  // Calcular total de adicionais
  const calculateAdditionsTotal = () => {
    let total = 0;
    Object.entries(addedIngredients).forEach(([ingredientId, qty]) => {
      const ingredient = findIngredient(ingredientId);
      if (ingredient) {
        total += ingredient.price * qty;
      }
    });
    return total;
  };

  // Calcular total final
  const calculateTotal = () => {
    const basePrice = product.price;
    const additionsTotal = calculateAdditionsTotal();
    return (basePrice + additionsTotal) * quantity;
  };

  // Calcular preço unitário com adicionais
  const calculateUnitPrice = () => {
    const basePrice = product.price;
    const additionsTotal = calculateAdditionsTotal();
    return basePrice + additionsTotal;
  };

  // Contar total de ingredientes adicionados
  const getTotalAdditions = () => {
    return Object.values(addedIngredients).reduce((sum, qty) => sum + qty, 0);
  };

  // Função de confirmação
  const handleConfirm = () => {
    console.log('Confirmando produto:', {
      product: product.name,
      quantity,
      addedIngredients,
      observations,
      basePrice: product.price,
      additionsTotal: calculateAdditionsTotal(),
      unitPrice: calculateUnitPrice()
    });
    
    // Montar string de modificações
    const modifications: string[] = [];
    
    // Adicionar ingredientes
    Object.entries(addedIngredients).forEach(([ingredientId, qty]) => {
      const ingredient = findIngredient(ingredientId);
      if (ingredient && qty > 0) {
        modifications.push(`+${qty} ${ingredient.name}`);
      }
    });
    
    // Adicionar observações
    if (observations.trim()) {
      modifications.push(observations.trim().toUpperCase());
    }
    
    const finalMods = modifications.join(', ');
    const finalPrice = calculateUnitPrice();
    
    console.log('Dados finais:', {
      finalMods,
      finalPrice,
      total: finalPrice * quantity
    });
    
    // Chamar callback
    onAdd(product, quantity, finalMods, finalPrice);
    
    toast.success(`${product.name} adicionado!`);
    onClose();
  };

  // Função para cancelar
  const handleCancel = () => {
    onClose();
  };

  const totalAdditions = getTotalAdditions();
  const additionsTotal = calculateAdditionsTotal();
  const finalTotal = calculateTotal();
  const unitPrice = calculateUnitPrice();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          Interface para adicionar {product.name} com ingredientes e observações
        </DialogDescription>
        {/* Header */}
        <div className="bg-blue-100 -m-6 p-4 mb-4">
          <DialogTitle className="text-lg font-semibold text-blue-800 mb-2">
            Mesa/Comanda: {tableNumber === 0 ? 'BALCÃO' : tableNumber}
          </DialogTitle>
          <div className="text-sm text-blue-700 mb-2">Produto</div>
          <div className="text-xl font-bold text-blue-900">
            {product.code} - {product.name}
          </div>
          
          {/* Grade de informações */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <Label className="text-xs text-blue-600">Qtde:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xl font-bold text-red-600 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-blue-600">Preço Base:</Label>
              <div className="text-lg font-bold text-blue-900 mt-1">
                R$ {product.price.toFixed(2)}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-blue-600">Adicionais:</Label>
              <div className="text-lg font-bold text-blue-900 mt-1">
                {totalAdditions} itens
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-blue-600">Valor Final:</Label>
              <div className="text-2xl font-bold text-green-600 mt-1">
                R$ {finalTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Corpo - Acréscimos */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ACRÉSCIMOS (No mínimo 1 e no máximo 5)
            </h3>
            
            {/* Premium */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">PREMIUM (R$ 5,00 cada)</h4>
              <div className="grid grid-cols-2 gap-2">
                {INGREDIENTS.premium.map(ingredient => {
                  const currentQty = addedIngredients[ingredient.id] || 0;
                  const isSelected = currentQty > 0;
                  
                  return (
                    <Card 
                      key={ingredient.id}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-green-50 border-2 border-green-500' 
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-gray-900">
                            {ingredient.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveIngredient(ingredient.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-bold text-red-600 min-w-[1.5rem] text-center">
                              {currentQty}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddIngredient(ingredient.id, ingredient.max)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          R$ {ingredient.price.toFixed(2)} cada
                        </div>
                        <div className="text-xs text-gray-500">
                          Máx: {ingredient.max} | Disponível: {ingredient.max}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Standard */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">STANDARD (R$ 4,00 cada)</h4>
              <div className="grid grid-cols-2 gap-2">
                {INGREDIENTS.standard.map(ingredient => {
                  const currentQty = addedIngredients[ingredient.id] || 0;
                  const isSelected = currentQty > 0;
                  
                  return (
                    <Card 
                      key={ingredient.id}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-green-50 border-2 border-green-500' 
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-gray-900">
                            {ingredient.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveIngredient(ingredient.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-bold text-red-600 min-w-[1.5rem] text-center">
                              {currentQty}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddIngredient(ingredient.id, ingredient.max)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          R$ {ingredient.price.toFixed(2)} cada
                        </div>
                        <div className="text-xs text-gray-500">
                          Máx: {ingredient.max} | Disponível: {ingredient.max}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Special */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">ESPECIAIS (R$ 5,00 cada)</h4>
              <div className="grid grid-cols-2 gap-2">
                {INGREDIENTS.special.map(ingredient => {
                  const currentQty = addedIngredients[ingredient.id] || 0;
                  const isSelected = currentQty > 0;
                  
                  return (
                    <Card 
                      key={ingredient.id}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-green-50 border-2 border-green-500' 
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-gray-900">
                            {ingredient.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveIngredient(ingredient.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-bold text-red-600 min-w-[1.5rem] text-center">
                              {currentQty}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddIngredient(ingredient.id, ingredient.max)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          R$ {ingredient.price.toFixed(2)} cada
                        </div>
                        <div className="text-xs text-gray-500">
                          Máx: {ingredient.max} | Disponível: {ingredient.max}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observations" className="text-sm font-medium text-gray-700">
              Observações
            </Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value.toUpperCase())}
              placeholder="Ex: SEM CEBOLA, PONTO DA CARNE BEM PASSADO"
              rows={3}
              className="mt-1 uppercase"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4">
          {/* Card de Resumo */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Produto Base:</span>
                  <span className="font-semibold">R$ {product.price.toFixed(2)}</span>
                </div>
                
                {Object.entries(addedIngredients).map(([ingredientId, qty]) => {
                  const ingredient = findIngredient(ingredientId);
                  if (ingredient && qty > 0) {
                    return (
                      <div key={ingredientId} className="flex justify-between text-sm">
                        <span>+{qty} {ingredient.name}:</span>
                        <span className="font-semibold">R$ {(ingredient.price * qty).toFixed(2)}</span>
                      </div>
                    );
                  }
                  return null;
                })}
                
                <div className="pt-2 border-t border-green-300">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-green-800">TOTAL:</span>
                    <span className="text-green-600">R$ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Check className="w-5 h-5 mr-2" />
              Adicionar Produto (F2)
            </Button>
            
            <Button
              variant="outline"
              disabled
              className="h-12"
            >
              <Settings className="w-4 h-4 mr-2" />
              Composição (F3)
            </Button>
            
            <Button
              onClick={handleCancel}
              variant="outline"
              className="h-12 text-red-600 border-red-300 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar (F4)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAddDialog;
