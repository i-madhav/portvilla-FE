import { useMemo } from 'react';
import type { ProfileDataResponseDto } from '@typings/profileApi';

export interface CompletenessItem {
  id: string;
  label: string;
  /** Why this is worth doing — shown on the next action, not on every row. */
  rationale: string;
  done: boolean;
  /** Section id to scroll to when the user acts on it. */
  target: string;
  /** Higher wins when choosing the single next action. */
  weight: number;
}

export interface Completeness {
  percent: number;
  items: CompletenessItem[];
  done: number;
  total: number;
  /** The one thing most worth doing next, or null when everything is done. */
  next: CompletenessItem | null;
}

/**
 * Scores how ready the agent's grounding context is, and picks the single next
 * action. Visual page polish and optional content-automation credentials do not
 * count toward voice-agent readiness.
 *
 * This is the dashboard's reason to exist between edits: the old one was seven
 * equally-weighted form cards that never told the owner what was missing or
 * what to do about it.
 */
export function useProfileCompleteness(profile: ProfileDataResponseDto | null): Completeness {
  return useMemo(() => {
    if (!profile) return { percent: 0, items: [], done: 0, total: 0, next: null };

    const id = profile.identity;
    const isIndividual = id.entityType === 'individual';
    const capabilityLabel = id.entityType === 'product'
      ? 'Add at least 3 features'
      : isIndividual
        ? 'List at least 3 skills'
        : 'Add at least 3 capabilities';
    const workLabel = id.entityType === 'company'
      ? 'Add a product or case study'
      : id.entityType === 'product'
        ? 'Add a product story'
        : 'Add a project or work sample';

    const items: CompletenessItem[] = [
      {
        id: 'name',
        label: 'Add your name',
        rationale: 'Your representative must say clearly who it represents.',
        done: !!id.name?.trim(),
        target: 'identity',
        weight: 100,
      },
      {
        id: 'tagline',
        label: 'Explain what you do',
        rationale: 'A clear one-line role gives the agent a direct opening answer.',
        done: !!id.tagline?.trim(),
        target: 'identity',
        weight: 70,
      },
      {
        id: 'bio',
        label: 'Write a short bio',
        rationale: 'Your agent leans on this to introduce you. Without it, answers stay generic.',
        done: !!id.bio?.trim(),
        target: 'identity',
        weight: 85,
      },
      {
        id: 'skills',
        label: capabilityLabel,
        rationale: 'These are the concrete strengths your agent can speak to.',
        done: (profile.capabilities?.length ?? 0) >= 3,
        target: 'capabilities',
        weight: 80,
      },
      {
        id: 'timeline',
        label: isIndividual ? 'Add your experience' : 'Add a milestone',
        rationale: isIndividual
          ? 'Dates, roles and organizations let the agent answer career questions with specifics.'
          : 'A dated milestone gives the agent a credible story about progress over time.',
        done: (profile.timeline?.length ?? 0) >= 1,
        target: 'timeline',
        weight: 65,
      },
      {
        id: 'works',
        label: workLabel,
        rationale: 'One concrete example lets the agent support claims with evidence.',
        done: (profile.works?.length ?? 0) >= 1,
        target: 'works',
        weight: 90,
      },
      {
        id: 'contact',
        label: 'Add a way to reach you',
        rationale: 'A visitor convinced by your agent needs somewhere to go next.',
        done: (profile.social?.links?.length ?? 0) > 0 || !!profile.social?.email,
        target: 'social',
        weight: 75,
      },
    ];

    const done = items.filter((i) => i.done).length;
    const percent = Math.round((done / items.length) * 100);

    const next =
      items
        .filter((i) => !i.done)
        .sort((a, b) => b.weight - a.weight)[0] ?? null;

    return { percent, items, done, total: items.length, next };
  }, [profile]);
}
