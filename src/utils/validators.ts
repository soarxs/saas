// Utilitários de validação

/**
 * Valida se um valor é um número válido
 */
export const isValidNumber = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Valida se um valor é um número positivo
 */
export const isPositiveNumber = (value: any): boolean => {
  return isValidNumber(value) && parseFloat(value) > 0;
};

/**
 * Valida se um valor é um número não negativo
 */
export const isNonNegativeNumber = (value: any): boolean => {
  return isValidNumber(value) && parseFloat(value) >= 0;
};

/**
 * Valida se um email é válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se uma string não está vazia
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida se um código de produto é válido (1-28)
 */
export const isValidProductCode = (code: string | number): boolean => {
  const num = parseInt(code.toString());
  return num >= 1 && num <= 28;
};

/**
 * Valida se um número de mesa é válido (0-20, onde 0 é balcão)
 */
export const isValidTableNumber = (tableNumber: number): boolean => {
  return tableNumber >= 0 && tableNumber <= 20;
};

/**
 * Valida se um método de pagamento é válido
 */
export const isValidPaymentMethod = (method: string): boolean => {
  const validMethods = ['dinheiro', 'debito', 'credito', 'pix', 'cortesia'];
  return validMethods.includes(method);
};

/**
 * Valida se um turno está ativo
 */
export const isActiveShift = (shift: any): boolean => {
  return shift && shift.isActive && !shift.endTime;
};
