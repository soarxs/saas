import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIngredientStore, Ingredient } from '../store/ingredientStore';
import { 
  Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown,
  Search, Filter, RefreshCw, ShoppingCart, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const IngredientManager = () => {
  const {
    ingredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    updateStock,
    getLowStockIngredients
  } = useIngredientStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [stockUpdateDialog, setStockUpdateDialog] = useState<{ ingredient: Ingredient; operation: 'add' | 'subtract' | 'set' } | null>(null);
  const [stockQuantity, setStockQuantity] = useState('');

  // Formulário para novo ingrediente
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: 'premium' as 'premium' | 'basic' | 'free',
    price: 0,
    unit: 'unidade' as 'unidade' | 'kg' | 'litro' | 'pacote',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    cost: 0,
    supplier: '',
    isActive: true
  });

  // Filtrar ingredientes
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockIngredients = getLowStockIngredients();

  const handleAddIngredient = () => {
    if (!newIngredient.name || newIngredient.price < 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    addIngredient(newIngredient);
    setNewIngredient({
      name: '',
      category: 'premium',
      price: 0,
      unit: 'unidade',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      cost: 0,
      supplier: '',
      isActive: true
    });
    setIsAddDialogOpen(false);
    toast.success('Ingrediente adicionado com sucesso!');
  };

  const handleUpdateStock = () => {
    if (!stockUpdateDialog || !stockQuantity) return;

    const quantity = parseFloat(stockQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Quantidade inválida');
      return;
    }

    updateStock(stockUpdateDialog.ingredient.id, quantity, stockUpdateDialog.operation);
    setStockUpdateDialog(null);
    setStockQuantity('');
    toast.success('Estoque atualizado com sucesso!');
  };

  const handleDeleteIngredient = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ingrediente?')) {
      deleteIngredient(id);
      toast.success('Ingrediente excluído com sucesso!');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-red-100 text-red-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.currentStock <= ingredient.minStock) {
      return { status: 'low', color: 'text-red-600', icon: AlertTriangle };
    } else if (ingredient.currentStock >= ingredient.maxStock * 0.8) {
      return { status: 'high', color: 'text-green-600', icon: TrendingUp };
    } else {
      return { status: 'normal', color: 'text-gray-600', icon: Package };
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Estoque</h1>
          <p className="text-muted-foreground">Controle de ingredientes e estoque</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Ingrediente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Ingrediente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Ingrediente</Label>
                <Input
                  id="name"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  placeholder="Ex: Carne, Queijo, Alface..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={newIngredient.category} onValueChange={(value: any) => setNewIngredient({ ...newIngredient, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium (R$ 5,00)</SelectItem>
                      <SelectItem value="basic">Básico (R$ 2-3,00)</SelectItem>
                      <SelectItem value="free">Gratuito (R$ 0,00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Select value={newIngredient.unit} onValueChange={(value: any) => setNewIngredient({ ...newIngredient, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidade">Unidade</SelectItem>
                      <SelectItem value="kg">Quilograma</SelectItem>
                      <SelectItem value="litro">Litro</SelectItem>
                      <SelectItem value="pacote">Pacote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço de Venda</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newIngredient.price}
                    onChange={(e) => setNewIngredient({ ...newIngredient, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cost">Custo</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newIngredient.cost}
                    onChange={(e) => setNewIngredient({ ...newIngredient, cost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentStock">Estoque Atual</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={newIngredient.currentStock}
                    onChange={(e) => setNewIngredient({ ...newIngredient, currentStock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="minStock">Estoque Mínimo</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newIngredient.minStock}
                    onChange={(e) => setNewIngredient({ ...newIngredient, minStock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxStock">Estoque Máximo</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={newIngredient.maxStock}
                    onChange={(e) => setNewIngredient({ ...newIngredient, maxStock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={newIngredient.supplier}
                  onChange={(e) => setNewIngredient({ ...newIngredient, supplier: e.target.value })}
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddIngredient} className="flex-1">
                  Adicionar
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de estoque baixo */}
      {lowStockIngredients.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {lowStockIngredients.length} ingrediente(s) com estoque baixo:
            {lowStockIngredients.map(ingredient => ` ${ingredient.name}`).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="basic">Básico</SelectItem>
            <SelectItem value="free">Gratuito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de ingredientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ingredientes ({filteredIngredients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map((ingredient) => {
                  const stockStatus = getStockStatus(ingredient);
                  const StatusIcon = stockStatus.icon;
                  
                  return (
                    <TableRow key={ingredient.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{ingredient.name}</div>
                          <div className="text-sm text-gray-500">{ingredient.unit}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(ingredient.category)}>
                          {ingredient.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(ingredient.price)}</div>
                          <div className="text-sm text-gray-500">Custo: {formatCurrency(ingredient.cost)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ingredient.currentStock}</div>
                          <div className="text-sm text-gray-500">
                            Min: {ingredient.minStock} | Max: {ingredient.maxStock}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${stockStatus.color}`} />
                          <span className={stockStatus.color}>
                            {stockStatus.status === 'low' ? 'Baixo' : 
                             stockStatus.status === 'high' ? 'Alto' : 'Normal'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{ingredient.supplier || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStockUpdateDialog({ ingredient, operation: 'add' })}
                          >
                            <TrendingUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStockUpdateDialog({ ingredient, operation: 'subtract' })}
                          >
                            <TrendingDown className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingIngredient(ingredient)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteIngredient(ingredient.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para atualizar estoque */}
      {stockUpdateDialog && (
        <Dialog open={!!stockUpdateDialog} onOpenChange={() => setStockUpdateDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {stockUpdateDialog.operation === 'add' ? 'Adicionar' : 
                 stockUpdateDialog.operation === 'subtract' ? 'Remover' : 'Definir'} Estoque
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Ingrediente: <strong>{stockUpdateDialog.ingredient.name}</strong>
              </p>
              <p>
                Estoque atual: <strong>{stockUpdateDialog.ingredient.currentStock}</strong>
              </p>
              
              <div>
                <Label htmlFor="stockQuantity">
                  {stockUpdateDialog.operation === 'add' ? 'Quantidade a adicionar:' :
                   stockUpdateDialog.operation === 'subtract' ? 'Quantidade a remover:' :
                   'Nova quantidade:'}
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateStock} className="flex-1">
                  Atualizar
                </Button>
                <Button variant="outline" onClick={() => setStockUpdateDialog(null)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IngredientManager;





