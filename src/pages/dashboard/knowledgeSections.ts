import type { EntityType, ProfileDataResponseDto } from '@typings/profileApi';
import type { Completeness } from './hooks/useProfileCompleteness';
import type { ExtraSectionId } from './sections/ExtraSections';

export const KNOWLEDGE_SECTION_IDS = [
  'identity',
  'capabilities',
  'timeline',
  'works',
  'more',
  'social',
  'displays',
] as const;

export type KnowledgeSectionId = (typeof KNOWLEDGE_SECTION_IDS)[number];

export const DEFAULT_KNOWLEDGE_SECTION: KnowledgeSectionId = 'identity';

export function isKnowledgeSectionId(value: string | undefined): value is KnowledgeSectionId {
  return !!value && (KNOWLEDGE_SECTION_IDS as readonly string[]).includes(value);
}

const ENTITY_COPY: Record<EntityType, {
  noun: string;
  identity: string;
  capabilities: string;
  timeline: string;
  works: string;
}> = {
  individual: { noun: 'individual', identity: 'About you', capabilities: 'Expertise', timeline: 'Experience', works: 'Work' },
  company: { noun: 'company', identity: 'Company profile', capabilities: 'Capabilities', timeline: 'Milestones', works: 'Products & work' },
  product: { noun: 'product', identity: 'Product profile', capabilities: 'Features', timeline: 'Releases', works: 'Stories & use cases' },
  organization: { noun: 'organization', identity: 'Organization', capabilities: 'Capabilities', timeline: 'Milestones', works: 'Work & initiatives' },
};

export function entityCopy(profile: ProfileDataResponseDto) {
  return ENTITY_COPY[profile.identity.entityType];
}

/** Which of the optional schema sections make sense for this entity type. */
export function visibleExtraSections(profile: ProfileDataResponseDto): ExtraSectionId[] {
  const type = profile.identity.entityType;
  return type === 'company' || type === 'organization'
    ? ['offerings', 'metrics', 'testimonials', 'team', 'content', 'media']
    : ['offerings', 'metrics', 'testimonials', 'content', 'media'];
}

export interface KnowledgeSection {
  id: KnowledgeSectionId;
  label: string;
  /** Sentence shown under the section heading. */
  description: string;
  /** True when a completeness item pointing at this section is unfinished. */
  needsAttention: boolean;
}

/**
 * The knowledge sections, in the order they appear in the rail. Labels follow
 * the entity type, and the attention dot is derived from the same completeness
 * items the Overview scores, so the two can never disagree.
 */
export function knowledgeSections(
  profile: ProfileDataResponseDto,
  completeness: Completeness,
): KnowledgeSection[] {
  const entity = entityCopy(profile);
  const incomplete = new Set(
    completeness.items.filter((item) => !item.done).map((item) => item.target),
  );

  const base: Array<{ id: KnowledgeSectionId; label: string; description: string }> = [
    { id: 'identity', label: entity.identity, description: `Who your agent says this ${entity.noun} is.` },
    { id: 'capabilities', label: entity.capabilities, description: 'The concrete strengths your agent can speak to.' },
    { id: 'timeline', label: entity.timeline, description: 'Dated history the agent can answer questions about.' },
    { id: 'works', label: entity.works, description: 'Evidence the agent can point to when asked for examples.' },
    { id: 'more', label: 'Proof & media', description: 'Offerings, metrics, testimonials and supporting media.' },
    { id: 'social', label: 'Contact', description: 'Where a convinced visitor should go next.' },
    { id: 'displays', label: 'Visitor displays', description: 'How this knowledge is presented during a conversation.' },
  ];

  return base.map((section) => ({ ...section, needsAttention: incomplete.has(section.id) }));
}
