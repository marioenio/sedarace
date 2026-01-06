
import { Manager, Seller, Sale } from './types';

export const INITIAL_SELLERS: Seller[] = [
  // Time Leticia
  { id: 'L1', name: 'Cristiane Olivo', manager: Manager.Leticia, city: 'Dublin' },
  { id: 'L2', name: 'Felipe Frade', manager: Manager.Leticia, city: 'Dublin' },
  { id: 'L3', name: 'Yeza Costa Barros', manager: Manager.Leticia, city: 'Dublin' },
  { id: 'L4', name: 'Maria Ferrari', manager: Manager.Leticia, city: 'Dublin' },
  { id: 'L5', name: 'Graziela Rodrigues', manager: Manager.Leticia, city: 'Dublin' },
  { id: 'L6', name: 'Amanda Bezerra', manager: Manager.Leticia, city: 'Cork' },
  { id: 'L7', name: 'Edson Venicio', manager: Manager.Leticia, city: 'Cork' },
  { id: 'L8', name: 'Hugo Santos', manager: Manager.Leticia, city: 'Cork' },
  { id: 'L9', name: 'Naiara da Fonseca', manager: Manager.Leticia, city: 'Dublin' },
  { id: 'L10', name: 'Yhago Freitas', manager: Manager.Leticia, city: 'Dublin' },
  { id: 'L11', name: 'Paulo Alexandre', manager: Manager.Leticia, city: 'Dublin' },
  
  // Time Ana
  { id: 'A1', name: 'Rafael Felix', manager: Manager.Ana, city: 'Dublin' },
  { id: 'A2', name: 'Barbara Raskovisch', manager: Manager.Ana, city: 'Dublin' },
  { id: 'A3', name: 'Gabriela Ducatti', manager: Manager.Ana, city: 'Dublin' },
  { id: 'A4', name: 'Andressa Santos', manager: Manager.Ana, city: 'Dublin' },
  { id: 'A5', name: 'Amanda Félix Barbosa', manager: Manager.Ana, city: 'Dublin' },
  { id: 'A6', name: 'Iury Lima', manager: Manager.Ana, city: 'Dublin' },
  { id: 'A7', name: 'Paloma Freitas', manager: Manager.Ana, city: 'Dublin' },
  
  // Time Mário
  { id: 'M1', name: 'Felippe Teixeira', manager: Manager.Mario, city: 'Dublin' },
  { id: 'M2', name: 'Ana Domingues', manager: Manager.Mario, city: 'Dublin' },
  { id: 'M3', name: 'Caio Oliveira', manager: Manager.Mario, city: 'Dublin' },
  { id: 'M4', name: 'Priscilla Frade', manager: Manager.Mario, city: 'Dublin' },
  { id: 'M5', name: 'Henrique Sábio', manager: Manager.Mario, city: 'Dublin' },
  { id: 'M6', name: 'Denise Lange', manager: Manager.Mario, city: 'Dublin' },
];

export const INITIAL_SALES: Sale[] = [
  { 
    id: 's1', date: '2024-05-10', sellerId: 'A1', sellerName: 'Rafael Felix', clientName: 'João Goulart', quoteNumber: 'QT-2024-001',
    city: 'Dublin', shift: 'Manhã', modality: 'Elite', isRenewal: false,
    packageTotalValue: 4820, servicesAmount: 420, accommodationAmount: 1200, tuitionAmount: 3200, 
    paymentMethod: 'Transferência', isEligible: true, points: 177.77, bonusEuro: 65 
  },
  { 
    id: 's2', date: '2024-05-11', sellerId: 'L2', sellerName: 'Felipe Frade', clientName: 'Maria Alice', quoteNumber: 'QT-2024-042',
    city: 'Dublin', shift: 'Tarde', modality: 'Premium', isRenewal: true,
    packageTotalValue: 3120, servicesAmount: 420, accommodationAmount: 0, tuitionAmount: 2700, 
    paymentMethod: 'Boleto', isEligible: true, points: 24, bonusEuro: 0 
  },
  { 
    id: 's3', date: '2024-05-12', sellerId: 'L9', sellerName: 'Naiara da Fonseca', clientName: 'Carlos Eduardo', quoteNumber: 'QT-2024-088',
    city: 'Dublin', shift: 'Manhã', modality: 'Elite', isRenewal: false,
    packageTotalValue: 4240, servicesAmount: 420, accommodationAmount: 820, tuitionAmount: 3000, 
    paymentMethod: 'Cartão', isEligible: true, points: 166.66, bonusEuro: 70 
  }
];
