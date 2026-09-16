import { create } from 'zustand';

type Panel = 'none' | 'inventory' | 'evidence' | 'suspects' | 'map';
type Modal = 'none' | 'clue' | 'dialogue' | 'cutscene' | 'accusation' | 'settings';

interface UIStore {
  // Panels & modals
  activePanel: Panel;
  activeModal: Modal;
  modalData: unknown;

  // Transitions
  isTransitioning: boolean;
  transitionType: 'fade' | 'iris' | 'slide';

  // Notifications
  notification: string | null;

  // Actions
  openPanel: (panel: Panel) => void;
  closePanel: () => void;
  togglePanel: (panel: Panel) => void;
  openModal: (modal: Modal, data?: unknown) => void;
  closeModal: () => void;
  startTransition: (type?: 'fade' | 'iris' | 'slide') => void;
  endTransition: () => void;
  showNotification: (message: string, duration?: number) => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activePanel: 'none',
  activeModal: 'none',
  modalData: null,
  isTransitioning: false,
  transitionType: 'fade',
  notification: null,

  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: 'none' }),
  togglePanel: (panel) => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? 'none' : panel });
  },

  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: 'none', modalData: null }),

  startTransition: (type = 'fade') => set({ isTransitioning: true, transitionType: type }),
  endTransition: () => set({ isTransitioning: false }),

  showNotification: (message, duration = 3000) => {
    set({ notification: message });
    setTimeout(() => set({ notification: null }), duration);
  },
  clearNotification: () => set({ notification: null }),
}));
