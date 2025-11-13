import { create } from 'zustand';
import { User, Deal, Registry, Contractor, Payment } from '@/types';

interface AppState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Deals
  deals: Deal[];
  setDeals: (deals: Deal[]) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;

  // Registries
  registries: Registry[];
  setRegistries: (registries: Registry[]) => void;
  addRegistry: (registry: Registry) => void;
  updateRegistry: (id: string, registry: Partial<Registry>) => void;

  // Contractors
  contractors: Contractor[];
  setContractors: (contractors: Contractor[]) => void;
  addContractor: (contractor: Contractor) => void;
  updateContractor: (id: string, contractor: Partial<Contractor>) => void;

  // Payments
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
}

export const useStore = create<AppState>((set) => ({
  // Current user
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Deals
  deals: [],
  setDeals: (deals) => set({ deals }),
  addDeal: (deal) => set((state) => ({ deals: [...state.deals, deal] })),
  updateDeal: (id, dealUpdate) => set((state) => ({
    deals: state.deals.map((d) => d.id === id ? { ...d, ...dealUpdate } : d)
  })),

  // Registries
  registries: [],
  setRegistries: (registries) => set({ registries }),
  addRegistry: (registry) => set((state) => ({ registries: [...state.registries, registry] })),
  updateRegistry: (id, registryUpdate) => set((state) => ({
    registries: state.registries.map((r) => r.id === id ? { ...r, ...registryUpdate } : r)
  })),

  // Contractors
  contractors: [],
  setContractors: (contractors) => set({ contractors }),
  addContractor: (contractor) => set((state) => ({ contractors: [...state.contractors, contractor] })),
  updateContractor: (id, contractorUpdate) => set((state) => ({
    contractors: state.contractors.map((c) => c.id === id ? { ...c, ...contractorUpdate } : c)
  })),

  // Payments
  payments: [],
  setPayments: (payments) => set({ payments }),
  updatePayment: (id, paymentUpdate) => set((state) => ({
    payments: state.payments.map((p) => p.id === id ? { ...p, ...paymentUpdate } : p)
  })),
}));
