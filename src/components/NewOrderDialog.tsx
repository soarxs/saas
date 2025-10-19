import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { OrderSource, PaymentMethod, OrderItem } from '../types';
import { useStore } from '../store/useStore';
import { useOrderStore } from '../store/orderStore';
import { toast } from 'sonner';
import { 
  Store, 
  Phone, 
  MessageSquare, 
  Users,
  Trash2,
  Plus,
  Minus,
  Printer,
  Save
} from 'lucide-react';

interface NewOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewOrderDialog: React.FC<NewOrderDialogProps> = ({ isOpen, onClose }) => {
  const { products, currentShift, currentUser } = useStore();
  const { addOrder } = useOrderStore();
  
  const [source, setSource] = useState<OrderSource>('balcao');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');

  const isDelivery = source === 'whatsapp' || source === 'telefone';

  const addItem = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
      subtotal: product.price * quantity,
      observations: observations || undefined,
    };

    setItems(prev => [...prev, newItem]);
    
    // Limpar campos
    setSelectedProduct('');
    setQuantity(1);
    setObservations('');
    
    toast.success(`${product.name} adicionado`);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }
    
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.price * newQuantity
        };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    return subtotal + (isDelivery ? deliveryFee : 0);
  };

  const handleSave = async (printKitchen: boolean) => {
    if (!currentShift?.isActive) {
      toast.error('Abra um turno antes de registrar pedidos');
      return;
    }

    if (items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    if (isDelivery && (!customerName || !customerPhone)) {
      toast.error('Preencha nome e telefone do cliente');
      return;
    }

    try {
      const order = addOrder({
        source,
        customerName: isDelivery ? customerName : undefined,
        customerPhone: isDelivery ? customerPhone : undefined,
        address: isDelivery ? address : undefined,
        tableNumber: source === 'mesa' ? tableNumber : undefined,
        items,
        subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
        deliveryFee: isDelivery ? deliveryFee : 0,
        total: calculateTotal(),
        paymentMethod,
        paid: false,
        shiftId: currentShift.id,
        userId: currentUser!.id,
        userName: currentUser!.name,
        notes: notes || undefined,
      });

      if (printKitchen) {
        await printKitchenOrder(order);
      }

      toast.success(`Pedido #${order.number} registrado!`);
      
      // Limpar formulário
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      toast.error('Erro ao salvar pedido');
    }
  };

  const printKitchenOrder = async (order: any) => {
    try {
      const kitchenTicket = formatKitchenTicket(order);
      // Simular impressão - você pode integrar com serviço de impressão real
      console.log('IMPRIMINDO COMANDA:', kitchenTicket);
      toast.success('Comanda impressa!');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast.error('Erro ao imprimir comanda');
    }
  };

  const formatKitchenTicket = (order: any) => {
    const sourceLabels = {
      balcao: '🏪 BALCÃO',
      mesa: `🪑 MESA ${order.tableNumber}`,
      whatsapp: `📱 DELIVERY - ${order.customerName}`,
      telefone: `☎️ DELIVERY - ${order.customerName}`
    };

    let ticket = `
PEDIDO #${order.number}
${sourceLabels[order.source]}
${new Date(order.createdAt).toLocaleTimeString('pt-BR')}
${'='.repeat(40)}

`;

    order.items.forEach((item: OrderItem) => {
      ticket += `${item.quantity}x ${item.productName.toUpperCase()}\n`;
      if (item.observations) {
        ticket += `   >>> ${item.observations.toUpperCase()} <<<\n`;
      }
      ticket += '\n';
    });

    ticket += `${'='.repeat(40)}
TOTAL: R$ ${order.total.toFixed(2)}
Pagamento: ${order.paymentMethod.toUpperCase()}
`;

    if (order.notes) {
      ticket += `\nOBS: ${order.notes}\n`;
    }

    return ticket;
  };

  const resetForm = () => {
    setSource('balcao');
    setTableNumber(1);
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
    setDeliveryFee(0);
    setPaymentMethod('dinheiro');
    setItems([]);
    setNotes('');
    setSelectedProduct('');
    setQuantity(1);
    setObservations('');
  };

  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Novo Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA 1: Dados do Pedido */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Tipo de Pedido
                  </Label>
                  <RadioGroup value={source} onValueChange={(v) => setSource(v as OrderSource)}>
                    <div className="grid grid-cols-2 gap-3">
                      <Label 
                        htmlFor="balcao"
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          source === 'balcao' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value="balcao" id="balcao" />
                        <Store className="w-5 h-5" />
                        <span className="font-medium">Balcão</span>
                      </Label>
                      
                      <Label 
                        htmlFor="mesa"
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          source === 'mesa' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value="mesa" id="mesa" />
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Mesa</span>
                      </Label>
                      
                      <Label 
                        htmlFor="whatsapp"
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          source === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value="whatsapp" id="whatsapp" />
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">WhatsApp</span>
                      </Label>
                      
                      <Label 
                        htmlFor="telefone"
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          source === 'telefone' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value="telefone" id="telefone" />
                        <Phone className="w-5 h-5" />
                        <span className="font-medium">Telefone</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {source === 'mesa' && (
                  <div>
                    <Label htmlFor="table">Número da Mesa</Label>
                    <Input
                      id="table"
                      type="number"
                      min="1"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(parseInt(e.target.value))}
                      className="text-lg h-12"
                    />
                  </div>
                )}

                {isDelivery && (
                  <>
                    <div>
                      <Label htmlFor="customerName">Nome do Cliente *</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="João Silva"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customerPhone">Telefone *</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(38) 99999-9999"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rua, número, bairro"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        step="0.01"
                        min="0"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                        className="text-lg h-12"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="payment">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                      <SelectItem value="credito">💳 Crédito</SelectItem>
                      <SelectItem value="debito">💳 Débito</SelectItem>
                      <SelectItem value="pix">📲 PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Observações Gerais</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Cliente vai retirar às 19h"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUNA 2: Produtos */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Label className="text-base font-semibold">Adicionar Produtos</Label>
                
                <div className="grid gap-3">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione um produto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - R$ {product.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Quantidade</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-12 w-12"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="text-center text-lg h-12"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                          className="h-12 w-12"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Observações do Item</Label>
                    <Input
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Ex: SEM CEBOLA, BACON EXTRA"
                      className="h-12 uppercase"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={addItem}
                    className="w-full h-12"
                    disabled={!selectedProduct}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar ao Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Itens */}
            <Card>
              <CardContent className="pt-6">
                <Label className="text-base font-semibold mb-3 block">
                  Itens do Pedido ({items.length})
                </Label>
                
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum item adicionado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map(item => (
                      <Card key={item.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-green-600 text-white">
                                  {item.quantity}x
                                </Badge>
                                <span className="font-bold text-sm">
                                  {item.productName}
                                </span>
                              </div>
                              
                              {item.observations && (
                                <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded mt-2">
                                  ⚠️ {item.observations}
                                </p>
                              )}
                              
                              <div className="mt-2 flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                R$ {item.subtotal.toFixed(2)}
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="mt-1 h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span>Subtotal:</span>
                    <span className="font-bold">
                      R$ {items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {isDelivery && deliveryFee > 0 && (
                    <div className="flex justify-between text-base">
                      <span>Taxa de Entrega:</span>
                      <span className="font-bold">R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t-2 border-green-300">
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-green-800">TOTAL:</span>
                      <span className="text-green-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleSave(true)}
                className="h-14 text-base"
                disabled={items.length === 0}
              >
                <Printer className="w-5 h-5 mr-2" />
                Salvar e Imprimir
              </Button>
              
              <Button
                onClick={() => handleSave(false)}
                variant="outline"
                className="h-14 text-base"
                disabled={items.length === 0}
              >
                <Save className="w-5 h-5 mr-2" />
                Salvar Apenas
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
