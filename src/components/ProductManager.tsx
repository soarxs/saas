
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useStore } from '../store/useStore';
import { useProductStore } from '../store/productStore';
import { Product, ProductCategory } from '../types';
import { useProductSearch } from '../hooks/useProductSearch';
import { Plus, Edit, Trash2, Package, Search, Eye, EyeOff, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const ProductManager = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const { updateStock, getLowStockProducts } = useProductStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [stockUpdateDialog, setStockUpdateDialog] = useState<{ product: Product; operation: 'add' | 'subtract' | 'set' } | null>(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    category: 'hamburguer' as ProductCategory,
    available: true,
    description: '',
    currentStock: '',
    minStock: '',
    maxStock: ''
  });

  const filteredProducts = useProductSearch({
    products,
    searchTerm,
    selectedCategory
  });


  const categories: { value: ProductCategory; label: string }[] = [
    { value: 'hamburguer', label: 'Hambúrguer' },
    { value: 'bebida', label: 'Bebida' },
    { value: 'acompanhamento', label: 'Acompanhamento' },
    { value: 'sobremesa', label: 'Sobremesa' },
    { value: 'outro', label: 'Outro' }
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      price: '',
      category: 'hamburguer',
      available: true,
      description: '',
      currentStock: '',
      minStock: '',
      maxStock: ''
    });
    setEditingProduct(null);
  };

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stockUpdateDialog || !stockQuantity) {
      toast.error('Digite a quantidade');
      return;
    }

    const quantity = parseInt(stockQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Quantidade deve ser um número válido');
      return;
    }

    updateStock(stockUpdateDialog.product.id, quantity, stockUpdateDialog.operation);
    
    const operationText = {
      add: 'adicionada',
      subtract: 'removida',
      set: 'definida'
    }[stockUpdateDialog.operation];

    toast.success(`Estoque ${operationText} com sucesso!`);
    setStockUpdateDialog(null);
    setStockQuantity('');
  };

  const lowStockProducts = getLowStockProducts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    if (!formData.code.trim()) {
      toast.error('Código do produto é obrigatório');
      return;
    }

    if (!formData.price.trim()) {
      toast.error('Preço do produto é obrigatório');
      return;
    }

    // Verificar se o código já existe (apenas ao adicionar ou se mudou)
    const existingProduct = products.find(p => p.code === formData.code && p.id !== editingProduct?.id);
    if (existingProduct) {
      toast.error('Já existe um produto com este código');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Preço deve ser um valor válido maior que zero');
      return;
    }

    const currentStock = parseInt(formData.currentStock) || 0;
    const minStock = parseInt(formData.minStock) || 0;
    const maxStock = parseInt(formData.maxStock) || 100;

    if (currentStock < 0) {
      toast.error('Estoque atual não pode ser negativo');
      return;
    }

    if (minStock < 0) {
      toast.error('Estoque mínimo não pode ser negativo');
      return;
    }

    if (maxStock < 0) {
      toast.error('Estoque máximo não pode ser negativo');
      return;
    }

    if (minStock > maxStock) {
      toast.error('Estoque mínimo não pode ser maior que o máximo');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        code: formData.code,
        price,
        category: formData.category,
        available: formData.available,
        description: formData.description,
        currentStock,
        minStock,
        maxStock
      });
      toast.success('Produto atualizado com sucesso!');
    } else {
      addProduct({
        name: formData.name,
        code: formData.code,
        price,
        category: formData.category,
        available: formData.available,
        description: formData.description,
        currentStock,
        minStock,
        maxStock
      });
      toast.success('Produto adicionado com sucesso!');
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      price: product.price.toString(),
      category: product.category,
      available: product.available,
      description: product.description || '',
      currentStock: (product.currentStock || 0).toString(),
      minStock: (product.minStock || 0).toString(),
      maxStock: (product.maxStock || 100).toString()
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
      toast.success('Produto excluído com sucesso!');
    }
  };

  const toggleAvailability = (id: string, available: boolean) => {
    updateProduct(id, { available });
    toast.success(`Produto ${available ? 'disponibilizado' : 'indisponibilizado'} com sucesso!`);
  };

  const getCategoryIcon = (category: ProductCategory) => {
    switch (category) {
      case 'hamburguer': return '🍔';
      case 'bebida': return '🥤';
      case 'acompanhamento': return '🍟';
      case 'sobremesa': return '🍰';
      default: return '📦';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
          <p className="text-sm text-muted-foreground">Adicione, edite e gerencie seus produtos</p>
          {lowStockProducts.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {lowStockProducts.length} produto(s) com estoque baixo
              </span>
            </div>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gradient-burger hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Big Burger"
                  required
                />
              </div>

              <div>
                <Label htmlFor="code">Código do Produto</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ex: 001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: ProductCategory) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do produto"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentStock">Estoque Atual</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">Estoque Mínimo</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxStock">Estoque Máximo</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    min="0"
                    value={formData.maxStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxStock: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, available: checked }))
                  }
                />
                <Label htmlFor="available">Produto disponível</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca e Filtros Compactos */}
      <Card className="card-modern">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar: X-EGG, 01, frango bacon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ProductCategory | 'all')}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {getCategoryIcon(category.value)} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDescriptions(!showDescriptions)}
                className="h-10 w-full flex items-center gap-2"
              >
                {showDescriptions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showDescriptions ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
            <span>{filteredProducts.length} produtos</span>
            {searchTerm && (
              <span className="text-green-600">Filtrados: {filteredProducts.length} de {products.length}</span>
            )}
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredProducts.map(product => (
          <Card key={product.id} className={`${!product.available ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg">{getCategoryIcon(product.category)}</span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-bold truncate">{product.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {product.code} • {categories.find(c => c.value === product.category)?.label}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className="text-lg font-bold text-green-600">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <p className={`text-xs ${product.available ? 'text-green-600' : 'text-red-600'}`}>
                    {product.available ? '✓' : '✗'}
                  </p>
                  <div className="mt-1">
                    <p className={`text-xs font-medium ${
                      (product.currentStock || 0) <= (product.minStock || 0) 
                        ? 'text-red-600' 
                        : (product.currentStock || 0) <= (product.minStock || 0) * 1.5 
                          ? 'text-orange-600' 
                          : 'text-gray-600'
                    }`}>
                      Estoque: {product.currentStock || 0}
                    </p>
                    {(product.currentStock || 0) <= (product.minStock || 0) && (
                      <p className="text-xs text-red-500">⚠️ Baixo</p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {showDescriptions && product.description && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600 leading-relaxed">
                  {product.description}
                </div>
              )}
              <div className="space-y-2">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAvailability(product.id, !product.available)}
                    className="flex-1 text-xs h-8"
                  >
                    <Package className="w-3 h-3 mr-1" />
                    {product.available ? 'Indisponível' : 'Disponível'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStockUpdateDialog({ product, operation: 'add' })}
                    className="flex-1 text-xs h-7 text-green-600 hover:text-green-700"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    + Estoque
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStockUpdateDialog({ product, operation: 'subtract' })}
                    className="flex-1 text-xs h-7 text-orange-600 hover:text-orange-700"
                  >
                    <TrendingDown className="w-3 h-3 mr-1" />
                    - Estoque
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground">
              Comece adicionando seus primeiros produtos ao sistema
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Atualização de Estoque */}
      <Dialog open={!!stockUpdateDialog} onOpenChange={() => setStockUpdateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockUpdateDialog?.operation === 'add' && 'Adicionar Estoque'}
              {stockUpdateDialog?.operation === 'subtract' && 'Remover Estoque'}
              {stockUpdateDialog?.operation === 'set' && 'Definir Estoque'}
            </DialogTitle>
          </DialogHeader>
          {stockUpdateDialog && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Produto: <span className="font-semibold">{stockUpdateDialog.product.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Estoque atual: <span className="font-semibold">{stockUpdateDialog.product.currentStock || 0}</span>
                </p>
              </div>
              
              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="stockQuantity">
                    Quantidade {stockUpdateDialog.operation === 'add' ? 'a adicionar' : 
                               stockUpdateDialog.operation === 'subtract' ? 'a remover' : 
                               'a definir'}
                  </Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Digite a quantidade"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {stockUpdateDialog.operation === 'add' && 'Adicionar'}
                    {stockUpdateDialog.operation === 'subtract' && 'Remover'}
                    {stockUpdateDialog.operation === 'set' && 'Definir'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStockUpdateDialog(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default ProductManager;
