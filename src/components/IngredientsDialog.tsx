import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTableOperations } from '../hooks/useTableOperations';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'sonner';

interface IngredientsDialogProps {
  isOpen: boolean;
  product: any;
  tableNumber: number;
  onClose: () => void;
  onConfirm: (product: any, quantity: number, modifications: string, finalPrice: number) => void;
}

const IngredientsDialog: React.FC<IngredientsDialogProps> = ({
  isOpen,
  product,
  tableNumber,
  onClose,
  onConfirm
}) => {
  const { addProductToTable } = useTableOperations();
  
  // Estados
  const [quantity, setQuantity] = useState(1);
  const [addedIngredients, setAddedIngredients] = useState<Record<string, number>>({});
  const [observations, setObservations] = useState('');

  // Ingredientes disponíveis (conforme sistema legado)
  const ingredients = [
    { id: 'carne', name: 'CARNE', price: 5.00, max: 3 },
    { id: 'frango', name: 'FRANGO', price: 5.00, max: 3 },
    { id: 'bacon', name: 'BACON', price: 5.00, max: 3 },
    { id: 'ovo', name: 'OVO', price: 4.00, max: 3 },
    { id: 'queijo', name: 'QUEIJO', price: 4.00, max: 3 },
    { id: 'presunto', name: 'PRESUNTO', price: 4.00, max: 3 },
    { id: 'calabresa', name: 'CALABRESA', price: 4.00, max: 3 },
    { id: 'salsicha', name: 'SALSICHA', price: 4.00, max: 3 },
    { id: 'catupiry', name: 'CATUPIRY', price: 5.00, max: 2 },
    { id: 'picanha', name: 'PICANHA', price: 8.00, max: 2 },
  ];

  // Ref para auto-focus
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no input de quantidade
  useEffect(() => {
    if (isOpen && quantityInputRef.current) {
      setTimeout(() => {
        quantityInputRef.current?.focus();
        quantityInputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  // Calcular total de acréscimos
  const calculateAdditionsTotal = () => {
    return Object.entries(addedIngredients).reduce((total, [ingredientId, qty]) => {
      const ingredient = ingredients.find(ing => ing.id === ingredientId);
      return total + (ingredient ? ingredient.price * qty : 0);
    }, 0);
  };

  // Calcular preço final
  const calculateFinalPrice = () => {
    const basePrice = product.price;
    const additionsTotal = calculateAdditionsTotal();
    return basePrice + additionsTotal;
  };

  // Função para atualizar quantidade de ingrediente
  const updateIngredientQuantity = (ingredientId: string, newQuantity: number) => {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (!ingredient) return;

    const clampedQuantity = Math.max(0, Math.min(newQuantity, ingredient.max));
    
    setAddedIngredients(prev => ({
      ...prev,
      [ingredientId]: clampedQuantity
    }));
  };

  // Função para confirmar produto
  const handleConfirm = () => {
    if (quantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    // Montar string de modificações
    const modifications: string[] = [];
    
    // Adicionar ingredientes
    Object.entries(addedIngredients).forEach(([ingredientId, qty]) => {
      const ingredient = ingredients.find(ing => ing.id === ingredientId);
      if (ingredient && qty > 0) {
        modifications.push(`+${qty} ${ingredient.name}`);
      }
    });
    
    // Adicionar observações
    if (observations.trim()) {
      modifications.push(observations.trim().toUpperCase());
    }
    
    const finalMods = modifications.join(', ');
    const finalPrice = calculateFinalPrice();
    
    console.log('Confirmando produto:', {
      product: product.name,
      quantity,
      modifications: finalMods,
      finalPrice
    });

    // Adicionar à mesa
    const success = addProductToTable(tableNumber, product, quantity, finalMods, finalPrice);
    
    if (success) {
      onConfirm(product, quantity, finalMods, finalPrice);
      onClose();
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // F2 - Adicionar produto
      if (e.key === 'F2') {
        e.preventDefault();
        handleConfirm();
      }

      // F3 - Composição
      if (e.key === 'F3') {
        e.preventDefault();
        console.log('F3 - Composição do produto');
      }

      // F4 - Cancelar
      if (e.key === 'F4') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, quantity, addedIngredients, observations]);

  const additionsTotal = calculateAdditionsTotal();
  const finalPrice = calculateFinalPrice();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="legacy-dialog-header">
            Informações produto
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configurar ingredientes e acréscimos para {product?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Informações do produto */}
          <div className="bg-white p-4 rounded border-2 border-gray-400">
            <div className="font-bold text-lg mb-2">
              Mesa/Comanda: {tableNumber === 0 ? 'BALCÃO' : tableNumber}
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="font-bold block mb-1">Produto</label>
                <div className="p-2 bg-gray-100 rounded">
                  {product?.code} - {product?.name}
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Qtde.</label>
                <input 
                  ref={quantityInputRef}
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full p-2 border-2 border-blue-400 rounded bg-yellow-200 text-xl font-bold text-center"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Preço</label>
                <div className="p-2 bg-gray-100 rounded">
                  {formatCurrency(product?.price || 0)}
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Adicionais</label>
                <div className="p-2 bg-gray-100 rounded">
                  {Object.values(addedIngredients).reduce((sum, qty) => sum + qty, 0)}
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Valor Final</label>
                <div className="p-2 bg-gray-100 rounded text-xl font-bold">
                  {formatCurrency(finalPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de acréscimos */}
          <div className="legacy-acrescimos-header">
            ▶ ACRÉSCIMOS ( No mínimo 1 e no máximo 5 )
          </div>

          <div className="border-2 border-gray-400 rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#7FBACC]">
                <tr>
                  <th className="p-2 border border-gray-400">Ingrediente</th>
                  <th className="p-2 border border-gray-400">Máx</th>
                  <th className="p-2 border border-gray-400">Qtde</th>
                  <th className="p-2 border border-gray-400">Preço</th>
                  <th className="p-2 border border-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, index) => {
                  const qty = addedIngredients[ing.id] || 0;
                  const total = ing.price * qty;
                  
                  return (
                    <tr key={ing.id} className={index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                      <td className="p-2 border border-gray-400 font-bold">
                        {ing.name}
                      </td>
                      <td className="p-2 border border-gray-400 text-center">
                        {ing.max}
                      </td>
                      <td className="p-2 border border-gray-400">
                        <input 
                          type="number" 
                          min="0"
                          max={ing.max}
                          value={qty}
                          onChange={(e) => updateIngredientQuantity(ing.id, parseInt(e.target.value) || 0)}
                          className="w-20 p-1 border-2 border-gray-400 rounded text-center"
                        />
                      </td>
                      <td className="p-2 border border-gray-400 text-right">
                        {formatCurrency(ing.price)}
                      </td>
                      <td className="p-2 border border-gray-400 text-right font-bold text-red-600">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resumo de acréscimos */}
          {additionsTotal > 0 && (
            <div className="bg-yellow-100 p-3 rounded border-2 border-yellow-400">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total de Acréscimos:</span>
                <span className="font-bold text-red-600 text-lg">
                  {formatCurrency(additionsTotal)}
                </span>
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="font-bold block mb-1">Observações</label>
            <textarea 
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full p-2 border-2 border-gray-400 rounded h-24"
              placeholder="Observações especiais para o produto..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end">
            <button 
              onClick={handleConfirm}
              className="legacy-button legacy-button-green"
            >
              ✓ Adicionar Produto(F2)
            </button>
            <button 
              className="legacy-button legacy-button-gray"
            >
              ⚙ Composição(F3)
            </button>
            <button 
              onClick={onClose}
              className="legacy-button legacy-button-red"
            >
              ⊗ Cancelar(F4)
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientsDialog;
