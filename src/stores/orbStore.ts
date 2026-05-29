import { create } from 'zustand'

type OrbState = 'idle' | 'listening' | 'processing' | 'response'

interface OrbStore {
  state: OrbState
  setState: (state: OrbState) => void
}

export const useOrbStore = create<OrbStore>((set) => ({
  state: 'idle',
  setState: (state) => set({ state }),
}))
