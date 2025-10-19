import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '../store/useStore';
import { Table, TableStatus } from '../types';
import { toast } from 'sonner';

interface TableManagerProps {
  sidebarOpen?: boolean;
}

const TableManager = ({ sidebarOpen = true }: TableManagerProps) => {
  const { tables, updateTableStatus, clearTable, currentShift } = useStore();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const handleTableClick = (tableNumber: number) => {
    setSelectedTable(tableNumber);
  };

  const handleClearTable = (tableNumber: number) => {
    if (confirm(`Tem certeza que deseja limpar a Mesa ${tableNumber}?`)) {
      clearTable(tableNumber);
      toast.success(`Mesa ${tableNumber} limpa com sucesso!`);
    }
  };

  const getTableStatus = (tableNumber: number): TableStatus => {
    const table = tables.find(t => t.number === tableNumber);
    return table?.status || 'available';
  };

  const getTableTotal = (tableNumber: number): number => {
    const table = tables.find(t => t.number === tableNumber);
    if (!table) return 0;
    
    return table.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getTableItemCount = (tableNumber: number): number => {
    const table = tables.find(t => t.number === tableNumber);
    if (!table) return 0;
    
    return table.items.reduce((count, item) => count + item.quantity, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cleaning': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusLabel = (status: TableStatus) => {
    switch (status) {
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'cleaning': return 'Limpeza';
      default: return 'Disponível';
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Gerenciamento de Mesas</h2>
        <p className="text-gray-600">
          {currentShift?.isActive 
            ? `Turno ativo: ${currentShift.user.name}` 
            : 'Nenhum turno ativo'
          }
        </p>
      </div>

      {/* Balcão */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Balcão</h3>
        <Card className="w-full max-w-sm">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <h4 className="font-semibold">Vendas Rápidas</h4>
              <p className="text-sm text-gray-600 mb-3">Atendimento no balcão</p>
              <Button 
                className="w-full"
                onClick={() => handleTableClick(0)}
              >
                Abrir Vendas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mesas */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mesas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((tableNumber) => {
            const status = getTableStatus(tableNumber);
            const total = getTableTotal(tableNumber);
            const itemCount = getTableItemCount(tableNumber);
            
            return (
              <Card 
                key={tableNumber} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTable === tableNumber ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleTableClick(tableNumber)}
              >
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="font-bold">{tableNumber}</span>
                    </div>
                    
                    <h4 className="font-semibold mb-1">Mesa {tableNumber}</h4>
                    
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </div>
                    
                    {total > 0 && (
                      <div className="mt-2 text-sm">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(total)}
                        </div>
                        <div className="text-gray-500">
                          {itemCount} item(s)
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableClick(tableNumber);
                        }}
                      >
                        Abrir
                      </Button>
                      {total > 0 && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearTable(tableNumber);
                          }}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tables.filter(t => t.status === 'available').length}
              </div>
              <div className="text-sm text-gray-600">Mesas Disponíveis</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tables.filter(t => t.status === 'occupied').length}
              </div>
              <div className="text-sm text-gray-600">Mesas Ocupadas</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(tables.reduce((total, table) => total + getTableTotal(table.number), 0))}
              </div>
              <div className="text-sm text-gray-600">Total em Mesas</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TableManager;