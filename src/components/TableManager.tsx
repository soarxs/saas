
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '../store/useStore';
import { Table, TableStatus, ProductCategory } from '../types';
import TableOrderDialog from './TableOrderDialog';
import TableBillDialog from './TableBillDialog';
import CounterSaleDialog from './CounterSaleDialog';
import { useTableNavigation } from '../hooks/useTableNavigation';
import { toast } from 'sonner';

interface TableManagerProps {
  sidebarOpen?: boolean;
}

const TableManager = ({ sidebarOpen = true }: TableManagerProps) => {
  const { tables, updateTableStatus, clearTable, currentShift } = useStore();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [showCounterDialog, setShowCounterDialog] = useState(false);

  // Sistema de navegação de mesas com Ctrl + 01, 02, etc.
  const handleNavigateToTable = (tableNumber: number) => {
    if (tableNumber === 0) {
      // Balcão
      setShowCounterDialog(true);
    } else {
      // Mesa específica
      setSelectedTable(tableNumber);
      setShowOrderDialog(true);
    }
  };

  const { currentBuffer, isWaitingForDigit } = useTableNavigation({
    onNavigateToTable: handleNavigateToTable,
    maxTables: 20
  });

  const getTableColor = (status: TableStatus, hasOrders: boolean, isCounter: boolean = false) => {
    // Cor especial para o balcão (vendas rápidas)
    if (isCounter) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl transition-all duration-300';
    }
    
    // Cores normais para mesas
    if (status === 'requesting-bill') {
      return 'status-bill hover:shadow-xl transition-all duration-300';
    }
    if (hasOrders) {
      return 'status-occupied hover:shadow-xl transition-all duration-300';
    }
    return 'status-available hover:shadow-xl transition-all duration-300';
  };

  const getStatusText = (status: TableStatus, hasOrders: boolean, isCounter: boolean = false) => {
    if (isCounter) return 'Vendas Rápidas';
    if (status === 'requesting-bill') return 'Conta Solicitada';
    if (hasOrders) return 'Ocupada';
    return 'Livre';
  };

  const handleTableClick = (tableNumber: number, status: TableStatus) => {
    if (!currentShift?.isActive) {
      toast.error('É necessário abrir um turno para usar as mesas');
      return;
    }
    
    setSelectedTable(tableNumber);
    
    if (status === 'requesting-bill') {
      setShowBillDialog(true);
    } else {
      setShowOrderDialog(true);
    }
  };

  const handleRequestBill = (tableNumber: number) => {
    updateTableStatus(tableNumber, 'requesting-bill');
    const tableName = tableNumber === 0 ? 'Balcão' : `Mesa ${tableNumber}`;
    toast.success(`Conta solicitada para ${tableName}`);
    setShowOrderDialog(false);
  };

  const handlePayment = (tableNumber: number) => {
    clearTable(tableNumber);
    const tableName = tableNumber === 0 ? 'Balcão' : `Mesa ${tableNumber}`;
    toast.success(`Pagamento realizado - ${tableName} liberada`);
    setShowBillDialog(false);
    setSelectedTable(null);
  };

  // Criar arrays de mesas (balcão + mesas 1-20)
  const allTableNumbers = [0, ...Array.from({length: 20}, (_, i) => i + 1)];
  
  // Mapear mesas existentes e criar objetos para todas as mesas
  const allTables = allTableNumbers.map(num => {
    const existingTable = tables.find(t => t.id === num);
    return existingTable || {
      id: num,
      status: 'available' as TableStatus,
      orders: [],
      total: 0
    };
  });

  // Debug apenas se necessário
  if (process.env.NODE_ENV === 'development' && allTables.length === 0) {
    console.log('TableManager - Nenhuma mesa encontrada');
  }

  const balcao = allTables.find(t => t.id === 0);
  const regularTables = allTables.filter(t => t.id !== 0);

  return (
    <div className="p-6 bg-gray-50 h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mesas</h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="font-medium">Balcão Livre</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">Livre</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="font-medium">Ocupada</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span className="font-medium">Conta</span>
          </div>
        </div>
      </div>
      
      <div className={`grid gap-4 ${
        sidebarOpen 
          ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12' 
          : 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16'
      }`}>
        {/* Balcão */}
        {balcao && (
          <Card 
            className={`cursor-pointer ${getTableColor(balcao.status, balcao.orders.length > 0, true)} h-20 relative group hover:scale-105 transition-all duration-200 hover:shadow-xl`}
            onClick={() => setShowCounterDialog(true)}
          >
            <CardContent className="p-3 text-center flex flex-col justify-center h-full">
              <div className="text-white font-bold text-lg">
                Balcão
              </div>
              {balcao.total > 0 && (
                <div className="text-white text-sm font-semibold">
                  R$ {balcao.total.toFixed(2)}
                </div>
              )}
              <div className="absolute top-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 px-1 rounded">
                F9
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Mesas regulares */}
        {regularTables.map((table) => (
          <Card 
            key={table.id}
            className={`cursor-pointer ${getTableColor(table.status, table.orders.length > 0)} h-20 relative group hover:scale-105 transition-all duration-200 hover:shadow-xl`}
            onClick={() => handleTableClick(table.id, table.status)}
          >
            <CardContent className="p-3 text-center flex flex-col justify-center h-full">
              <div className="text-white font-bold text-lg">
                {table.id}
              </div>
              {table.total > 0 && (
                <div className="text-white text-sm font-semibold">
                  R$ {table.total.toFixed(2)}
                </div>
              )}
              <div className="absolute top-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 px-1 rounded">
                Ctrl+{table.id.toString().padStart(2, '0')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showOrderDialog && selectedTable !== null && (
        <TableOrderDialog
          tableNumber={selectedTable}
          onClose={() => {
            setShowOrderDialog(false);
            setSelectedTable(null);
          }}
          onRequestBill={handleRequestBill}
        />
      )}

      {showBillDialog && selectedTable !== null && (
        <TableBillDialog
          tableNumber={selectedTable}
          onClose={() => {
            setShowBillDialog(false);
            setSelectedTable(null);
          }}
          onPayment={handlePayment}
        />
      )}

      <CounterSaleDialog
        isOpen={showCounterDialog}
        onClose={() => setShowCounterDialog(false)}
      />
    </div>
  );
};

export default TableManager;
