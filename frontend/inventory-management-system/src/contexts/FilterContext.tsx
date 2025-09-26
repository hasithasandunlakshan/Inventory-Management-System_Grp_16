'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';

export interface FilterState {
  timeRange: string;
  fromDate: string;
  toDate: string;
}

interface FilterContextType {
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: string) => void;
  getDateRange: () => { startDate: string; endDate: string };
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { readonly children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'last30',
    fromDate: '',
    toDate: '',
  });

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const getDateRange = useCallback(() => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (filters.timeRange) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'last7':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(today);
        break;
      case 'last30':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date(today);
        break;
      case 'thisq': {
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today);
        break;
      }
      case 'thisy':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today);
        break;
      default:
        if (filters.fromDate && filters.toDate) {
          startDate = new Date(filters.fromDate);
          endDate = new Date(filters.toDate);
        }
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }, [filters.timeRange, filters.fromDate, filters.toDate]);

  const contextValue = useMemo(
    () => ({
      filters,
      updateFilter,
      getDateRange,
    }),
    [filters, updateFilter, getDateRange]
  );

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
