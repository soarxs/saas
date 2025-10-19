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

const INGREDIENTS = {
  premium: { items: ['carne', 'frango', 'bacon', 'frutas'], price: 5.00 },
  standard: { items: ['ovo', 'presunto', 'queijo', 'calabresa', 'salsicha'], price: 3.00 },
  basic: { items: ['abacaxi', 'banana', 'catupiry', 'cebola'], price: 2.00 },
  free: { items: ['alface', 'tomate', 'milho', 'batata', 'maionese'], price: 0.00 }
};

const EXCHANGE_GROUPS = {
  premium: ['carne', 'frango', 'bacon', 'frutas'],
  standard: ['ovo', 'presunto', 'queijo', 'calabresa', 'salsicha'],
  basic: ['abacaxi', 'banana', 'catupiry', 'cebola'],
  free: ['alface', 'tomate', 'milho', 'batata', 'maionese']
};

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  isOpen, onClose, tableNumber, productId, uniqueId, productName, currentQuantity, currentPrice
}) => {
  const { updateIndividualProduct } = useStore();
  const [quantity, setQuantity] = useState(currentQuantity);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [modifications, setModifications] = useState('');
  const [customPrice, setCustomPrice] = useState(currentPrice);

  useEffect(() => {
    if (isOpen) {
      setQuantity(currentQuantity);
      setCustomPrice(currentPrice);
      setSelectedIngredients([]);
      setModifications('');
    }
  }, [isOpen, currentQuantity, currentPrice]);

  const getIngredientPrice = (ingredient: string) => {
    for (const [group, data] of Object.entries(INGREDIENTS)) {
      if (data.items.includes(ingredient)) {
        return data.price;
      }
    }
    return 0;
  };

  const getIngredientGroup = (ingredient: string) => {
    for (const [group, data] of Object.entries(INGREDIENTS)) {
      if (data.items.includes(ingredient)) {
        return group;
      }
    }
    return 'free';
  };

  const calculateTotalPrice = () => {
    const basePrice = customPrice;
    const ingredientsPrice = selectedIngredients.reduce((total, ingredient) => {
      return total + getIngredientPrice(ingredient);
    }, 0);
    return (basePrice + ingredientsPrice) * quantity;
  };

  const handleIngredientToggle = (ingredient: string) => {
    const currentGroup = getIngredientGroup(ingredient);
    const groupIngredients = EXCHANGE_GROUPS[currentGroup as keyof typeof EXCHANGE_GROUPS];
    
    setSelectedIngredients(prev => {
      const otherGroupIngredients = prev.filter(ing => 
        groupIngredients.includes(ing) && ing !== ingredient
      );
      const otherIngredients = prev.filter(ing => 
        !groupIngredients.includes(ing)
      );
      
      if (prev.includes(ingredient)) {
        return [...otherGroupIngredients, ...otherIngredients];
      } else {
        return [...otherGroupIngredients, ...otherIngredients, ingredient];
      }
    });
  };

  const handleSave = () => {
    const finalModifications = selectedIngredients.length > 0 
      ? `Ingredientes: ${selectedIngredients.join(', ')}${modifications ? ` | ${modifications}` : ''}`
      : modifications;

    updateIndividualProduct(tableNumber, uniqueId, calculateTotalPrice() / quantity, finalModifications);
    toast.success('Pedido atualizado com sucesso!');
    onClose();
  };

  const renderIngredientGroup = (groupName: string, groupData: { items: string[]; price: number }) => (
    <div key={groupName} className="space-y-2">
      <h4 className="font-semibold text-sm">
        {groupName.charAt(0).toUpperCase() + groupName.slice(1)} 
        {groupData.price > 0 && ` (R$ ${groupData.price.toFixed(2)})`}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {groupData.items.map(ingredient => (
          <Button
            key={ingredient}
            variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
            size="sm"
            onClick={() => handleIngredientToggle(ingredient)}
            className="text-xs"
          >
            {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Pedido - {productName}
          </DialogTitle>
          <DialogDescription>
            Mesa {tableNumber} • ID: {uniqueId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quantidade */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preço personalizado */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Unitário:</label>
                <input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-md"
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ingredientes */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-4">Adicionar Ingredientes</h3>
              <div className="space-y-4">
                {Object.entries(INGREDIENTS).map(([groupName, groupData]) => 
                  renderIngredientGroup(groupName, groupData)
                )}
              </div>
              
              {selectedIngredients.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Ingredientes Selecionados:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedIngredients.map(ingredient => (
                      <Badge key={ingredient} variant="secondary" className="text-xs">
                        {ingredient}
                        <button
                          onClick={() => handleIngredientToggle(ingredient)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modificações adicionais */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Modificações Adicionais:</label>
                <textarea
                  value={modifications}
                  onChange={(e) => setModifications(e.target.value)}
                  className="w-full p-2 border rounded-md h-20 resize-none"
                  placeholder="Ex: Sem cebola, bem passado, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumo do pedido */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Preço base:</span>
                  <span>R$ {customPrice.toFixed(2)}</span>
                </div>
                {selectedIngredients.length > 0 && (
                  <div className="flex justify-between">
                    <span>Ingredientes:</span>
                    <span>R$ {selectedIngredients.reduce((total, ing) => total + getIngredientPrice(ing), 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span>{quantity}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>R$ {calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Salvar Alterações
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;