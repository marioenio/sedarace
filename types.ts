
export enum Manager {
  Ana = 'Ana',
  Mario = 'Mário',
  Leticia = 'Letícia'
}

export type CourseModality = 'Standard' | 'Premium' | 'Elite' | 'Barganha';
export type City = 'Dublin' | 'Cork';
export type PaymentMethod = 'Cartão' | 'Financiamento' | 'Transferência' | 'Boleto';

export interface Sale {
  id: string;
  date: string;
  sellerId: string;
  sellerName: string;
  clientName: string;      // Novo: Nome do cliente
  quoteNumber: string;     // Novo: Número da cotação
  city: City;
  shift: 'Manhã' | 'Tarde';
  modality: CourseModality;
  isRenewal: boolean;        // Se é renovação ou novo curso
  packageTotalValue: number;  // Valor total pago pelo aluno
  servicesAmount: number;     // Valor dos serviços (Padrão 420€: Learner Protection, Exame, Seguro, Livro)
  accommodationAmount: number; // Valor da acomodação
  tuitionAmount: number;      // Calculado: Total - Serviços - Acomodação
  paymentMethod: PaymentMethod;
  isEligible: boolean;
  points: number;
  bonusEuro: number;           // Bonificação em dinheiro
}

export interface Seller {
  id: string;
  name: string;
  manager: Manager;
  city: City;
}

export interface RaceStats {
  totalPoints: number;
  totalSales: number;
  totalTuition: number;
  totalAccommodation: number;
  totalServices: number;
  totalBonus: number;
  avgTicketTuition: number;
}
