import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface ProductAddedNotificationProps {
  productName: string;
  isVisible: boolean;
  onComplete: () => void;
}

const ProductAddedNotification = ({ productName, isVisible, onComplete }: ProductAddedNotificationProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onComplete, 300); // Aguarda a animação de saída
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="bg-green-50 border-green-200 shadow-lg">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800 text-sm">Produto Adicionado!</p>
            <p className="text-xs text-green-600 truncate max-w-48">{productName}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAddedNotification;





