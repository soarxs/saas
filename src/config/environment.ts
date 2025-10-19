// Configuração de ambiente da aplicação
export interface EnvironmentConfig {
  appName: string;
  appShortName: string;
  appDescription: string;
  appVersion: string;
  primaryColor: string;
  secondaryColor: string;
  multiTenant: boolean;
  offlineMode: boolean;
  notifications: boolean;
  printing: boolean;
  reports: boolean;
  supportEmail: string;
  supportPhone: string;
  apiUrl: string;
  apiTimeout: number;
  debug: boolean;
  logLevel: string;
}

// Configuração padrão baseada em variáveis de ambiente ou valores padrão
export const environmentConfig: EnvironmentConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'Saas PDV',
  appShortName: import.meta.env.VITE_APP_SHORT_NAME || 'SaasPDV',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Sistema de Ponto de Venda Multi-tenant',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#10b981',
  secondaryColor: import.meta.env.VITE_SECONDARY_COLOR || '#059669',
  multiTenant: import.meta.env.VITE_MULTI_TENANT === 'true' || true,
  offlineMode: import.meta.env.VITE_OFFLINE_MODE === 'true' || true,
  notifications: import.meta.env.VITE_NOTIFICATIONS === 'true' || true,
  printing: import.meta.env.VITE_PRINTING === 'true' || true,
  reports: import.meta.env.VITE_REPORTS === 'true' || true,
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'suporte@saaspdv.com',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '(11) 99999-9999',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  debug: import.meta.env.VITE_DEBUG === 'true' || false,
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info'
};

// Funções utilitárias para acessar configurações de ambiente
export const getEnvironmentConfig = (): EnvironmentConfig => environmentConfig;

export const isDevelopment = (): boolean => import.meta.env.DEV;
export const isProduction = (): boolean => import.meta.env.PROD;

export const getApiUrl = (): string => environmentConfig.apiUrl;
export const getApiTimeout = (): number => environmentConfig.apiTimeout;

export const isFeatureEnabled = (feature: keyof Pick<EnvironmentConfig, 'multiTenant' | 'offlineMode' | 'notifications' | 'printing' | 'reports'>): boolean => {
  return environmentConfig[feature];
};

export default environmentConfig;
