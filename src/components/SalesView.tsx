import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSalesStore } from '../store/salesStore';
import { useStore } from '../store/useStore';
import { PaymentMethod } from '../types';
import { Trash, Edit, Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';

const SalesView = () => {
  const salesStore = useSalesStore();
  const { currentShift } = useStore();
  const [editingSale, setEditingSale] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('dinheiro');

  const allSales = salesStore.sales;
  const sales = currentShift?.isActive 
    ? allSales.filter(sale => sale.shiftId === currentShift.id)
    : allSales;

  const handleDeleteSale = (saleId: string) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      salesStore.deleteSale(saleId);
      toast.success('Venda excluída com sucesso!');
    }
  };

  const handleUpdatePaymentMethod = (saleId: string) => {
    salesStore.updateSalePaymentMethod(saleId, newPaymentMethod);
    setEditingSale(null);
    toast.success('Forma de pagamento atualizada!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Histórico de Vendas</h2>
        <div className="text-sm text-gray-600">
          {currentShift?.isActive ? 'Turno Atual' : 'Todas as Vendas'}
        </div>
      </div>

      {sales.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma venda encontrada</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Card key={sale.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Venda #{sale.id.slice(-6)}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.paymentMethod === 'dinheiro' ? 'bg-green-100 text-green-800' :
                        sale.paymentMethod === 'debito' ? 'bg-blue-100 text-blue-800' :
                        sale.paymentMethod === 'credito' ? 'bg-purple-100 text-purple-800' :
                        sale.paymentMethod === 'pix' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {formatDate(sale.createdAt)}
                    </div>
                    
                    <div className="space-y-1">
                      {sale.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.productName} x{item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">{formatCurrency(sale.total)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {editingSale === sale.id ? (
                      <div className="flex gap-2">
                        <select
                          value={newPaymentMethod}
                          onChange={(e) => setNewPaymentMethod(e.target.value as PaymentMethod)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="dinheiro">Dinheiro</option>
                          <option value="debito">Débito</option>
                          <option value="credito">Crédito</option>
                          <option value="pix">PIX</option>
                          <option value="cortesia">Cortesia</option>
                        </select>
                        <Button size="sm" onClick={() => handleUpdatePaymentMethod(sale.id)}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingSale(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setEditingSale(sale.id)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                          <Printer className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSale(sale.id)}>
                          <Trash className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesView;