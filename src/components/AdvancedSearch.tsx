import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Clock, Star } from 'lucide-react';
import { Product } from '../types';

interface AdvancedSearchProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

interface SearchHistory {
  query: string;
  timestamp: number;
  results: number;
}

const AdvancedSearch = ({ 
  products, 
  onProductSelect, 
  placeholder = "Buscar produtos...",
  className = ""
}: AdvancedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Carregar histórico de buscas do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('search-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history);
        setRecentSearches(history.slice(0, 5).map((h: SearchHistory) => h.query));
      } catch (error) {
        console.error('Erro ao carregar histórico de buscas:', error);
      }
    }
  }, []);

  // Função de busca melhorada
  const searchProducts = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const results = products.filter(product => {
      // Busca por nome
      if (product.name.toLowerCase().includes(queryLower)) return true;
      
      // Busca por código
      if (product.code.toLowerCase().includes(queryLower)) return true;
      
      // Busca por categoria
      if (product.category.toLowerCase().includes(queryLower)) return true;
      
      // Busca por descrição/ingredientes
      if (product.description?.toLowerCase().includes(queryLower)) return true;
      
      // Busca por preço (formato: "15" ou "15.50")
      const priceStr = product.price.toString();
      if (priceStr.includes(queryLower)) return true;
      
      return false;
    });

    setFilteredProducts(results);

    // Salvar no histórico
    if (query.trim() && results.length > 0) {
      const newHistoryItem: SearchHistory = {
        query: query.trim(),
        timestamp: Date.now(),
        results: results.length
      };

      const updatedHistory = [
        newHistoryItem,
        ...searchHistory.filter(h => h.query !== query.trim())
      ].slice(0, 10); // Manter apenas 10 buscas recentes

      setSearchHistory(updatedHistory);
      setRecentSearches(updatedHistory.slice(0, 5).map(h => h.query));
      
      localStorage.setItem('search-history', JSON.stringify(updatedHistory));
    }
  };

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, products]);

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setSearchQuery('');
    setFilteredProducts([]);
  };

  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setRecentSearches([]);
    localStorage.removeItem('search-history');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowHistory(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Histórico de buscas */}
      {showHistory && recentSearches.length > 0 && !searchQuery && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Buscas Recentes
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {recentSearches.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleHistorySelect(query)}
                  className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <Search className="w-3 h-3" />
                  {query}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados da busca */}
      {searchQuery && filteredProducts.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4" />
              {filteredProducts.length} produto(s) encontrado(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {product.code}
                        </Badge>
                        <span className="text-xs text-gray-500 capitalize">
                          {product.category}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-3">
                      <div className="font-bold text-green-600">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.available ? 'Disponível' : 'Indisponível'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nenhum resultado */}
      {searchQuery && filteredProducts.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="p-4 text-center">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Nenhum produto encontrado para "{searchQuery}"
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tente buscar por nome, código ou categoria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;





