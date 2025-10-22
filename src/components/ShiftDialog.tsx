import { useState } from 'react'
import { useShift } from '../contexts/ShiftContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { DollarSign, Clock, User } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShiftDialog({ open, onOpenChange }: ShiftDialogProps) {
  const { openShift } = useShift()
  const [initialCashFund, setInitialCashFund] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!initialCashFund || parseFloat(initialCashFund) < 0) {
      toast.error('Digite um valor válido para o fundo inicial')
      return
    }

    try {
      setIsSubmitting(true)
      await openShift(parseFloat(initialCashFund))
      setInitialCashFund('')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao abrir turno:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setInitialCashFund('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Abertura de Turno
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cashFund" className="text-sm font-medium">
              Fundo de Caixa Inicial
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="cashFund"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={initialCashFund}
                onChange={(e) => setInitialCashFund(e.target.value)}
                className="pl-10"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500">
              Valor em dinheiro para iniciar o turno
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <User className="h-4 w-4" />
              <span>Operador: Usuário Atual</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800 mt-1">
              <Clock className="h-4 w-4" />
              <span>Início: {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {initialCashFund && parseFloat(initialCashFund) > 0 && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Fundo inicial:</strong> {formatCurrency(parseFloat(initialCashFund))}
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
              disabled={isSubmitting || !initialCashFund}
            >
              {isSubmitting ? 'Abrindo...' : 'Abrir Turno'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
