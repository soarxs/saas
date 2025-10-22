import { useState } from 'react'
import { useShift } from '../contexts/ShiftContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Plus, DollarSign, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

interface AdditionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdditionDialog({ open, onOpenChange }: AdditionDialogProps) {
  const { addAddition, currentShift } = useShift()
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!value || parseFloat(value) <= 0) {
      toast.error('Digite um valor válido para o reforço')
      return
    }

    if (!reason.trim()) {
      toast.error('Digite o motivo do reforço')
      return
    }

    try {
      setIsSubmitting(true)
      await addAddition(parseFloat(value), reason.trim())
      setValue('')
      setReason('')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao registrar reforço:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setValue('')
    setReason('')
    onOpenChange(false)
  }

  if (!currentShift) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Nenhum Turno Aberto
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              É necessário ter um turno aberto para realizar reforços.
            </p>
            <Button onClick={handleClose} className="bg-red-600 hover:bg-red-700">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Plus className="h-5 w-5" />
            Reforço de Caixa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="value" className="text-sm font-medium">
              Valor do Reforço
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-10"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motivo/Observação
            </Label>
            <Input
              id="reason"
              type="text"
              placeholder="Ex: Troco recebido, dinheiro adicional..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-800">
              <strong>Informação:</strong> Esta operação adicionará dinheiro ao caixa.
            </div>
            <div className="text-sm text-green-800 mt-1">
              <strong>Fundo atual:</strong> {formatCurrency(currentShift.initial_cash_fund)}
            </div>
          </div>

          {value && parseFloat(value) > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Valor a ser adicionado:</strong> {formatCurrency(parseFloat(value))}
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
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !value || !reason.trim()}
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Reforço'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
