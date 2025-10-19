
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
    getCurrentShiftSales,
    getPaymentBreakdown,
    setCurrentUser 
  } = useStore();

  // Verificar se há outro turno ativo
  const activeShifts = shifts.filter(shift => shift.isActive && shift.id !== currentShift?.id);
  const hasOtherActiveShift = activeShifts.length > 0;

  const handleOpenShift = () => {
    if (!currentUser) return;
    
    if (hasOtherActiveShift) {
      toast.warning('Existe outro turno ativo. Ele será fechado automaticamente.');
    }
    
    openShift(currentUser);
    toast.success('Turno aberto com sucesso!');
  };

  const handleCloseShift = () => {
    closeShift();
    toast.success('Turno fechado com sucesso!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success('Logout realizado com sucesso');
  };

  const handleForceLogout = () => {
    setCurrentUser(null);
    toast.success('Logout realizado com sucesso');
  };

  if (!currentShift?.isActive) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Turnos</h1>
            <p className="text-muted-foreground">Gerencie turnos e visualize o histórico</p>
          </div>
        </div>

        {/* Abrir Turno Card */}
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800">Abrir Turno</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Olá, <span className="font-semibold text-green-600">{currentUser?.name}</span>! Abra seu turno para começar as vendas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasOtherActiveShift && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Atenção!</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Existe {activeShifts.length} turno(s) ativo(s) de outro(s) usuário(s). 
                  Ao abrir seu turno, o(s) turno(s) ativo(s) será(ão) fechado(s) automaticamente.
                </p>
                <div className="mt-2 text-xs text-yellow-600">
                  {activeShifts.map(shift => (
                    <div key={shift.id}>
                      • {shift.userName} - {new Date(shift.startTime).toLocaleString('pt-BR')}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-lg text-gray-600 font-medium">
                {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
            
            <Button 
              onClick={handleOpenShift} 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
              size="lg"
            >
              {hasOtherActiveShift ? 'Fechar Outros Turnos e Abrir Meu Turno' : 'Abrir Turno'}
            </Button>
            
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full py-3 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de Turnos */}
        {shifts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Turnos</CardTitle>
              <CardDescription>
                Últimos turnos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shifts
                  .filter(shift => !shift.isActive)
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                  .slice(0, 5)
                  .map((shift) => {
                    // Buscar vendas diretamente do salesStore para este turno específico
                    const salesStore = useSalesStore.getState();
                    const allSales = salesStore.sales;
                    const shiftSales = allSales.filter((sale: any) => sale.shiftId === shift.id);
                    const shiftTotal = shiftSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
                    const shiftItems = shiftSales.reduce((sum: number, sale: any) => 
                      sum + sale.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
                    );
                    
                    return (
                      <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 hover:shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{shift.userName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(shift.startTime).toLocaleString('pt-BR')} - 
                              {shift.endTime ? new Date(shift.endTime).toLocaleString('pt-BR') : 'Em andamento'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">R$ {shiftTotal.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">
                            {shiftSales.length} vendas • {shiftItems} itens
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const shiftSales = getCurrentShiftSales();
  const totalSales = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = shiftSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const paymentBreakdown = getPaymentBreakdown(shiftSales);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Turno Ativo</h2>
          <p className="text-muted-foreground">
            Iniciado em {currentShift.startTime.toLocaleString('pt-BR')}
          </p>
          {hasOtherActiveShift && (
            <p className="text-sm text-yellow-600 mt-1">
              ⚠️ Atenção: Existem outros turnos ativos no sistema
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Fechar Turno
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Fechar turno?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja fechar o turno? Esta ação encerrará suas atividades de vendas.
                  <br /><br />
                  <strong>Resumo do turno:</strong>
                  <br />• Total vendido: R$ {totalSales.toFixed(2)}
                  <br />• Vendas realizadas: {shiftSales.length}
                  <br />• Itens vendidos: {totalItems}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCloseShift}>
                  Fechar Turno
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sair sem fechar turno?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem um turno ativo. Deseja sair mesmo assim? O turno continuará ativo e você poderá retornar mais tarde.
                  <br /><br />
                  <strong>Importante:</strong> Outros usuários não poderão abrir novos turnos enquanto este estiver ativo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleForceLogout}>
                  Sair mesmo assim
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-800">Total Vendido</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalSales.toFixed(2)}
            </div>
            <p className="text-sm text-green-700 mt-1">Valor total do turno</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800">Itens Vendidos</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
            <p className="text-sm text-blue-700 mt-1">Produtos vendidos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-800">Vendas</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{shiftSales.length}</div>
            <p className="text-sm text-purple-700 mt-1">Transações realizadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formas de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Dinheiro</p>
              <p className="text-lg font-semibold">R$ {paymentBreakdown.dinheiro.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Débito</p>
              <p className="text-lg font-semibold">R$ {paymentBreakdown.debito.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Crédito</p>
              <p className="text-lg font-semibold">R$ {paymentBreakdown.credito.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">PIX</p>
              <p className="text-lg font-semibold">R$ {paymentBreakdown.pix.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Cortesia</p>
              <p className="text-lg font-semibold">R$ {paymentBreakdown.cortesia.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftManager;
