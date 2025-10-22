import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function getTableStatusColor(status: string): string {
  switch (status) {
    case 'livre':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'ocupada':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'aguardando':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'pronto':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getTableStatusText(status: string): string {
  switch (status) {
    case 'livre':
      return 'Livre'
    case 'ocupada':
      return 'Ocupada'
    case 'aguardando':
      return 'Aguardando'
    case 'pronto':
      return 'Pronto'
    default:
      return 'Desconhecido'
  }
}


export function generateTableNumbers(count: number = 50): number[] {
  return Array.from({ length: count }, (_, i) => i + 1)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateReceiptNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  
  return `${year}${month}${day}${hour}${minute}${second}`
}
