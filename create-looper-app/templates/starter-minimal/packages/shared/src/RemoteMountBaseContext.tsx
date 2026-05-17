import { createContext, type ReactNode,useContext } from 'react';

const RemoteMountBaseContext = createContext<string | null>(null);

/** Supplies splat mount prefix for MF embeds whose Routes live inside the remote bundle. */
export function RemoteMountBaseProvider({
  base,
  children,
}: {
  base: string;
  children: ReactNode;
}) {
  return (
    <RemoteMountBaseContext.Provider value={base}>{children}</RemoteMountBaseContext.Provider>
  );
}

export function useRemoteMountBase(): string | null {
  return useContext(RemoteMountBaseContext);
}
