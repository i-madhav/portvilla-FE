import { createContext } from 'react';

export interface DirtyRegistry {
  /** Mark an editor as holding unsaved changes (or clear it). */
  setDirty: (id: string, dirty: boolean) => void;
}

export const DirtyContext = createContext<DirtyRegistry>({ setDirty: () => {} });
