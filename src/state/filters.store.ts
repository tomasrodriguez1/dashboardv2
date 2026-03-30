/**
 * Store global de filtros usando Zustand.
 * Incluye persistencia en sessionStorage.
 */

import { create } from 'zustand';
import { DEFAULT_TOP_N_CLIENTES } from '@domain/thresholds';

// ===========================
// Tipos del store
// ===========================

export interface FiltersState {
  pais: 'Ambos' | 'Chile' | 'Peru';
  categorias: string[];
  topN: number;
  cliente: string | 'Todos';
  equipo: string | 'Todos';
  repuesto: string | 'Todos';
  horizonte: '30d' | '90d' | '180d';
  estadoMantencion: 'Todos' | 'pendiente' | 'completada' | 'atrasada';
}

export interface FiltersActions {
  setPais: (pais: 'Ambos' | 'Chile' | 'Peru') => void;
  setCategorias: (categorias: string[]) => void;
  setTopN: (topN: number) => void;
  setCliente: (cliente: string | 'Todos') => void;
  setEquipo: (equipo: string | 'Todos') => void;
  setRepuesto: (repuesto: string | 'Todos') => void;
  setHorizonte: (horizonte: '30d' | '90d' | '180d') => void;
  setEstadoMantencion: (estadoMantencion: 'Todos' | 'pendiente' | 'completada' | 'atrasada') => void;
  resetFilters: () => void;
  toggleCategoria: (categoria: string) => void;
}

export type FiltersStore = FiltersState & FiltersActions;

// ===========================
// Estado inicial
// ===========================

const initialState: FiltersState = {
  pais: 'Ambos',
  categorias: [],
  topN: DEFAULT_TOP_N_CLIENTES,
  cliente: 'Todos',
  equipo: 'Todos',
  repuesto: 'Todos',
  horizonte: '90d',
  estadoMantencion: 'Todos',
};

// ===========================
// Clave para sessionStorage
// ===========================

const STORAGE_KEY = 'dashboard_filters';

// ===========================
// Funciones de persistencia
// ===========================

function loadFiltersFromStorage(): Partial<FiltersState> {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return {};
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error cargando filtros desde sessionStorage:', error);
  }

  return {};
}

function saveFiltersToStorage(state: FiltersState): void {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error guardando filtros en sessionStorage:', error);
  }
}

// ===========================
// Store de Zustand
// ===========================

export const useFiltersStore = create<FiltersStore>((set, get) => {
  // Cargar estado inicial desde sessionStorage
  const storedState = loadFiltersFromStorage();
  const mergedInitialState = { ...initialState, ...storedState };

  return {
    ...mergedInitialState,

    setPais: (pais) => {
      set({ pais });
      saveFiltersToStorage(get());
    },

    setCategorias: (categorias) => {
      set({ categorias });
      saveFiltersToStorage(get());
    },

    setTopN: (topN) => {
      set({ topN });
      saveFiltersToStorage(get());
    },

    setCliente: (cliente) => {
      set({ cliente, equipo: 'Todos', repuesto: 'Todos' }); // Reset equipo y repuesto al cambiar cliente
      saveFiltersToStorage(get());
    },

    setEquipo: (equipo) => {
      set({ equipo, repuesto: 'Todos' }); // Reset repuesto al cambiar equipo
      saveFiltersToStorage(get());
    },

    setRepuesto: (repuesto) => {
      set({ repuesto });
      saveFiltersToStorage(get());
    },

    setHorizonte: (horizonte) => {
      set({ horizonte });
      saveFiltersToStorage(get());
    },

    setEstadoMantencion: (estadoMantencion) => {
      set({ estadoMantencion });
      saveFiltersToStorage(get());
    },

    resetFilters: () => {
      set(initialState);
      saveFiltersToStorage(initialState);
    },

    toggleCategoria: (categoria) => {
      const { categorias } = get();
      const newCategorias = categorias.includes(categoria)
        ? categorias.filter(c => c !== categoria)
        : [...categorias, categoria];
      
      set({ categorias: newCategorias });
      saveFiltersToStorage(get());
    },
  };
});

// ===========================
// Selectores útiles
// ===========================

/**
 * Hook para obtener solo el estado de filtros (sin acciones).
 */
export function useFilters(): FiltersState {
  return useFiltersStore(state => ({
    pais: state.pais,
    categorias: state.categorias,
    topN: state.topN,
    cliente: state.cliente,
    equipo: state.equipo,
    repuesto: state.repuesto,
    horizonte: state.horizonte,
    estadoMantencion: state.estadoMantencion,
  }));
}

/**
 * Hook para obtener solo las acciones.
 */
export function useFiltersActions(): FiltersActions {
  return useFiltersStore(state => ({
    setPais: state.setPais,
    setCategorias: state.setCategorias,
    setTopN: state.setTopN,
    setCliente: state.setCliente,
    setEquipo: state.setEquipo,
    setRepuesto: state.setRepuesto,
    setHorizonte: state.setHorizonte,
    setEstadoMantencion: state.setEstadoMantencion,
    resetFilters: state.resetFilters,
    toggleCategoria: state.toggleCategoria,
  }));
}
