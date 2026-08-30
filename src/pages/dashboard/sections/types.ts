import type { ProfileDataResponseDto, UpdateProfilePayload } from '@typings/profileApi';

export interface SectionProps {
  profile: ProfileDataResponseDto;
  /** Persist a partial profile update (PATCH /profiles/me). */
  save: (payload: UpdateProfilePayload) => Promise<void>;
}
