import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useStore } from '../store/useStore';
import { User } from '../types';
import { Plus, Edit, Trash2, User as UserIcon, Shield, Users, Key } from 'lucide-react';
import { toast } from 'sonner';

const UserManager = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, updateUserPassword } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: 'cashier' as 'admin' | 'cashier',
    password: '',
    confirmPassword: ''
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.name) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    if (formData.password && formData.password.length < 4) {
      toast.error('Senha deve ter pelo menos 4 caracteres');
      return;
    }

    // Verificar se username já existe (exceto para edição do mesmo usuário)
    const usernameExists = users.some(user => 
      user.username === formData.username && user.id !== editingUser?.id
    );
    
    if (usernameExists) {
      toast.error('Nome de usuário já existe');
      return;
    }

    if (editingUser) {
      // Para edição, atualizamos apenas os dados básicos
      const userData = {
        username: formData.username,
        name: formData.name,
        role: formData.role,
      };
      
      updateUser(editingUser.id, userData);
      
      // Se há nova senha, salvamos separadamente no authStore
      if (formData.password) {
        // Aqui chamamos diretamente o authStore para salvar a senha
        const authStore = require('../store/authStore').useAuthStore.getState();
        authStore.updateUserPassword(editingUser.id, formData.password);
      }
      
      toast.success('Usuário atualizado com sucesso');
    } else {
      // Para novo usuário, criamos sem senha no tipo User
      const userData = {
        username: formData.username,
        name: formData.name,
        role: formData.role,
      };
      
      addUser(userData);
      
      // Salvamos a senha separadamente no authStore
      const authStore = require('../store/authStore').useAuthStore.getState();
      const newUserId = Date.now().toString(); // Mesmo ID que será usado no addUser
      authStore.setUserPassword(newUserId, formData.password);
      
      toast.success('Usuário criado com sucesso');
    }

    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ username: '', name: '', role: 'cashier', password: '', confirmPassword: '' });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.password) {
      toast.error('Digite a nova senha');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    if (passwordData.password.length < 4) {
      toast.error('Senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (passwordUser) {
      updateUserPassword(passwordUser.id, passwordData.password);
      toast.success('Senha alterada com sucesso');
      setIsPasswordDialogOpen(false);
      setPasswordUser(null);
      setPasswordData({ password: '', confirmPassword: '' });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setIsDialogOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setPasswordUser(user);
    setPasswordData({ password: '', confirmPassword: '' });
    setIsPasswordDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (currentUser?.id === userId) {
      toast.error('Não é possível excluir o usuário logado');
      return;
    }
    
    deleteUser(userId);
    toast.success('Usuário excluído com sucesso');
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ username: '', name: '', role: 'cashier', password: '', confirmPassword: '' });
  };

  const handlePasswordDialogClose = () => {
    setIsPasswordDialogOpen(false);
    setPasswordUser(null);
    setPasswordData({ password: '', confirmPassword: '' });
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />;
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Operador';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-600">Gerencie usuários do sistema</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Atualize as informações do usuário abaixo.'
                  : 'Preencha as informações para criar um novo usuário.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Digite o nome de usuário"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Função</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: 'admin' | 'cashier') => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashier">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {editingUser ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Digite a senha"
                    required={!editingUser}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirme a senha"
                    required={!editingUser || !!formData.password}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para alterar senha */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>
                Altere a senha do usuário "{passwordUser?.name}".
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordChange}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    placeholder="Digite a nova senha"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirme a nova senha"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handlePasswordDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Alterar Senha
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List - Minimalist Design */}
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="border border-gray-200 hover:border-green-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleIcon(user.role)}
                      <span className="text-xs text-gray-500">{getRoleLabel(user.role)}</span>
                      {currentUser?.id === user.id && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Logado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(user)}
                    className="h-8 w-8 p-0 hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChangePassword(user)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                  >
                    <Key className="h-4 w-4 text-gray-600" />
                  </Button>
                  
                  {currentUser?.id !== user.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-gray-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o usuário "{user.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManager;
