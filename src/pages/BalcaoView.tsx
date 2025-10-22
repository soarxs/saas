import { useState, useEffect } from 'react'
import { useTables } from '../contexts/TableContext'
import { useBalcao } from '../contexts/BalcaoContext'
import { useShift } from '../contexts/ShiftContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { ProductPriceDialog } from '../components/ProductPriceDialog'
import { PaymentDialog } from '../components/PaymentDialog'
import { 
  Package, 
  Search, 
  ShoppingCart, 
  User, 
  Phone, 
  MapPin, 
  DollarSign,
  Plus,
  Minus,
  Trash2,
  Truck,
  Store
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { neighborhoodsStorage, Neighborhood } from '../lib/neighborhoods'
import toast from 'react-hot-toast'

export function BalcaoView() {
  const { products } = useTables()
  const { 
    cartItems, 
    deliveryInfo, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    setDeliveryInfo, 
    getCartTotal, 
    getCartItemsCount,
    addDeliveryFee
  } = useBalcao()
  const { currentShift } = useShift()
  
  const [activeTab, setActiveTab] = useState<'balcao' | 'delivery'>('balcao')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  
  // Estados para delivery
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [customDeliveryFee, setCustomDeliveryFee] = useState('')

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    setNeighborhoods(neighborhoodsStorage.getNeighborhoods())
  }, [])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setPriceDialogOpen(true)
  }

  const handleConfirmProduct = (product: any, quantity: number, customPrice: number) => {
    addToCart(product, quantity, customPrice)
  }

  const handleFinalizeSale = () => {
    if (cartItems.length === 0) {
      toast.error('Carrinho vazio')
      return
    }

    if (!currentShift) {
      toast.error('Nenhum turno aberto')
      return
    }

    if (activeTab === 'delivery') {
      if (!customerName || !customerPhone || !customerAddress) {
        toast.error('Preencha todos os dados do cliente')
        return
      }
      
      setDeliveryInfo({
        customer_name: customerName,
        phone: customerPhone,
        address: customerAddress,
        neighborhood: selectedNeighborhood,
        delivery_fee: parseFloat(customDeliveryFee) || 0
      })
    }

    setPaymentDialogOpen(true)
  }

  const handleNeighborhoodChange = (neighborhoodName: string) => {
    setSelectedNeighborhood(neighborhoodName)
    const neighborhood = neighborhoods.find(n => n.name === neighborhoodName)
    if (neighborhood) {
      setCustomDeliveryFee(neighborhood.delivery_fee.toString())
    }
  }

  const addDeliveryFeeToCart = () => {
    const fee = parseFloat(customDeliveryFee)
    if (fee > 0) {
      addDeliveryFee(fee)
      toast.success(`Taxa de entrega de ${formatCurrency(fee)} adicionada`)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    setCustomerName('')
    setCustomerPhone('')
    setCustomerAddress('')
    setSelectedNeighborhood('')
    setCustomDeliveryFee('')
    toast.success('Venda finalizada com sucesso!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'balcao' ? 'Balcão' : 'Delivery'}
          </h1>
          <p className="text-gray-600">
            {activeTab === 'balcao' 
              ? 'Vendas diretas no balcão' 
              : 'Pedidos para entrega'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentShift ? 'success' : 'secondary'}>
            {currentShift ? 'Turno Aberto' : 'Turno Fechado'}
          </Badge>
        </div>
      </div>

      {/* Abas */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'balcao' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('balcao')}
          className={activeTab === 'balcao' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Store className="h-4 w-4 mr-2" />
          Balcão
        </Button>
        <Button
          variant={activeTab === 'delivery' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('delivery')}
          className={activeTab === 'delivery' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          <Truck className="h-4 w-4 mr-2" />
          Delivery
        </Button>
      </div>

      {/* Campos de Delivery */}
      {activeTab === 'delivery' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-600" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome completo"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="(11) 99999-9999"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rua, número, complemento"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bairro</label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => handleNeighborhoodChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Selecione o bairro</option>
                  {neighborhoods.map(neighborhood => (
                    <option key={neighborhood.id} value={neighborhood.name}>
                      {neighborhood.name} - {formatCurrency(neighborhood.delivery_fee)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Taxa de Entrega</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={customDeliveryFee}
                      onChange={(e) => setCustomDeliveryFee(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={addDeliveryFeeToCart}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={!customDeliveryFee || parseFloat(customDeliveryFee) <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid de Produtos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Todas as categorias' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid de Produtos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50"
                    onClick={() => handleProductClick(product)}
                  >
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {product.code}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({getCartItemsCount()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Itens do Carrinho */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.product_name}</div>
                          <div className="text-xs text-gray-500">{item.product_code}</div>
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(item.unit_price)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {formatCurrency(item.total_price)}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Taxa de Entrega */}
                  {activeTab === 'delivery' && deliveryInfo?.delivery_fee && deliveryInfo.delivery_fee > 0 && (
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-orange-800">Taxa de Entrega:</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {formatCurrency(deliveryInfo.delivery_fee)}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(getCartTotal())}
                      </span>
                    </div>
                  </div>

                  {/* Botão Finalizar */}
                  <Button
                    onClick={handleFinalizeSale}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={cartItems.length === 0 || !currentShift}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Finalizar Venda
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogos */}
      <ProductPriceDialog
        open={priceDialogOpen}
        onOpenChange={setPriceDialogOpen}
        product={selectedProduct}
        onConfirm={handleConfirmProduct}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        selectedTable={null}
        onPaymentSuccess={handlePaymentSuccess}
        isBalcaoDelivery={true}
        cartItems={cartItems}
        deliveryInfo={deliveryInfo}
        totalAmount={getCartTotal()}
      />
    </div>
  )
}
