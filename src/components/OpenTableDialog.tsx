import { useState } from 'react'
import { useTables } from '../contexts/TableContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import toast from 'react-hot-toast'

interface OpenTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTable?: any
}

export function OpenTableDialog({ open, onOpenChange, selectedTable }: OpenTableDialogProps) {
  const { openTable } = useTables()
  const [customerName, setCustomerName] = useState('')
  const [customerCount, setCustomerCount] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTable) {
      toast.error('Nenhuma mesa selecionada')
      return
    }

    setLoading(true)
    try {
      await openTable(
        selectedTable.number,
        customerName || undefined,
        customerCount
      )
      
      setCustomerName('')
      setCustomerCount(1)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao abrir mesa:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCustomerName('')
    setCustomerCount(1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Abrir Mesa {selectedTable?.number}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente (opcional)</Label>
            <Input
              id="customerName"
              placeholder="Digite o nome do cliente..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerCount">Quantidade de Pessoas</Label>
            <Input
              id="customerCount"
              type="number"
              min="1"
              max="20"
              value={customerCount}
              onChange={(e) => setCustomerCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Abrindo...' : 'Abrir Mesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
