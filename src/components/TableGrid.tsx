import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTableStore } from '../store/tableStore';
import { useOrderStore } from '../store/orderStore';
import { Store, Users, Clock, ShoppingCart } from 'lucide-react';

interface TableGridProps {
  onTableSelect: (tableNumber: number) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ onTableSelect }) => {
  const { tables } = useTableStore();
  const { getTodayOrders, getOrdersByTable } = useOrderStore();

  // Função para verificar se mesa está ocupada
  const isTableOccupied = (tableNumber: number): boolean => {
    const tableOrders = getOrdersByTable(tableNumber);
    return tableOrders.length > 0;
  };

  // Função para obter total da mesa
  const getTableTotal = (tableNumber: number): number => {
    const tableOrders = getOrdersByTable(tableNumber);
    return tableOrders.reduce((sum, order) => sum + order.total, 0);
  };

  // Calcular estatísticas
  const todayOrders = getTodayOrders();
  const occupiedTables = Array.from({ length: 99 }, (_, i) => i + 1)
    .filter(num => isTableOccupied(num));
  
  const freeTables = 99 - occupiedTables.length;
  const occupiedCount = occupiedTables.length;
  const todayOrdersCount = todayOrders.length;

  // Função para obter cor da mesa
  const getTableColor = (tableNumber: number): string => {
    return isTableOccupied(tableNumber) 
      ? 'bg-red-500 hover:bg-red-600 text-white' 
      : 'bg-green-500 hover:bg-green-600 text-white';
  };

  // Função para obter cor da sombra
  const getTableShadow = (tableNumber: number): string => {
    return isTableOccupied(tableNumber) 
      ? 'shadow-red-500/25 hover:shadow-red-500/40' 
      : 'shadow-green-500/25 hover:shadow-green-500/40';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {/* Header */}
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🍔</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CIA DO LANCHE</h1>
                <p className="text-sm text-gray-600">Sistema de Mesas</p>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-lg font-bold text-green-800">Livres</div>
                      <div className="text-2xl font-bold text-green-600">{freeTables}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="text-lg font-bold text-red-800">Ocupadas</div>
                      <div className="text-2xl font-bold text-red-600">{occupiedCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-lg font-bold text-blue-800">Pedidos Hoje</div>
                      <div className="text-2xl font-bold text-blue-600">{todayOrdersCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botão Balcão */}
            <Button
              onClick={() => onTableSelect(0)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Store className="w-6 h-6 mr-2" />
              BALCÃO
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de Mesas */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-gray-800">
            Mesas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-10 gap-3 max-w-6xl mx-auto">
            {Array.from({ length: 99 }, (_, i) => i + 1).map((tableNumber) => {
              const isOccupied = isTableOccupied(tableNumber);
              const total = getTableTotal(tableNumber);
              
              return (
                <button
                  key={tableNumber}
                  onClick={() => onTableSelect(tableNumber)}
                  className={`
                    aspect-square rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105
                    ${getTableColor(tableNumber)}
                    ${getTableShadow(tableNumber)}
                    shadow-lg hover:shadow-xl
                    flex flex-col items-center justify-center
                    border-2 border-white
                  `}
                >
                  <div className="text-2xl font-bold">
                    {tableNumber.toString().padStart(2, '0')}
                  </div>
                  {isOccupied && total > 0 && (
                    <div className="text-xs mt-1 opacity-90">
                      R$ {total.toFixed(2)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className="mt-6 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded border-2 border-white"></div>
              <span className="text-sm font-medium text-gray-700">Mesa Livre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded border-2 border-white"></div>
              <span className="text-sm font-medium text-gray-700">Mesa Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded border-2 border-white"></div>
              <span className="text-sm font-medium text-gray-700">Balcão</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableGrid;
