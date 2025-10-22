import { useState, useEffect } from 'react'
import { useTables } from '../contexts/TableContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  CreditCard, 
  Banknote, 
  Smartphone,
  Gift,
  FileText,
  CheckCircle
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { printDocument } from '../lib/printService'
import toast from 'react-hot-toast'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTable?: any
  isBalcaoDelivery?: boolean
  cartItems?: any[]
  deliveryInfo?: any
  totalAmount?: number
  onPaymentSuccess?: () => void
}

const paymentMethods = [
  { id: 'dinheiro', name: 'Dinheiro', icon: Banknote, color: 'text-green-600' },
  { id: 'cartao_debito', name: 'Cartão Débito', icon: CreditCard, color: 'text-blue-600' },
  { id: 'cartao_credito', name: 'Cartão Crédito', icon: CreditCard, color: 'text-blue-600' },
  { id: 'pix', name: 'PIX', icon: Smartphone, color: 'text-purple-600' },
  { id: 'vale_alimentacao', name: 'Vale Alimentação', icon: Gift, color: 'text-orange-600' },
  { id: 'cheque', name: 'Cheque', icon: FileText, color: 'text-gray-600' },
  { id: 'cortesia', name: 'Cortesia', icon: CheckCircle, color: 'text-red-600' },
]

export function PaymentDialog({ 
  open, 
  onOpenChange, 
  selectedTable, 
  isBalcaoDelivery = false,
  cartItems = [],
  deliveryInfo,
  totalAmount: propTotalAmount,
  onPaymentSuccess
}: PaymentDialogProps) {
  const { 
    getTableOrdersWithProducts, 
    addPayment,
    closeTable 
  } = useTables()
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const tableOrders = selectedTable ? getTableOrdersWithProducts(selectedTable.id) : []
  const tableTotalAmount = tableOrders.reduce((sum, order) => sum + order.total_price, 0)
  const finalTotalAmount = isBalcaoDelivery ? (propTotalAmount || 0) : tableTotalAmount
  const change = amount - finalTotalAmount

  useEffect(() => {
    if (selectedTable || isBalcaoDelivery) {
      setAmount(finalTotalAmount)
      setSelectedPaymentMethod('')
      setPaymentComplete(false)
    }
  }, [selectedTable, isBalcaoDelivery, finalTotalAmount])

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Selecione uma forma de pagamento')
      return
    }

    if (amount < finalTotalAmount) {
      toast.error('Valor insuficiente')
      return
    }

    setLoading(true)
    try {
      if (isBalcaoDelivery) {
        // Para vendas do balcão/delivery, criar um pagamento genérico
        console.log('Pagamento balcão/delivery:', {
          cartItems,
          deliveryInfo,
          amount,
          paymentMethod: selectedPaymentMethod
        })
        
        // Imprimir comanda de cozinha
        if (cartItems.length > 0) {
          const kitchenOrder = {
            id: `BAL-${Date.now()}`,
            tableNumber: undefined,
            customerName: deliveryInfo?.customer_name,
            items: cartItems.map(item => ({
              quantity: item.quantity,
              productName: item.product_name,
              notes: undefined,
              modifications: []
            })),
            createdAt: new Date().toISOString(),
            orderType: deliveryInfo ? 'delivery' as const : 'balcao' as const
          }
          
          await printDocument('kitchen', kitchenOrder)
        }
        
        // Imprimir conta do cliente
        const customerReceipt = {
          id: `REC-${Date.now()}`,
          tableNumber: undefined,
          customerName: deliveryInfo?.customer_name,
          items: cartItems.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price
          })),
          subtotal: cartItems.reduce((sum, item) => sum + item.total_price, 0),
          deliveryFee: deliveryInfo?.delivery_fee || 0,
          total: finalTotalAmount,
          paymentMethod: selectedPaymentMethod,
          createdAt: new Date().toISOString(),
          orderType: deliveryInfo ? 'delivery' as const : 'balcao' as const,
          deliveryAddress: deliveryInfo?.address
        }
        
        await printDocument('receipt', customerReceipt)
        
        setPaymentComplete(true)
        
        setTimeout(() => {
          onOpenChange(false)
          setPaymentComplete(false)
          onPaymentSuccess?.()
        }, 2000)
      } else if (selectedTable) {
        await addPayment(selectedTable.id, amount, selectedPaymentMethod as any)
        setPaymentComplete(true)
        
        // Fechar mesa após pagamento
        setTimeout(async () => {
          await closeTable(selectedTable.id)
          onOpenChange(false)
          setPaymentComplete(false)
        }, 2000)
      }
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedPaymentMethod('')
    setAmount(0)
    setPaymentComplete(false)
    onOpenChange(false)
  }

  if (!selectedTable && !isBalcaoDelivery) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isBalcaoDelivery 
              ? `Pagamento - ${deliveryInfo ? 'Delivery' : 'Balcão'}`
              : `Pagamento - Mesa ${selectedTable?.number}`
            }
          </DialogTitle>
        </DialogHeader>

        {paymentComplete ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              Pagamento Aprovado!
            </h3>
            <p className="text-gray-600">
              {isBalcaoDelivery 
                ? 'Venda finalizada com sucesso!'
                : `Mesa ${selectedTable?.number} será fechada automaticamente...`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isBalcaoDelivery ? (
                    <>
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name} x{item.quantity}</span>
                          <span>{formatCurrency(item.total_price)}</span>
                        </div>
                      ))}
                      {deliveryInfo?.delivery_fee && deliveryInfo.delivery_fee > 0 && (
                        <div className="flex justify-between text-sm text-orange-600">
                          <span>Taxa de Entrega:</span>
                          <span>{formatCurrency(deliveryInfo.delivery_fee)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    tableOrders.map((order) => (
                      <div key={order.id} className="flex justify-between text-sm">
                        <span>{order.product.name} x{order.quantity}</span>
                        <span>{formatCurrency(order.total_price)}</span>
                      </div>
                    ))
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(finalTotalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <div className="space-y-3">
              <Label>Forma de Pagamento</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <Button
                      key={method.id}
                      variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                      className="flex flex-col items-center p-4 h-auto"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${method.color}`} />
                      <span className="text-xs">{method.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-3">
              <Label htmlFor="amount">Valor Recebido</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>

            {/* Troco */}
            {selectedPaymentMethod === 'dinheiro' && amount > finalTotalAmount && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-800">Troco:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(change)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aviso de valor insuficiente */}
            {amount < finalTotalAmount && amount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">
                  Valor insuficiente. Faltam {formatCurrency(finalTotalAmount - amount)}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          {!paymentComplete && (
            <Button
              onClick={handlePayment}
              disabled={loading || !selectedPaymentMethod || amount < finalTotalAmount}
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
