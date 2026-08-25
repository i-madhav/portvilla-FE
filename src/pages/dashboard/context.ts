import { useOutletContext } from 'react-router-dom';
import type { ProfileDataResponseDto, UpdateProfilePayload } from '@typings/profileApi';
import type { useProfileCompleteness } from './hooks/useProfileCompleteness';

/** Everything the dashboard shell resolves once and shares with every view. */
export interface DashboardContext {
  profile: ProfileDataResponseDto;
  completeness: ReturnType<typeof useProfileCompleteness>;
  enabled: boolean;
  save: (payload: UpdateProfilePayload) => Promise<void>;
  /** Open a knowledge section by id, from anywhere in the dashboard. */
  jumpToKnowledge: (section: string) => void;
}

export function useDashboard() {
  return useOutletContext<DashboardContext>();
}
