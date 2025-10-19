import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { usePromotionStore, Promotion, Coupon } from '../store/promotionStore';
import { useStore } from '../store/useStore';
import { 
  Plus, Edit, Trash2, Tag, Percent, Gift, Calendar, 
  Users, Eye, EyeOff, Copy, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PromotionManager = () => {
  const {
    promotions,
    coupons,
    addPromotion,
    updatePromotion,
    deletePromotion,
    activatePromotion,
    deactivatePromotion,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    activateCoupon,
    deactivateCoupon,
    getActivePromotions,
    getActiveCoupons
  } = usePromotionStore();

  const { products } = useStore();
  const [activeTab, setActiveTab] = useState('promotions');
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Formulário para nova promoção
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'buy_x_get_y' | 'combo',
    value: 0,
    minQuantity: 0,
    freeQuantity: 0,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    usageLimit: 0,
    createdBy: 'admin'
  });

  // Formulário para novo cupom
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    usageLimit: 0,
    createdBy: 'admin'
  });

  const activePromotions = getActivePromotions();
  const activeCoupons = getActiveCoupons();

  const handleAddPromotion = () => {
    if (!newPromotion.name || newPromotion.value <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    addPromotion(newPromotion);
    setNewPromotion({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minQuantity: 0,
      freeQuantity: 0,
      applicableProducts: [],
      applicableCategories: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      usageLimit: 0,
      createdBy: 'admin'
    });
    setIsPromotionDialogOpen(false);
    toast.success('Promoção criada com sucesso!');
  };

  const handleAddCoupon = () => {
    if (!newCoupon.code || !newCoupon.name || newCoupon.value <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    addCoupon(newCoupon);
    setNewCoupon({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      applicableProducts: [],
      applicableCategories: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      usageLimit: 0,
      createdBy: 'admin'
    });
    setIsCouponDialogOpen(false);
    toast.success('Cupom criado com sucesso!');
  };

  const handleDeletePromotion = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta promoção?')) {
      deletePromotion(id);
      toast.success('Promoção excluída com sucesso!');
    }
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
      deleteCoupon(id);
      toast.success('Cupom excluído com sucesso!');
    }
  };

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <Tag className="w-4 h-4" />;
      case 'buy_x_get_y': return <Gift className="w-4 h-4" />;
      case 'combo': return <Tag className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getPromotionTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Porcentagem';
      case 'fixed': return 'Valor Fixo';
      case 'buy_x_get_y': return 'Leve X Pague Y';
      case 'combo': return 'Combo';
      default: return type;
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promoções e Cupons</h1>
          <p className="text-muted-foreground">Gerencie promoções e cupons de desconto</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promoções Ativas</p>
                <p className="text-2xl font-bold text-green-600">{activePromotions.length}</p>
              </div>
              <Tag className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cupons Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{activeCoupons.length}</p>
              </div>
              <Percent className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Promoções</p>
                <p className="text-2xl font-bold text-purple-600">{promotions.length}</p>
              </div>
              <Gift className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cupons</p>
                <p className="text-2xl font-bold text-orange-600">{coupons.length}</p>
              </div>
              <Tag className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="promotions">Promoções</TabsTrigger>
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Promoções</h2>
            <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Promoção
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Nova Promoção</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="promoName">Nome da Promoção</Label>
                      <Input
                        id="promoName"
                        value={newPromotion.name}
                        onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                        placeholder="Ex: Combo Especial"
                      />
                    </div>
                    <div>
                      <Label htmlFor="promoType">Tipo</Label>
                      <Select value={newPromotion.type} onValueChange={(value: any) => setNewPromotion({ ...newPromotion, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentagem</SelectItem>
                          <SelectItem value="fixed">Valor Fixo</SelectItem>
                          <SelectItem value="buy_x_get_y">Leve X Pague Y</SelectItem>
                          <SelectItem value="combo">Combo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="promoDescription">Descrição</Label>
                    <Input
                      id="promoDescription"
                      value={newPromotion.description}
                      onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                      placeholder="Descrição da promoção"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="promoValue">
                        {newPromotion.type === 'percentage' ? 'Porcentagem (%)' : 
                         newPromotion.type === 'buy_x_get_y' ? 'Quantidade Mínima' : 'Valor'}
                      </Label>
                      <Input
                        id="promoValue"
                        type="number"
                        step={newPromotion.type === 'percentage' ? '1' : '0.01'}
                        value={newPromotion.value}
                        onChange={(e) => setNewPromotion({ ...newPromotion, value: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    
                    {newPromotion.type === 'buy_x_get_y' && (
                      <div>
                        <Label htmlFor="freeQuantity">Quantidade Grátis</Label>
                        <Input
                          id="freeQuantity"
                          type="number"
                          value={newPromotion.freeQuantity}
                          onChange={(e) => setNewPromotion({ ...newPromotion, freeQuantity: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="promoStartDate">Data de Início</Label>
                      <Input
                        id="promoStartDate"
                        type="date"
                        value={newPromotion.startDate}
                        onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="promoEndDate">Data de Fim</Label>
                      <Input
                        id="promoEndDate"
                        type="date"
                        value={newPromotion.endDate}
                        onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="promoUsageLimit">Limite de Uso (0 = ilimitado)</Label>
                    <Input
                      id="promoUsageLimit"
                      type="number"
                      value={newPromotion.usageLimit}
                      onChange={(e) => setNewPromotion({ ...newPromotion, usageLimit: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="promoActive"
                      checked={newPromotion.isActive}
                      onCheckedChange={(checked) => setNewPromotion({ ...newPromotion, isActive: checked })}
                    />
                    <Label htmlFor="promoActive">Promoção ativa</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddPromotion} className="flex-1">
                      Criar Promoção
                    </Button>
                    <Button variant="outline" onClick={() => setIsPromotionDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promotion.name}</div>
                          <div className="text-sm text-gray-500">{promotion.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPromotionTypeIcon(promotion.type)}
                          <span>{getPromotionTypeLabel(promotion.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promotion.type === 'percentage' ? `${promotion.value}%` : 
                         promotion.type === 'buy_x_get_y' ? `${promotion.minQuantity} por ${promotion.freeQuantity}` :
                         formatCurrency(promotion.value)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(promotion.startDate), 'dd/MM/yyyy', { locale: ptBR })}</div>
                          <div>{format(new Date(promotion.endDate), 'dd/MM/yyyy', { locale: ptBR })}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {promotion.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{promotion.usageCount}</div>
                          {promotion.usageLimit > 0 && (
                            <div className="text-gray-500">/ {promotion.usageLimit}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => promotion.isActive ? deactivatePromotion(promotion.id) : activatePromotion(promotion.id)}
                          >
                            {promotion.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPromotion(promotion)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePromotion(promotion.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Cupons</h2>
            <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Cupom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Cupom</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="couponCode">Código do Cupom</Label>
                      <Input
                        id="couponCode"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="Ex: DESCONTO10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="couponName">Nome</Label>
                      <Input
                        id="couponName"
                        value={newCoupon.name}
                        onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                        placeholder="Ex: Desconto 10%"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="couponDescription">Descrição</Label>
                    <Input
                      id="couponDescription"
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                      placeholder="Descrição do cupom"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="couponType">Tipo</Label>
                      <Select value={newCoupon.type} onValueChange={(value: any) => setNewCoupon({ ...newCoupon, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentagem</SelectItem>
                          <SelectItem value="fixed">Valor Fixo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="couponValue">
                        {newCoupon.type === 'percentage' ? 'Porcentagem (%)' : 'Valor (R$)'}
                      </Label>
                      <Input
                        id="couponValue"
                        type="number"
                        step={newCoupon.type === 'percentage' ? '1' : '0.01'}
                        value={newCoupon.value}
                        onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="couponMinOrder">Valor Mínimo do Pedido</Label>
                      <Input
                        id="couponMinOrder"
                        type="number"
                        step="0.01"
                        value={newCoupon.minOrderValue}
                        onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="couponMaxDiscount">Desconto Máximo (R$)</Label>
                      <Input
                        id="couponMaxDiscount"
                        type="number"
                        step="0.01"
                        value={newCoupon.maxDiscount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="couponStartDate">Data de Início</Label>
                      <Input
                        id="couponStartDate"
                        type="date"
                        value={newCoupon.startDate}
                        onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="couponEndDate">Data de Fim</Label>
                      <Input
                        id="couponEndDate"
                        type="date"
                        value={newCoupon.endDate}
                        onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="couponUsageLimit">Limite de Uso (0 = ilimitado)</Label>
                    <Input
                      id="couponUsageLimit"
                      type="number"
                      value={newCoupon.usageLimit}
                      onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="couponActive"
                      checked={newCoupon.isActive}
                      onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, isActive: checked })}
                    />
                    <Label htmlFor="couponActive">Cupom ativo</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddCoupon} className="flex-1">
                      Criar Cupom
                    </Button>
                    <Button variant="outline" onClick={() => setIsCouponDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(coupon.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{coupon.name}</div>
                          <div className="text-sm text-gray-500">{coupon.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {coupon.type === 'percentage' ? <Percent className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                          <span>{coupon.type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(coupon.startDate), 'dd/MM/yyyy', { locale: ptBR })}</div>
                          <div>{format(new Date(coupon.endDate), 'dd/MM/yyyy', { locale: ptBR })}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {coupon.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{coupon.usageCount}</div>
                          {coupon.usageLimit > 0 && (
                            <div className="text-gray-500">/ {coupon.usageLimit}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => coupon.isActive ? deactivateCoupon(coupon.id) : activateCoupon(coupon.id)}
                          >
                            {coupon.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCoupon(coupon)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromotionManager;





