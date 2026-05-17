import { createContext, type ReactNode,useContext } from 'react';

const RemoteSplatContext = createContext<string | null>(null);

/**
 * Shell `RemotePage` sets the menu-route splat (`app2/*` → `app4/page-b`) so federated
 * remotes can build `<Routes location={...} />` on F5 without relying on `useParams` in the remote bundle.
 */
export function RemoteSplatProvider({
  splat,
  children,
}: {
  splat: string;
  children: ReactNode;
}) {
  return <RemoteSplatContext.Provider value={splat}>{children}</RemoteSplatContext.Provider>;
}

export function useRemoteSplat(): string | null {
  return useContext(RemoteSplatContext);
}
