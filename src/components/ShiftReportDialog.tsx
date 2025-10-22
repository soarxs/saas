import { useState, useEffect } from 'react'
import { useShift } from '../contexts/ShiftContext'
import { useTables } from '../contexts/TableContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { FileText, DollarSign, Calculator, Printer } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { printDocument } from '../lib/printService'
import toast from 'react-hot-toast'

interface ShiftReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShiftReportDialog({ open, onOpenChange }: ShiftReportDialogProps) {
  const { currentShift, closeShift, getShiftReport } = useShift()
  const { payments } = useTables()
  const [realCashAmount, setRealCashAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    if (open && currentShift) {
      const shiftReport = getShiftReport()
      if (shiftReport) {
        // Calcular vendas por forma de pagamento
        const todayPayments = payments.filter(payment => {
          const paymentDate = new Date(payment.created_at)
          const shiftDate = new Date(currentShift.start_time)
          return paymentDate.toDateString() === shiftDate.toDateString()
        })

        const salesByMethod = todayPayments.reduce((acc, payment) => {
          acc[payment.payment_method] = (acc[payment.payment_method] || 0) + payment.amount
          return acc
        }, {} as Record<string, number>)

        setReport({
          ...shiftReport,
          salesByMethod,
          totalSales: todayPayments.reduce((sum, p) => sum + p.amount, 0)
        })
      }
    }
  }, [open, currentShift, payments, getShiftReport])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!realCashAmount || parseFloat(realCashAmount) < 0) {
      toast.error('Digite um valor válido para o dinheiro real no caixa')
      return
    }

    if (!report) {
      toast.error('Erro ao gerar relatório')
      return
    }

    try {
      setIsSubmitting(true)
      const difference = parseFloat(realCashAmount) - report.expectedCash
      
      // Imprimir relatório de fechamento antes de fechar
      const shiftReport = {
        shiftId: currentShift!.id,
        startTime: currentShift!.start_time,
        endTime: new Date().toISOString(),
        operator: 'Usuário Atual',
        initialCashFund: report.initialCashFund,
        salesByMethod: report.salesByMethod,
        totalWithdrawals: report.totalWithdrawals,
        totalAdditions: report.totalAdditions,
        expectedCash: report.expectedCash,
        realCash: parseFloat(realCashAmount),
        difference: difference,
        totalSales: report.totalSales
      }
      
      await printDocument('shift', shiftReport)
      
      await closeShift(parseFloat(realCashAmount), report.totalSales)
      
      // Mostrar resultado do fechamento
      if (difference === 0) {
        toast.success('Fechamento realizado com sucesso! Caixa fechou exato.')
      } else if (difference > 0) {
        toast.success(`Fechamento realizado! Sobra de ${formatCurrency(difference)}`)
      } else {
        toast.success(`Fechamento realizado! Falta de ${formatCurrency(Math.abs(difference))}`)
      }
      
      setRealCashAmount('')
      setReport(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao fechar turno:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRealCashAmount('')
    setReport(null)
    onOpenChange(false)
  }

  const handlePrint = () => {
    window.print()
  }

  if (!currentShift) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <FileText className="h-5 w-5" />
              Nenhum Turno Aberto
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              É necessário ter um turno aberto para gerar relatório.
            </p>
            <Button onClick={handleClose} className="bg-red-600 hover:bg-red-700">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!report) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const difference = realCashAmount ? parseFloat(realCashAmount) - report.expectedCash : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <FileText className="h-5 w-5" />
            Relatório de Fechamento de Turno
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Turno */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Informações do Turno</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Início:</span>
                <span className="ml-2 font-medium">
                  {new Date(currentShift.start_time).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Operador:</span>
                <span className="ml-2 font-medium">Usuário Atual</span>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Fundo Inicial</h3>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(report.initialCashFund)}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Total de Vendas</h3>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(report.totalSales)}
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-3">Total de Sangrias</h3>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(report.totalWithdrawals)}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-3">Total de Reforços</h3>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(report.totalAdditions)}
              </div>
            </div>
          </div>

          {/* Vendas por Forma de Pagamento */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Vendas por Forma de Pagamento</h3>
            <div className="space-y-2">
              {Object.entries(report.salesByMethod).map(([method, amount]) => (
                <div key={method} className="flex justify-between text-sm">
                  <span className="capitalize">{method.replace('_', ' ')}:</span>
                  <span className="font-medium">{formatCurrency(amount as number)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cálculo do Saldo */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Cálculo do Saldo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Fundo inicial:</span>
                <span>{formatCurrency(report.initialCashFund)}</span>
              </div>
              <div className="flex justify-between">
                <span>+ Vendas em dinheiro:</span>
                <span>{formatCurrency(report.salesByMethod.dinheiro || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>+ Reforços:</span>
                <span>{formatCurrency(report.totalAdditions)}</span>
              </div>
              <div className="flex justify-between">
                <span>- Sangrias:</span>
                <span className="text-red-600">-{formatCurrency(report.totalWithdrawals)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Saldo esperado:</span>
                <span>{formatCurrency(report.expectedCash)}</span>
              </div>
            </div>
          </div>

          {/* Formulário de Fechamento */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realCash" className="text-sm font-medium">
                Dinheiro Real no Caixa
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="realCash"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={realCashAmount}
                  onChange={(e) => setRealCashAmount(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {realCashAmount && (
              <div className={`p-3 rounded-lg ${
                difference === 0 
                  ? 'bg-green-50' 
                  : difference > 0 
                    ? 'bg-blue-50' 
                    : 'bg-red-50'
              }`}>
                <div className={`text-sm font-medium ${
                  difference === 0 
                    ? 'text-green-800' 
                    : difference > 0 
                      ? 'text-blue-800' 
                      : 'text-red-800'
                }`}>
                  <Calculator className="inline h-4 w-4 mr-1" />
                  {difference === 0 
                    ? 'Caixa fechou exato!' 
                    : difference > 0 
                      ? `Sobra: ${formatCurrency(difference)}` 
                      : `Falta: ${formatCurrency(Math.abs(difference))}`
                  }
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="flex-1"
                disabled={isSubmitting}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
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
                disabled={isSubmitting || !realCashAmount}
              >
                {isSubmitting ? 'Fechando...' : 'Fechar Turno'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
