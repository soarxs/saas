// Configuração central da aplicação
export interface AppConfig {
  name: string;
  shortName: string;
  description: string;
  version: string;
  author: string;
  support: {
    email: string;
    phone: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
  };
  features: {
    multiTenant: boolean;
    offlineMode: boolean;
    notifications: boolean;
    printing: boolean;
    reports: boolean;
  };
}

// Configuração da aplicação
export const appConfig: AppConfig = {
  name: 'Protótipo PDV',
  shortName: 'PDV',
  description: 'Sistema de Ponto de Venda para Lanchonetes',
  version: '1.0.0',
  author: 'Saas PDV Team',
  support: {
    email: 'suporte@pdv.com',
    phone: '(11) 99999-9999'
  },
  branding: {
    primaryColor: '#1e40af',
    secondaryColor: '#10b981',
    logo: '/favicon.svg',
    favicon: '/favicon.svg'
  },
  features: {
    multiTenant: false,
    offlineMode: true,
    notifications: true,
    printing: true,
    reports: true
  }
};

// Funções utilitárias para acessar configurações
export const getAppName = (): string => appConfig.name;
export const getAppShortName = (): string => appConfig.shortName;
export const getAppDescription = (): string => appConfig.description;
export const getAppVersion = (): string => appConfig.version;

// Função para obter configuração de branding
export const getBranding = () => appConfig.branding;

// Função para verificar se uma feature está habilitada
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return appConfig.features[feature];
};

// Função para atualizar configuração (útil para multi-tenant)
export const updateAppConfig = (updates: Partial<AppConfig>): void => {
  Object.assign(appConfig, updates);
};

// Função para carregar configuração personalizada (para multi-tenant)
export const loadTenantConfig = (tenantId: string): void => {
  const tenantConfig = localStorage.getItem(`tenant-config-${tenantId}`);
  if (tenantConfig) {
    try {
      const config = JSON.parse(tenantConfig);
      updateAppConfig(config);
    } catch (error) {
      console.error('Erro ao carregar configuração do tenant:', error);
    }
  }
};

// Função para salvar configuração personalizada
export const saveTenantConfig = (tenantId: string, config: Partial<AppConfig>): void => {
  try {
    localStorage.setItem(`tenant-config-${tenantId}`, JSON.stringify(config));
    updateAppConfig(config);
  } catch (error) {
    console.error('Erro ao salvar configuração do tenant:', error);
  }
};

export default appConfig;