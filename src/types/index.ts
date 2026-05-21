export type ServiceType = 
  | 'eletrica'
  | 'frio'
  | 'redes'
  | 'cameras'
  | 'hidraulica'
  | 'ar_condicionado'
  | 'outro';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ActivityStatus = 'pending' | 'in_progress' | 'paused' | 'completed';

export interface Pause {
  start: number;
  end?: number;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

export interface Activity {
  id: string;
  technicianId: string;
  clientId?: string;
  clientName?: string;
  serviceType: ServiceType;
  description: string;
  priority: Priority;
  estimatedBudget?: number;
  status: ActivityStatus;
  
  // Timer
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  totalPausedTime: number;
  pauses: Pause[];
  
  // Detalhes finais
  solutions?: string;
  issues?: string;
  materials: Material[];
  photos: string[];
  clientSignature?: string;
  
  // Financeiro
  hourlyRate: number;
  totalCost?: number;
  isPaid: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: number;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  currentActivity?: Activity;
}
