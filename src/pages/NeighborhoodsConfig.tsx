import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Settings
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { neighborhoodsStorage, Neighborhood } from '../lib/neighborhoods'
import toast from 'react-hot-toast'

export function NeighborhoodsConfig() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null)
  const [name, setName] = useState('')
  const [deliveryFee, setDeliveryFee] = useState('')

  useEffect(() => {
    loadNeighborhoods()
  }, [])

  const loadNeighborhoods = () => {
    setNeighborhoods(neighborhoodsStorage.getNeighborhoods())
  }

  const handleAdd = () => {
    setEditingNeighborhood(null)
    setName('')
    setDeliveryFee('')
    setDialogOpen(true)
  }

  const handleEdit = (neighborhood: Neighborhood) => {
    setEditingNeighborhood(neighborhood)
    setName(neighborhood.name)
    setDeliveryFee(neighborhood.delivery_fee.toString())
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este bairro?')) {
      neighborhoodsStorage.deleteNeighborhood(id)
      loadNeighborhoods()
      toast.success('Bairro excluído com sucesso!')
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Digite o nome do bairro')
      return
    }

    const fee = parseFloat(deliveryFee)
    if (isNaN(fee) || fee < 0) {
      toast.error('Digite uma taxa válida')
      return
    }

    try {
      if (editingNeighborhood) {
        neighborhoodsStorage.updateNeighborhood(editingNeighborhood.id, name.trim(), fee)
        toast.success('Bairro atualizado com sucesso!')
      } else {
        neighborhoodsStorage.addNeighborhood(name.trim(), fee)
        toast.success('Bairro adicionado com sucesso!')
      }
      
      loadNeighborhoods()
      setDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar bairro:', error)
      toast.error('Erro ao salvar bairro')
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
    setEditingNeighborhood(null)
    setName('')
    setDeliveryFee('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração de Bairros</h1>
          <p className="text-gray-600">Gerencie bairros e taxas de entrega</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Bairro
        </Button>
      </div>

      {/* Lista de Bairros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Bairros Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {neighborhoods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum bairro cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {neighborhoods.map((neighborhood) => (
                <div
                  key={neighborhood.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {neighborhood.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Taxa de entrega: {formatCurrency(neighborhood.delivery_fee)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(neighborhood)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(neighborhood.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Adicionar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              {editingNeighborhood ? 'Editar Bairro' : 'Adicionar Bairro'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome do Bairro
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Centro, Bairro Norte..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee" className="text-sm font-medium">
                Taxa de Entrega
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!name.trim() || !deliveryFee}
              >
                {editingNeighborhood ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
