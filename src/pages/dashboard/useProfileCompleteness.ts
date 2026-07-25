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
 * Scores how ready a profile is, and picks the single next action.
 *
 * This is the dashboard's reason to exist between edits: the old one was seven
 * equally-weighted form cards that never told the owner what was missing or
 * what to do about it.
 */
export function useProfileCompleteness(profile: ProfileDataResponseDto | null): Completeness {
  return useMemo(() => {
    if (!profile) return { percent: 0, items: [], done: 0, total: 0, next: null };

    const id = profile.identity;

    const items: CompletenessItem[] = [
      {
        id: 'name',
        label: 'Add your name',
        rationale: 'Visitors need to know whose page this is.',
        done: !!id.name?.trim(),
        target: 'identity',
        weight: 100,
      },
      {
        id: 'tagline',
        label: 'Write a tagline',
        rationale: 'One line under your name. It is the first thing anyone reads.',
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
        id: 'photo',
        label: 'Add a profile photo',
        rationale: 'Pages with a face read as real. This is the cheapest credibility you can buy.',
        done: !!id.primaryImage,
        target: 'identity',
        weight: 60,
      },
      {
        id: 'skills',
        label: 'List at least 3 skills',
        rationale: 'These are what your agent can actually speak to.',
        done: (profile.capabilities?.length ?? 0) >= 3,
        target: 'capabilities',
        weight: 80,
      },
      {
        id: 'timeline',
        label: 'Add your journey',
        rationale: 'A timeline lets your agent answer "what have they done?" with specifics.',
        done: (profile.timeline?.length ?? 0) >= 1,
        target: 'timeline',
        weight: 65,
      },
      {
        id: 'works',
        label: 'Add a project',
        rationale: 'The thing visitors most want to see. One strong project beats none.',
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
      {
        id: 'ai-key',
        label: 'Connect an AI provider',
        // Deliberately specific. `createLlmProvider` throws
        // "API key not configured" without this, which is what breaks repo
        // summarising — but the voice agent runs on its own worker, so claiming
        // "your agent is broken" here would be false.
        rationale: 'Needed to auto-summarise your repos. Your profile works fine without it.',
        done: profile.aiSettings?.apiKeyConfigured === true,
        target: 'agent',
        weight: 30,
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
