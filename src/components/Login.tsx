
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '../store/useStore';
import { User } from '../types';
import { 
  ChefHat, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  Lock, 
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getAppName } from '../config/app';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Auto-focus no campo de usuário
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  // Demo users with passwords
  const defaultUsers: (User & { password: string })[] = [
    { id: '1', username: 'admin', name: 'Administrador', role: 'admin', password: 'admin123' },
    { id: '2', username: 'caixa', name: 'Caixa', role: 'cashier', password: 'caixa123' },
  ];

  const validateForm = () => {
    let isValid = true;
    setUsernameError('');
    setPasswordError('');

    if (!username.trim()) {
      setUsernameError('Usuário é obrigatório');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      return;
    }

    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = defaultUsers.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      toast.success(`Bem-vindo, ${user.name}!`);
    } else {
      toast.error('Usuário ou senha incorretos');
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }

    setLoading(false);
  };


  // Navegação com Enter
  const handleUsernameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      passwordRef.current?.focus();
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e as any);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4 overflow-hidden">
      {/* Login Card - Centralizado */}
      <div className={`w-full max-w-[420px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 ${isAnimating ? 'animate-pulse' : ''}`}>
        <div className="p-12">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{getAppName()}</h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                ref={usernameRef}
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                }}
                onKeyPress={handleUsernameKeyPress}
                className={`h-13 pl-12 pr-4 text-base border border-gray-200 rounded-lg transition-all duration-200 ${
                  usernameError 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'focus:border-green-500 focus:ring-2 focus:ring-green-100'
                }`}
                required
              />
            </div>
            {usernameError && (
              <p className="text-sm text-red-600 ml-1">{usernameError}</p>
            )}
            
            {/* Password field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyPress={handlePasswordKeyPress}
                className={`h-13 pl-12 pr-12 text-base border border-gray-200 rounded-lg transition-all duration-200 ${
                  passwordError 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                    : 'focus:border-green-500 focus:ring-2 focus:ring-green-100'
                }`}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-11 w-11 p-0 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-600 ml-1">{passwordError}</p>
            )}
            
            {/* Login button */}
            <Button 
              type="submit" 
              className="w-full h-13 bg-green-500 hover:bg-green-600 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          
          {/* Demo info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              <span className="font-medium">Acesso de demonstração:</span><br />
              admin/admin123 ou caixa/caixa123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
