export const SERVICE_TYPES = [
  { value: 'eletrica', label: 'Elétrica', icon: '⚡', color: '#FFB800' },
  { value: 'frio', label: 'Frio e Climatização', icon: '❄️', color: '#00BFFF' },
  { value: 'redes', label: 'Redes', icon: '🌐', color: '#4CAF50' },
  { value: 'cameras', label: 'Câmeras', icon: '📹', color: '#9C27B0' },
  { value: 'hidraulica', label: 'Hidráulica', icon: '💧', color: '#2196F3' },
  { value: 'ar_condicionado', label: 'Ar Condicionado', icon: '🌀', color: '#00BCD4' },
  { value: 'outro', label: 'Outro', icon: '🔧', color: '#757575' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Baixa', color: '#4CAF50' },
  { value: 'medium', label: 'Média', color: '#FF9800' },
  { value: 'high', label: 'Alta', color: '#F44336' },
  { value: 'urgent', label: 'Urgente', color: '#D32F2F' },
];

export const DEFAULT_HOURLY_RATES = {
  eletrica: 5000,
  frio: 6000,
  redes: 4000,
  cameras: 4500,
  hidraulica: 5000,
  ar_condicionado: 5500,
  outro: 4000,
};

export const COLORS = {
  primary: '#2563EB',
  secondary: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export const STORAGE_KEYS = {
  ACTIVITIES: '@multiservice_activities',
  CLIENTS: '@multiservice_clients',
  CURRENT_ACTIVITY: '@multiservice_current_activity',
  SETTINGS: '@multiservice_settings',
};
