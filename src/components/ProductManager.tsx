import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useStore } from '../store/useStore';
import { useProductStore } from '../store/productStore';
import { Product, ProductCategory } from '../types';
import { useProductSearch } from '../hooks/useProductSearch';
import { Plus, Edit, Trash2, Package, Search, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'hamburguer', label: 'Hambúrguer' },
  { value: 'bebida', label: 'Bebida' },
  { value: 'acompanhamento', label: 'Acompanhamento' },
  { value: 'sobremesa', label: 'Sobremesa' },
  { value: 'combo', label: 'Combo' }
];

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
    name: '', code: '', price: '', category: 'hamburguer' as ProductCategory,
    available: true, description: '', currentStock: '', minStock: '', maxStock: ''
  });

  const filteredProducts = useProductSearch({ products, searchTerm, selectedCategory });
  const lowStockProducts = getLowStockProducts();

  const resetForm = () => {
    setFormData({
      name: '', code: '', price: '', category: 'hamburguer',
      available: true, description: '', currentStock: '', minStock: '', maxStock: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      code: formData.code,
      price: parseFloat(formData.price),
      category: formData.category,
      available: formData.available,
      description: formData.description,
      currentStock: parseInt(formData.currentStock) || 0,
      minStock: parseInt(formData.minStock) || 0,
      maxStock: parseInt(formData.maxStock) || 0
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Produto atualizado com sucesso!');
    } else {
      addProduct(productData);
      toast.success('Produto adicionado com sucesso!');
    }
    
    resetForm();
    setIsAddDialogOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      code: product.code,
      price: product.price.toString(),
      category: product.category,
      available: product.available,
      description: product.description,
      currentStock: product.currentStock.toString(),
      minStock: product.minStock.toString(),
      maxStock: product.maxStock.toString()
    });
    setEditingProduct(product);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
      toast.success('Produto excluído com sucesso!');
    }
  };

  const handleStockUpdate = () => {
    if (!stockUpdateDialog || !stockQuantity) return;
    
    const quantity = parseInt(stockQuantity);
    updateStock(stockUpdateDialog.product.id, quantity, stockUpdateDialog.operation);
    toast.success('Estoque atualizado com sucesso!');
    setStockUpdateDialog(null);
    setStockQuantity('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
        <Button onClick={() => { resetForm(); setEditingProduct(null); setIsAddDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ProductCategory | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowDescriptions(!showDescriptions)}>
              {showDescriptions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de estoque baixo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStockProducts.map(product => (
                <Badge key={product.id} variant="outline" className="text-orange-700">
                  {product.name} - {product.currentStock} unidades
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <Card key={product.id} className={`${!product.available ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-gray-500">Código: {product.code}</p>
                </div>
                <Badge variant={product.available ? "default" : "secondary"}>
                  {product.available ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">R$ {product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500">Estoque: {product.currentStock}</span>
              </div>
              
              {showDescriptions && product.description && (
                <p className="text-sm text-gray-600">{product.description}</p>
              )}
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStockUpdateDialog({ product, operation: 'add' })}>
                  <Package className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de adicionar/editar produto */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="code">Código</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="price">Preço</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as ProductCategory})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="currentStock">Estoque Atual</Label>
                <Input id="currentStock" type="number" value={formData.currentStock} onChange={(e) => setFormData({...formData, currentStock: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="minStock">Estoque Mínimo</Label>
                <Input id="minStock" type="number" value={formData.minStock} onChange={(e) => setFormData({...formData, minStock: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="maxStock">Estoque Máximo</Label>
                <Input id="maxStock" type="number" value={formData.maxStock} onChange={(e) => setFormData({...formData, maxStock: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="available" checked={formData.available} onCheckedChange={(checked) => setFormData({...formData, available: checked})} />
              <Label htmlFor="available">Disponível</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Salvar</Button>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de atualização de estoque */}
      <Dialog open={!!stockUpdateDialog} onOpenChange={() => setStockUpdateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Estoque - {stockUpdateDialog?.product.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { setStockUpdateDialog(prev => prev ? {...prev, operation: 'add'} : null); handleStockUpdate(); }}>
                Adicionar
              </Button>
              <Button onClick={() => { setStockUpdateDialog(prev => prev ? {...prev, operation: 'subtract'} : null); handleStockUpdate(); }}>
                Subtrair
              </Button>
              <Button onClick={() => { setStockUpdateDialog(prev => prev ? {...prev, operation: 'set'} : null); handleStockUpdate(); }}>
                Definir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;