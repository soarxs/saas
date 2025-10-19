
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '../types';

interface QuickPaymentButtonsProps {
  onPaymentSelect: (method: PaymentMethod) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
}

const QuickPaymentButtons = ({ onPaymentSelect, onKeyDown, className = "" }: QuickPaymentButtonsProps) => {
  const paymentMethods: Array<{key: PaymentMethod, label: string, gradient: string, shortcut: string, icon: string}> = [
    { key: 'dinheiro', label: 'Dinheiro', gradient: 'from-green-500 to-green-600', shortcut: '1', icon: '💰' },
    { key: 'debito', label: 'Débito', gradient: 'from-blue-500 to-blue-600', shortcut: '2', icon: '💳' },
    { key: 'credito', label: 'Crédito', gradient: 'from-purple-500 to-purple-600', shortcut: '3', icon: '💳' },
    { key: 'pix', label: 'PIX', gradient: 'from-teal-500 to-teal-600', shortcut: '4', icon: '📱' },
    { key: 'cortesia', label: 'Cortesia', gradient: 'from-orange-500 to-orange-600', shortcut: '5', icon: '🎁' }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`} onKeyDown={onKeyDown}>
      {paymentMethods.map((method) => (
        <Button
          key={method.key}
          onClick={() => onPaymentSelect(method.key)}
          className={`bg-gradient-to-r ${method.gradient} text-white h-20 text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
        >
          <div className="text-center z-10 relative">
            <div className="text-2xl mb-1">{method.icon}</div>
            <div className="text-sm font-bold">{method.label}</div>
            <div className="text-xs opacity-75 bg-white bg-opacity-20 rounded-full px-2 py-1 mt-1">
              [{method.shortcut}]
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
        </Button>
      ))}
    </div>
  );
};

export default QuickPaymentButtons;
