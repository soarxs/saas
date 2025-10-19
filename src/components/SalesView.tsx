import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSalesStore } from '../store/salesStore';
import { useStore } from '../store/useStore';
import { PaymentMethod } from '../types';
import { Trash, Edit, Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import SplitClosedSaleDialog from './SplitClosedSaleDialog';
import QuickPaymentButtons from './QuickPaymentButtons';

const SalesView = () => {
  const salesStore = useSalesStore();
  const { currentShift } = useStore();
  const [editingSale, setEditingSale] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [splitSale, setSplitSale] = useState<any>(null);

  // Usar as vendas diretamente do salesStore
  const allSales = salesStore.sales;
  
  
  // Filtrar vendas do turno atual se houver turno ativo
  const currentShiftSales = currentShift?.isActive ? 
    allSales.filter(sale => sale.shiftId === currentShift.id) : 
    allSales; // Mostrar todas as vendas quando não há turno ativo

  const handleDeleteSale = (saleId: string) => {
    salesStore.deleteSale(saleId);
    toast.success('Venda excluída com sucesso!');
  };

  const handleUpdatePaymentMethod = (saleId: string) => {
    salesStore.updateSalePaymentMethod(saleId, newPaymentMethod);
    setEditingSale(null);
    toast.success('Forma de pagamento atualizada!');
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setNewPaymentMethod(method);
    if (editingSale) {
      handleUpdatePaymentMethod(editingSale);
    }
  };

  const getTableName = (tableNumber?: number) => {
    if (tableNumber === 0) return 'Balcão';
    if (tableNumber) return `Mesa ${tableNumber}`;
    return 'Balcão';
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels = {
      dinheiro: 'Dinheiro',
      debito: 'Cartão Débito',
      credito: 'Cartão Crédito',
      pix: 'PIX',
      cortesia: 'Cortesia'
    };
    return labels[method];
  };

  const totalSales = currentShiftSales.reduce((sum, sale) => sum + sale.total, 0);


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vendas</h1>
          <p className="text-gray-600 font-medium">
            {currentShift?.isActive ? 'Vendas do turno atual' : 'Histórico de vendas'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors duration-200">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
            <div className="text-sm text-green-700 font-medium mb-1">Total</div>
            <div className="text-2xl font-bold text-green-600 flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              R$ {totalSales.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {currentShiftSales.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2 text-gray-600">
              {currentShift?.isActive ? 'Nenhuma venda no turno' : 'Nenhuma venda encontrada'}
            </h3>
            <p className="text-sm text-gray-500">
              {currentShift?.isActive 
                ? 'As vendas aparecerão aqui' 
                : 'Não há vendas para exibir'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentShiftSales.map((sale) => (
              <Card key={sale.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-green-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {getTableName(sale.tableNumber)}
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          sale.paymentMethod === 'dinheiro' ? 'bg-green-100 text-green-800' :
                          sale.paymentMethod === 'pix' ? 'bg-blue-100 text-blue-800' :
                          sale.paymentMethod === 'debito' ? 'bg-purple-100 text-purple-800' :
                          sale.paymentMethod === 'credito' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getPaymentMethodLabel(sale.paymentMethod)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {sale.items.length} item(s) • {sale.userName}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {sale.total.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSplitSale(sale)}
                        className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        title="Editar venda"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                            title="Excluir venda"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir venda?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteSale(sale.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para editar forma de pagamento */}
        <AlertDialog open={editingSale !== null} onOpenChange={() => setEditingSale(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alterar Forma de Pagamento</AlertDialogTitle>
              <AlertDialogDescription>
                Selecione a nova forma de pagamento para esta venda.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <QuickPaymentButtons onPaymentSelect={handlePaymentSelect} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      <SplitClosedSaleDialog
        isOpen={splitSale !== null}
        onClose={() => setSplitSale(null)}
        sale={splitSale}
      />
    </div>
  );
};

export default SalesView;