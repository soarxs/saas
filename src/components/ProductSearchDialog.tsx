import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

interface ProductSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: any) => void;
}

const ProductSearchDialog: React.FC<ProductSearchDialogProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const { products } = useStore();
  
  // Estados
  const [searchField, setSearchField] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Ref para auto-focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no input de busca
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Filtrar produtos
  useEffect(() => {
    let filtered = products;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = products.filter(product => {
        switch (searchField) {
          case 'codigo':
            return product.code.toLowerCase().includes(term);
          case 'nome':
            return product.name.toLowerCase().includes(term);
          case 'categoria':
            return product.category.toLowerCase().includes(term);
          default:
            return (
              product.code.toLowerCase().includes(term) ||
              product.name.toLowerCase().includes(term) ||
              product.category.toLowerCase().includes(term)
            );
        }
      });
    }

    // Aplicar filtro de tipo
    if (filterType !== 'todos') {
      filtered = filtered.filter(product => {
        switch (filterType) {
          case 'disponivel':
            return product.available;
          case 'indisponivel':
            return !product.available;
          case 'estoque_baixo':
            return (product.currentStock || 0) <= (product.minStock || 0);
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
    setSelectedIndex(0);
  }, [products, searchTerm, searchField, filterType]);

  // Função para selecionar produto
  const handleSelectProduct = (product: any) => {
    onSelect(product);
    onClose();
  };

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
        return;
      }

      // Enter - Selecionar produto
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredProducts[selectedIndex]) {
          handleSelectProduct(filteredProducts[selectedIndex]);
        }
      }

      // Escape - Fechar
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Seta para cima
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredProducts.length - 1
        );
      }

      // Seta para baixo
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, filteredProducts, selectedIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">📋 Consulta Produtos</DialogTitle>
          <DialogDescription className="sr-only">
            Buscar e selecionar produtos do cardápio
          </DialogDescription>
        </DialogHeader>
        
        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="font-bold block mb-1">Campo</label>
            <select 
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full p-2 border-2 border-gray-400 rounded"
            >
              <option value="todos">Todos</option>
              <option value="codigo">Código</option>
              <option value="nome">Nome</option>
              <option value="categoria">Categoria</option>
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Filtro</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border-2 border-gray-400 rounded"
            >
              <option value="todos">Todos</option>
              <option value="disponivel">Disponível</option>
              <option value="indisponivel">Indisponível</option>
              <option value="estoque_baixo">Estoque Baixo</option>
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Produto</label>
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border-2 border-gray-400 rounded bg-yellow-200"
              placeholder="Digite para buscar..."
            />
          </div>
        </div>

        {/* Tabela de produtos */}
        <div className="border-2 border-gray-400 rounded max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-[#7FBACC] sticky top-0">
              <tr>
                <th className="p-2 border border-gray-400">Cód</th>
                <th className="p-2 border border-gray-400">Descrição</th>
                <th className="p-2 border border-gray-400">Preço</th>
                <th className="p-2 border border-gray-400">Estoque</th>
                <th className="p-2 border border-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr 
                  key={product.id}
                  className={`
                    cursor-pointer transition-colors
                    ${index % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}
                    ${index === selectedIndex ? 'bg-blue-200 ring-2 ring-blue-500' : ''}
                    hover:bg-blue-100
                  `}
                  onClick={() => handleSelectProduct(product)}
                >
                  <td className="p-2 border border-gray-400 font-mono">
                    {product.code}
                  </td>
                  <td className="p-2 border border-gray-400">
                    {product.name}
                  </td>
                  <td className="p-2 border border-gray-400 text-right font-mono">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="p-2 border border-gray-400 text-right">
                    {product.currentStock || 0}
                  </td>
                  <td className="p-2 border border-gray-400 text-center">
                    <span className={`
                      px-2 py-1 rounded text-xs font-bold
                      ${product.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {product.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informações */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            {filteredProducts.length} produto(s) encontrado(s)
          </div>
          <div>
            Use ↑↓ para navegar, Enter para selecionar, Esc para fechar
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              if (filteredProducts[selectedIndex]) {
                handleSelectProduct(filteredProducts[selectedIndex]);
              }
            }}
            className="legacy-button legacy-button-green"
          >
            ✓ Selecionar (Enter)
          </button>
          <button 
            onClick={onClose}
            className="legacy-button legacy-button-gray"
          >
            ⊗ Cancelar (Esc)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSearchDialog;
