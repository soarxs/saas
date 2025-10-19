import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useOrderStore } from '../store/orderStore';
import { useTableOperations } from '../hooks/useTableOperations';
import { formatCurrency } from '../utils/formatters';
import UtilitiesDialog from './UtilitiesDialog';

interface TableGridProps {
  onTableSelect: (tableNumber: number) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ onTableSelect }) => {
  const { currentUser, currentShift, syncAllStores } = useStore();
  const { getTodayOrders, getOrdersByTable } = useOrderStore();
  const { getTableData } = useTableOperations();
  
  // Estados
  const [searchCode, setSearchCode] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tableProducts, setTableProducts] = useState<any[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [showUtilities, setShowUtilities] = useState(false);

  // Sincronizar stores ao carregar
  useEffect(() => {
    syncAllStores();
  }, [syncAllStores]);

  // Calcular estatísticas
  const todayOrders = getTodayOrders();
  const occupiedTables = Array.from({ length: 20 }, (_, i) => i + 1)
    .filter(num => {
      const orders = getOrdersByTable(num);
      return orders.length > 0;
    });
  
  const freeTables = 20 - occupiedTables.length;
  const occupiedCount = occupiedTables.length;
  const readyOrders = todayOrders.filter(order => order.status === 'ready').length;

  // Função para verificar se mesa está ocupada
  const isTableOccupied = (tableNumber: number): boolean => {
    const orders = getOrdersByTable(tableNumber);
    return orders.length > 0;
  };

  // Função para obter total da mesa
  const getTableTotal = (tableNumber: number): number => {
    const orders = getOrdersByTable(tableNumber);
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  // Função para buscar produto por código
  const handleSearchProduct = (code: string) => {
    if (!code.trim()) return;
    
    // Aqui seria a lógica de busca de produto
    console.log('Buscando produto:', code);
    setSearchCode('');
  };

  // Função para selecionar mesa
  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    const tableData = getTableData(tableNumber);
    setTableProducts(tableData.orders);
    setTableTotal(tableData.total);
    onTableSelect(tableNumber);
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // F1 - Buscar produtos
      if (e.key === 'F1') {
        e.preventDefault();
        // Abrir dialog de busca de produtos
        console.log('F1 - Buscar produtos');
      }

      // F2 - Receber
      if (e.key === 'F2') {
        e.preventDefault();
        if (selectedTable) {
          console.log('F2 - Receber mesa:', selectedTable);
        }
      }

      // F3 - Encerrar/Reabrir
      if (e.key === 'F3') {
        e.preventDefault();
        console.log('F3 - Encerrar/Reabrir');
      }

      // F5 - Imprimir
      if (e.key === 'F5') {
        e.preventDefault();
        console.log('F5 - Imprimir');
      }

      // F6 - Histórico
      if (e.key === 'F6') {
        e.preventDefault();
        console.log('F6 - Histórico');
      }

      // F7 - Utilitários
      if (e.key === 'F7') {
        e.preventDefault();
        setShowUtilities(true);
      }

      // F8 - Delivery
      if (e.key === 'F8') {
        e.preventDefault();
        console.log('F8 - Delivery');
      }

      // F9 - Comandas
      if (e.key === 'F9') {
        e.preventDefault();
        console.log('F9 - Comandas');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedTable]);

  return (
    <div className="legacy-system h-screen">
      {/* Header */}
      <header className="legacy-header">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-red-600 font-bold text-xl">CIA DO LANCHE</h1>
            <p className="text-sm text-gray-700">Gerenciador de Mesas</p>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-800">Protótipo PDV</h2>
          </div>
          
          <div className="text-right space-y-1">
            <div className="text-green-600 font-bold">Livres: {freeTables}</div>
            <div className="text-red-600 font-bold">Ocupados: {occupiedCount}</div>
            <div className="text-yellow-600 font-bold">Pediu Conta: 0</div>
            <div className="text-blue-600 font-bold">Pedidos Prontos: {readyOrders}</div>
          </div>
          
          <button className="legacy-button legacy-button-red px-6 py-2 text-lg font-bold">
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Sidebar Esquerda */}
        <aside className="legacy-sidebar space-y-4 lg:w-80 w-full">
          {/* Identificação Caixa */}
          <div className="bg-red-600 text-white p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">1</div>
              <div>
                <div className="text-lg font-bold">003</div>
                <div className="text-sm">CAIXA</div>
              </div>
            </div>
            <div className="mt-2 text-sm">Mesa/Comanda Operador[F1]</div>
          </div>

          {/* Campo de busca */}
          <div>
            <input 
              type="text"
              placeholder="Lançar produto"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchProduct(searchCode);
                }
              }}
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-lg"
            />
          </div>

          {/* Tabela de produtos na mesa */}
          <div className="border-2 border-gray-400 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left border-r border-gray-400">Cód.</th>
                  <th className="p-2 text-left border-r border-gray-400">Produto</th>
                  <th className="p-2 text-left border-r border-gray-400">Qtde</th>
                  <th className="p-2 text-left border-r border-gray-400">Preço</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {tableProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300">{product.code || ''}</td>
                    <td className="p-2 border-r border-gray-300">{product.name || ''}</td>
                    <td className="p-2 border-r border-gray-300">{product.quantity || 1}</td>
                    <td className="p-2 border-r border-gray-300">{formatCurrency(product.price || 0)}</td>
                    <td className="p-2 font-bold">{formatCurrency(product.subtotal || 0)}</td>
                  </tr>
                ))}
                {tableProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Nenhum produto adicionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="bg-red-600 text-white p-4 rounded-lg text-center">
            <div className="text-xl font-bold">Total Mesa: {formatCurrency(tableTotal)}</div>
          </div>

          {/* Botões de ação */}
          <div className="grid grid-cols-3 gap-2">
            <button className="legacy-button legacy-button-green">
              F2 - Receber
            </button>
            <button className="legacy-button legacy-button-gray">
              F3 - Encerrar-Reabrir
            </button>
            <button className="legacy-button legacy-button-gray text-red-600">
              F4 - Cancelar / Transferir
            </button>
            <button className="legacy-button legacy-button-gray">
              F5 - Imprimir
            </button>
            <button className="legacy-button legacy-button-gray">
              F6 - Histórico Pedidos
            </button>
            <button 
              onClick={() => setShowUtilities(true)}
              className="legacy-button legacy-button-gray"
            >
              F7 - Utilitários
            </button>
            <button className="legacy-button legacy-button-gray">
              F8 - Delivery
            </button>
            <button className="legacy-button legacy-button-gray">
              F9 - Comandas
            </button>
            <button className="legacy-button legacy-button-green">
              Não impressos
            </button>
          </div>
        </aside>

        {/* Área principal - Grid de mesas */}
        <main className="flex-1 p-4 overflow-auto">
          {/* Abas */}
          <div className="flex mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-t-lg">
              Mesas
            </button>
            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-t-lg">
              Comandas
            </button>
          </div>

          {/* Range de mesas */}
          <div className="flex gap-2 mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              0 - 20
            </button>
          </div>

          {/* Grid de mesas responsivo */}
          <div className="legacy-mesa-grid">
            {/* BALCÃO */}
            <button 
              onClick={() => handleTableSelect(0)}
              className={`w-20 h-20 rounded-lg border-2 border-gray-400 flex flex-col items-center justify-center font-bold ${
                selectedTable === 0 ? 'ring-4 ring-blue-500 bg-yellow-200' : 'bg-yellow-200'
              }`}
            >
              <div className="text-lg text-black">BALCAO</div>
              <div className="text-sm text-black">{formatCurrency(getTableTotal(0))}</div>
            </button>

            {/* Mesas 01-20 */}
            {Array.from({ length: 20 }, (_, i) => i + 1).map(num => {
              const isOccupied = isTableOccupied(num);
              const total = getTableTotal(num);
              
              return (
                <button
                  key={num}
                  onClick={() => handleTableSelect(num)}
                  className={`w-20 h-20 rounded-lg border-2 border-gray-400 flex flex-col items-center justify-center font-bold ${
                    isOccupied 
                      ? 'bg-red-500 text-white' 
                      : 'bg-green-500 text-black'
                  } ${selectedTable === num ? 'ring-4 ring-blue-500' : ''}`}
                >
                  <div className="text-lg">{String(num).padStart(2, '0')}</div>
                  <div className="text-sm">{formatCurrency(total)}</div>
                </button>
              );
            })}
          </div>
        </main>
      </div>

      {/* Dialog de Utilitários */}
      <UtilitiesDialog
        isOpen={showUtilities}
        onClose={() => setShowUtilities(false)}
      />
    </div>
  );
};

export default TableGrid;