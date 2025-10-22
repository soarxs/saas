import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTables } from '../contexts/TableContext'
import { useShift } from '../contexts/ShiftContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Search } from 'lucide-react'

export function MainLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { tables } = useTables()
  const { currentShift } = useShift()
  
  const [selectedTable, setSelectedTable] = useState<any | null>(null)
  const [productCode, setProductCode] = useState('')
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  // Estatísticas dinâmicas
  const freeTables = tables.filter(t => t.status === 'livre').length
  const occupiedTables = tables.filter(t => t.status === 'ocupada').length

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair do sistema?')) {
      logout()
      navigate('/login')
    }
  }

  const handleTableClick = (table: any) => {
    setSelectedTable(table)
    // Lógica para abrir mesa automaticamente se livre
    if (table.status === 'livre' && currentShift) {
      // Abrir mesa automaticamente
      console.log('Abrindo mesa:', table.number)
    }
  }

  const handleLaunchProduct = () => {
    if (!productCode.trim()) {
      alert('Digite o código do produto')
      return
    }
    // Lógica para lançar produto
    console.log('Lançando produto:', productCode)
    setProductCode('')
  }

  const handleReceivePayment = () => {
    if (!selectedTable) {
      alert('Selecione uma mesa primeiro')
      return
    }
    setIsPaymentDialogOpen(true)
  }

  return (
    <div className="h-screen w-screen bg-cyan-100 font-mono text-sm overflow-hidden">
      {/* Cabeçalho Superior - Barra Azul */}
      <header className="flex items-center justify-between bg-blue-600 text-white p-2 h-12">
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-lg font-bold">Gerenciador de Mesas</div>
            <div className="text-sm">CIA DO LANCHE</div>
          </div>
          <div className="text-sm">ARS Automação Comercial</div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-green-300">Livres: {freeTables}</span>
          <span className="text-red-300">Ocupados: {occupiedTables}</span>
          <span className="text-orange-300">Pediu Conta: 0</span>
          <span className="text-blue-300">Pedidos Prontos: 0</span>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 h-8"
          >
            Sair
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-48px)]">
        {/* Painel Lateral Esquerdo - Cinza */}
        <aside className="w-80 bg-gray-300 p-4 flex flex-col">
          {/* Mesa/Comanda Operador */}
          <div className="mb-4">
            <div className="text-sm font-bold text-gray-800 mb-2">Mesa/Comanda Operador[F1]</div>
            <div className="flex items-center mb-2">
              <div className="bg-red-600 text-white px-3 py-1 font-bold">1</div>
              <div className="bg-white text-gray-800 px-3 py-1 border border-gray-400">003</div>
              <div className="bg-white text-gray-800 px-3 py-1 border border-gray-400">CAIXA</div>
            </div>
            
            {/* Lançar Produto */}
            <div className="flex items-center mb-4">
              <Button 
                onClick={handleLaunchProduct}
                className="bg-gray-400 hover:bg-gray-500 text-gray-800 mr-2 flex items-center"
              >
                <Search className="h-4 w-4 mr-1" />
                Lançar pro
              </Button>
            </div>
            
            {/* Código do Produto */}
            <Input
              type="text"
              placeholder="Cód. Produto"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              className="w-full bg-white border border-gray-400 text-gray-800"
            />
          </div>

          {/* Lista de Produtos */}
          <div className="flex-1 bg-white border border-gray-400 mb-4">
            <div className="bg-gray-200 p-2 border-b border-gray-400">
              <div className="text-xs font-bold">Cód. Produto</div>
            </div>
            <div className="p-2 text-xs">
              {selectedTable ? (
                <div>11 CALAFRANGO</div>
              ) : (
                <div className="text-gray-500">Nenhum produto</div>
              )}
            </div>
          </div>

          {/* Total Mesa */}
          <div className="bg-red-600 text-white p-3 mb-4 font-bold text-lg">
            Total Mesa: R$ {selectedTable?.total_amount || 0},00
          </div>

          {/* Botões de Função */}
          <div className="space-y-2">
            <Button 
              onClick={handleReceivePayment}
              className="w-full bg-gray-400 hover:bg-gray-500 text-gray-800 text-sm"
            >
              F2 - Receber
            </Button>
            <Button className="w-full bg-gray-400 hover:bg-gray-500 text-gray-800 text-sm">
              F3 - Encerra Reabrir
            </Button>
            <Button className="w-full bg-gray-400 hover:bg-gray-500 text-gray-800 text-sm">
              F5 - Imprimir
            </Button>
            <Button 
              onClick={() => navigate('/reports')}
              className="w-full bg-gray-400 hover:bg-gray-500 text-gray-800 text-sm"
            >
              F6 - Histórico Pedidos
            </Button>
            <Button className="w-full bg-gray-400 hover:bg-gray-500 text-gray-800 text-sm">
              F7 - Utilitários
            </Button>
            <Button 
              onClick={() => navigate('/balcao')}
              className="w-full bg-gray-400 hover:bg-gray-500 text-gray-800 text-sm"
            >
              F8 - Delivery
            </Button>
            <Button className="w-full bg-gray-400 hover:bg-gray-500 text-gray-800 text-sm">
              F9 - Comandas
            </Button>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm">
              Não impressos
            </Button>
          </div>

          {/* Legenda */}
          <div className="mt-auto text-xs text-gray-700">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-green-500 mr-2"></div>
              Fechado
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-black mr-2"></div>
              Aberto
            </div>
          </div>
        </aside>

        {/* Área Principal - Grade de Mesas */}
        <main className="flex-1 p-4 bg-cyan-100">
          <div className="grid grid-cols-10 gap-2">
            {tables.map((table) => (
              <Button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`
                  h-16 flex flex-col items-center justify-center text-xs font-bold
                  ${table.status === 'livre' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }
                  ${selectedTable?.id === table.id ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <span>{table.number.toString().padStart(2, '0')}</span>
                <span>R$ {table.total_amount.toFixed(2).replace('.', ',')}</span>
              </Button>
            ))}
          </div>
        </main>
      </div>

      {/* Barra Inferior - Estilo Windows */}
      <footer className="flex items-center justify-between bg-gray-700 text-white p-1 text-xs h-6">
        <div className="flex items-center space-x-4">
          <span>🔲</span>
          <span>Links</span>
          <span>Calculadora</span>
          <span>Sites Sugeridos</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>📁</span>
          <span>W</span>
          <span>e</span>
          <span>📁</span>
          <span>▶</span>
          <span>💬</span>
          <span>Disposit...</span>
          <span>CAIXA</span>
          <span>Calcula...</span>
          <span>🖨️</span>
          <span>⏰</span>
          <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </footer>

      {/* Diálogo de Fechamento/Pagamento */}
      {isPaymentDialogOpen && (
        <PaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          selectedTable={selectedTable}
        />
      )}

      {/* Conteúdo das rotas */}
      <Outlet />
    </div>
  )
}

// Componente do Diálogo de Fechamento (exato da imagem)
function PaymentDialog({ onOpenChange, selectedTable }: any) {
  const [paymentMethods, setPaymentMethods] = useState({
    dinheiro: 0,
    debito: 0,
    credito: 0,
    pix: 0,
    prazo: 0,
    online: 0,
    cortesia: 0,
    vale: 0,
    cheque: 0
  })

  const subtotal = selectedTable?.total_amount || 0
  const totalPago = Object.values(paymentMethods).reduce((sum, val) => sum + val, 0)
  const falta = subtotal - totalPago

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-4/5 h-4/5 max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Fechamento</h2>
          <Button onClick={() => onOpenChange(false)} className="bg-red-500 hover:bg-red-600">
            ✕
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 h-full">
          {/* Coluna Esquerda - Resumo */}
          <div className="space-y-2">
            <div className="text-sm">Sub-Total (+): {subtotal.toFixed(2).replace('.', ',')}</div>
            <div className="text-sm">Adiantamento(-): 0,00</div>
            <div className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" />
              Serviços (+): 0,00
            </div>
            <div className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" />
              Couvert (+): 0,00
            </div>
            <div className="text-sm">Desconto (-): 0,00</div>
            <div className="text-sm">Acréscimo (+): 0,00</div>
            <div className="text-sm font-bold">Total a pagar (+): {subtotal.toFixed(2).replace('.', ',')}</div>
          </div>

          {/* Coluna Central - Formas de Pagamento */}
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-6 h-4 bg-green-500 mr-2"></span>
              <span className="text-sm w-20">Dinheiro:</span>
              <Input
                type="number"
                value={paymentMethods.dinheiro}
                onChange={(e) => setPaymentMethods({...paymentMethods, dinheiro: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
            <div className="flex items-center">
              <span className="w-6 h-4 bg-yellow-500 mr-2"></span>
              <span className="text-sm w-20">C. Débito:</span>
              <Input
                type="number"
                value={paymentMethods.debito}
                onChange={(e) => setPaymentMethods({...paymentMethods, debito: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
            <div className="flex items-center">
              <span className="w-6 h-4 bg-blue-500 mr-2"></span>
              <span className="text-sm w-20">C. Crédito:</span>
              <Input
                type="number"
                value={paymentMethods.credito}
                onChange={(e) => setPaymentMethods({...paymentMethods, credito: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
            <div className="flex items-center">
              <span className="w-6 h-4 bg-green-600 mr-2"></span>
              <span className="text-sm w-20">Pix:</span>
              <Input
                type="number"
                value={paymentMethods.pix}
                onChange={(e) => setPaymentMethods({...paymentMethods, pix: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
            <div className="flex items-center">
              <span className="w-6 h-4 bg-pink-500 mr-2"></span>
              <span className="text-sm w-20">Prazo:</span>
              <Input
                type="number"
                value={paymentMethods.prazo}
                onChange={(e) => setPaymentMethods({...paymentMethods, prazo: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
            <div className="flex items-center">
              <span className="w-6 h-4 bg-blue-600 mr-2"></span>
              <span className="text-sm w-20">OnLine:</span>
              <Input
                type="number"
                value={paymentMethods.online}
                onChange={(e) => setPaymentMethods({...paymentMethods, online: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
            <div className="flex items-center">
              <span className="w-6 h-4 bg-purple-500 mr-2"></span>
              <span className="text-sm w-20">Cortesia:</span>
              <Input
                type="number"
                value={paymentMethods.cortesia}
                onChange={(e) => setPaymentMethods({...paymentMethods, cortesia: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
            <div className="flex items-center">
              <span className="w-6 h-4 bg-orange-500 mr-2"></span>
              <span className="text-sm w-20">Vale Ali.:</span>
              <Input
                type="number"
                value={paymentMethods.vale}
                onChange={(e) => setPaymentMethods({...paymentMethods, vale: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
            <div className="flex items-center">
              <span className="w-6 h-4 bg-blue-700 mr-2"></span>
              <span className="text-sm w-20">Cheque:</span>
              <Input
                type="number"
                value={paymentMethods.cheque}
                onChange={(e) => setPaymentMethods({...paymentMethods, cheque: parseFloat(e.target.value) || 0})}
                className="w-20 h-6 text-xs"
              />
            </div>
          </div>

          {/* Coluna Direita - Tabela de Pagamentos */}
          <div>
            <div className="text-sm font-bold mb-2">Pagto. | Recebido | Valor | Troco</div>
            <div className="text-xs text-gray-500">(Tabela vazia por enquanto)</div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between mt-4">
          <div className="flex space-x-2">
            <Button className="bg-green-500 hover:bg-green-600 text-white text-sm">
              Lançar Taxas e Descontos (F4)
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white text-sm">
              Conferir e dividir (F6)
            </Button>
          </div>
        </div>

        {/* Resumo Final */}
        <div className="flex justify-between items-center mt-4 p-2 bg-gray-100">
          <div className="text-sm">
            Total Pago: {totalPago.toFixed(2).replace('.', ',')}
          </div>
          <div className={`text-sm font-bold ${falta > 0 ? 'text-red-600' : 'text-green-600'}`}>
            Falta: {falta.toFixed(2).replace('.', ',')}
          </div>
        </div>

        {/* Botões Finais */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Cancelar(F3)
          </Button>
          <Button 
            onClick={() => {
              if (falta <= 0) {
                alert('Pagamento realizado com sucesso!')
                onOpenChange(false)
              } else {
                alert('Valor insuficiente!')
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Receber(F2)
          </Button>
        </div>
      </div>
    </div>
  )
}
