import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useOrderStore } from '../store/orderStore';
import { useTableOperations } from '../hooks/useTableOperations';
import { formatCurrency } from '../utils/formatters';

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

  // Sincronizar stores ao carregar
  useEffect(() => {
    syncAllStores();
  }, [syncAllStores]);

  // Calcular estatísticas
  const todayOrders = getTodayOrders();
  const occupiedTables = Array.from({ length: 99 }, (_, i) => i + 1)
    .filter(num => {
      const orders = getOrdersByTable(num);
      return orders.length > 0;
    });
  
  const freeTables = 99 - occupiedTables.length;
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
        <div>
          <h1>CIA DO LANCHE</h1>
          <p className="text-sm">Mesa/Comanda Operador[F1]</p>
        </div>
        
        <div className="text-center">
          <h2>Protótipo PDV</h2>
        </div>
        
        <div className="text-right">
          <div className="text-green-600 font-bold">Livres: {freeTables}</div>
          <div className="text-red-600 font-bold">Ocupadas: {occupiedCount}</div>
          <div className="text-yellow-600 font-bold">Pedidos Prontos: {readyOrders}</div>
        </div>
        
        <button className="legacy-button legacy-button-red px-8 py-2 text-xl">
          Sair
        </button>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Sidebar Esquerda */}
        <aside className="legacy-sidebar space-y-4 lg:w-80 w-full">
          {/* Identificação Caixa */}
          <div className="legacy-caixa">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="numero">003</div>
              <div className="label">CAIXA</div>
            </div>
          </div>

          {/* Campo de busca */}
          <div>
            <input 
              type="text"
              placeholder="🔍 Lançar produto"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchProduct(searchCode);
                }
              }}
              className="legacy-input"
            />
          </div>

          {/* Tabela de produtos na mesa */}
          <div className="border-2 border-gray-400 rounded">
            <table className="legacy-table">
              <thead>
                <tr>
                  <th className="p-1">Cód.</th>
                  <th className="p-1">Produto</th>
                  <th className="p-1">Qtde</th>
                  <th className="p-1">Preço</th>
                  <th className="p-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {tableProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="p-1">{product.code || ''}</td>
                    <td className="p-1">{product.name || ''}</td>
                    <td className="p-1">{product.quantity || 1}</td>
                    <td className="p-1">{formatCurrency(product.price || 0)}</td>
                    <td className="p-1">{formatCurrency(product.subtotal || 0)}</td>
                  </tr>
                ))}
                {tableProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      Nenhum produto adicionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="legacy-total">
            <div>Total Mesa: {formatCurrency(tableTotal)}</div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-2">
            <button className="w-full legacy-button legacy-button-green">
              F2 - Receber
            </button>
            <button className="w-full legacy-button legacy-button-gray">
              F3 - Encerrar-Reabrir
            </button>
            <button className="w-full legacy-button legacy-button-gray">
              F4 - Cancelar / Transferir
            </button>
            <button className="w-full legacy-button legacy-button-gray">
              F5 - Imprimir
            </button>
            <button className="w-full legacy-button legacy-button-gray">
              F6 - Histórico Pedidos
            </button>
            <button className="w-full legacy-button legacy-button-gray">
              F7 - Utilitários
            </button>
            <button className="w-full legacy-button legacy-button-gray">
              F8 - Delivery
            </button>
            <button className="w-full legacy-button legacy-button-gray">
              F9 - Comandas
            </button>
            <button className="w-full legacy-button legacy-button-green">
              Não impressos
            </button>
          </div>
        </aside>

        {/* Área principal - Grid de mesas */}
        <main className="flex-1 p-4 overflow-auto">
          {/* Abas */}
          <div className="legacy-tabs">
            <button className="legacy-tab active">
              Mesas
            </button>
            <button className="legacy-tab">
              Comandas
            </button>
          </div>

          {/* Range de mesas */}
          <div className="flex gap-2 mb-4">
            <button className="legacy-button legacy-button-gray">
              0 - 99
            </button>
            <button className="legacy-button legacy-button-gray">
              100 - 199
            </button>
          </div>

          {/* Grid de mesas responsivo */}
          <div className="legacy-mesa-grid">
            {/* BALCÃO */}
            <button 
              onClick={() => handleTableSelect(0)}
              className={`legacy-mesa-button legacy-mesa-balcao ${
                selectedTable === 0 ? 'ring-4 ring-blue-500' : ''
              }`}
            >
              <div className="text-lg">BALCAO</div>
              <div className="text-sm">{formatCurrency(getTableTotal(0))}</div>
            </button>

            {/* Mesas 01-99 */}
            {Array.from({ length: 99 }, (_, i) => i + 1).map(num => {
              const isOccupied = isTableOccupied(num);
              const total = getTableTotal(num);
              
              return (
                <button
                  key={num}
                  onClick={() => handleTableSelect(num)}
                  className={`legacy-mesa-button ${
                    isOccupied ? 'legacy-mesa-occupied' : 'legacy-mesa-available'
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
    </div>
  );
};

export default TableGrid;