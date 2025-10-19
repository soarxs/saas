import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '../store/useStore';
import { useSalesStore } from '../store/salesStore';
import { Clock, DollarSign, ShoppingBag, LogOut, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const ShiftManager = () => {
  const { 
    currentUser, 
    currentShift, 
    shifts,
    openShift, 
    closeShift, 
    setCurrentUser 
  } = useStore();
  
  const { sales } = useSalesStore();

  const handleOpenShift = () => {
    if (!currentUser) return;
    openShift(currentUser);
    toast.success('Turno aberto com sucesso!');
  };

  const handleCloseShift = () => {
    if (confirm('Tem certeza que deseja fechar o turno atual?')) {
      closeShift();
      toast.success('Turno fechado com sucesso!');
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja fazer logout?')) {
      setCurrentUser(null);
      toast.success('Logout realizado com sucesso!');
    }
  };

  const getCurrentShiftSales = () => {
    if (!currentShift?.isActive) return [];
    return sales.filter(sale => sale.shiftId === currentShift.id);
  };

  const currentShiftSales = getCurrentShiftSales();
  const currentShiftTotal = currentShiftSales.reduce((sum, sale) => sum + sale.total, 0);
  const currentShiftItems = currentShiftSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

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
        <h2 className="text-2xl font-bold">Gerenciamento de Turnos</h2>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Status do Turno Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Turno Atual
          </CardTitle>
          <CardDescription>
            {currentShift?.isActive 
              ? `Turno ativo desde ${formatDate(currentShift.startTime)}`
              : 'Nenhum turno ativo'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentShift?.isActive ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentShiftTotal)}
                  </div>
                  <div className="text-sm text-green-700">Total de Vendas</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentShiftSales.length}
                  </div>
                  <div className="text-sm text-blue-700">Vendas Realizadas</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentShiftItems}
                  </div>
                  <div className="text-sm text-purple-700">Itens Vendidos</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCloseShift} variant="destructive">
                  Fechar Turno
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold mb-2">Nenhum turno ativo</h3>
              <p className="text-gray-600 mb-4">
                Abra um turno para começar a registrar vendas
              </p>
              <Button onClick={handleOpenShift}>
                <Clock className="w-4 h-4 mr-2" />
                Abrir Turno
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Turnos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Turnos</CardTitle>
          <CardDescription>
            Últimos turnos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum turno registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.slice(0, 5).map((shift) => {
                const shiftSales = sales.filter(sale => sale.shiftId === shift.id);
                const shiftTotal = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
                
                return (
                  <div key={shift.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold">
                        {shift.user.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(shift.startTime)} - {shift.endTime ? formatDate(shift.endTime) : 'Em andamento'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(shiftTotal)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {shiftSales.length} vendas
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftManager;