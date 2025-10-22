import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Package, DollarSign, Plus, Minus } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

interface ProductPriceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  onConfirm: (product: any, quantity: number, customPrice: number) => void
}

export function ProductPriceDialog({ open, onOpenChange, product, onConfirm }: ProductPriceDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [customPrice, setCustomPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (product && open) {
      setCustomPrice(product.price.toString())
      setQuantity(1)
    }
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product) return

    const price = parseFloat(customPrice)
    if (isNaN(price) || price < 0) {
      toast.error('Digite um preço válido')
      return
    }

    if (quantity < 1) {
      toast.error('Quantidade deve ser maior que zero')
      return
    }

    try {
      setIsSubmitting(true)
      onConfirm(product, quantity, price)
      handleClose()
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setQuantity(1)
    setCustomPrice('')
    onOpenChange(false)
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const totalPrice = parseFloat(customPrice) * quantity

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Adicionar Produto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações do Produto */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.code}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
            </div>
          </div>

          {/* Preço Editável */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Preço Unitário
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="pl-10"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500">
              Preço padrão: {formatCurrency(product.price)}
            </p>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quantidade</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-10 h-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center"
                />
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={incrementQuantity}
                className="w-10 h-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total */}
          {customPrice && quantity && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {quantity}x {formatCurrency(parseFloat(customPrice))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !customPrice}
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar ao Carrinho'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
