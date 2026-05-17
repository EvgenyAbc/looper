import { createContext, type ReactNode,useCallback, useContext, useState } from 'react';

import type { CounterContextValue } from './types';

const CounterContext = createContext<CounterContextValue | null>(null);

function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(0), []);

  return (
    <CounterContext.Provider value={{ count, increment, decrement, reset }}>
      {children}
    </CounterContext.Provider>
  );
}

function useCounter(): CounterContextValue {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error('useCounter must be used within CounterProvider');
  return ctx;
}

export { CounterContext, CounterProvider, useCounter };
export type { CounterContextValue };
