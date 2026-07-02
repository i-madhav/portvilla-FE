import { useState, useCallback } from 'react';
import type { EntityType } from '@typings/profileApi';
import {
  EntityType as EntityTypeEnum,
} from '@typings/profileApi';
import {
  titleStyle,
  subtitleStyle,
  labelStyle,
  inputStyle,
  textareaStyle,
  selectStyle,
  buttonStyle,
} from '../styles';

// ─── Entity type display labels ──────────────────────────────────────────────

const ENTITY_LABELS: Record<EntityType, string> = {
  [EntityTypeEnum.Individual]: 'Individual / Freelancer',
  [EntityTypeEnum.Company]: 'Company / Startup',
  [EntityTypeEnum.Product]: 'Product',
  [EntityTypeEnum.Organization]: 'Organization / Community',
};

interface IdentityStepProps {
  initialName: string;
  initialEntityType: EntityType;
  initialTagline: string;
  initialBio: string;
  onContinue: (data: {
    name: string;
    entityType: EntityType;
    tagline: string;
    bio: string;
  }) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function IdentityStep({
  initialName,
  initialEntityType,
  initialTagline,
  initialBio,
  onContinue,
  onBack,
  isSubmitting,
}: IdentityStepProps) {
  const [name, setName] = useState(initialName);
  const [entityType, setEntityType] = useState<EntityType>(initialEntityType);
  const [tagline, setTagline] = useState(initialTagline);
  const [bio, setBio] = useState(initialBio);

  const canContinue = name.trim().length > 0 && !isSubmitting;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canContinue) return;

      onContinue({
        name: name.trim(),
        entityType,
        tagline: tagline.trim(),
        bio: bio.trim(),
      });
    },
    [name, entityType, tagline, bio, canContinue, onContinue],
  );

  return (
    <form onSubmit={handleSubmit}>
      <h1 style={titleStyle}>Tell us about yourself</h1>
      <p style={subtitleStyle}>
        This information will appear on your public profile.
      </p>

      {/* Entity type */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Profile type</label>
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value as EntityType)}
          style={selectStyle()}
        >
          {Object.entries(ENTITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>
          {entityType === EntityTypeEnum.Individual ? 'Your name' : 'Name / Brand name'}
          <span style={{ color: '#618764', fontSize: '0.65rem' }}> *</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle(false)}
          placeholder={
            entityType === EntityTypeEnum.Individual
              ? 'Jane Doe'
              : 'Acme Corp'
          }
          autoFocus
        />
      </div>

      {/* Tagline */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>
          Tagline{' '}
          <span style={{ color: '#618764', fontSize: '0.65rem' }}>(optional)</span>
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          style={inputStyle(false)}
          placeholder="Full-stack engineer · Designer · Creator"
          maxLength={120}
        />
      </div>

      {/* Bio */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          Bio{' '}
          <span style={{ color: '#618764', fontSize: '0.65rem' }}>(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={textareaStyle(false)}
          placeholder="A short professional summary…"
          rows={4}
          maxLength={500}
        />
        <span
          style={{
            color: '#618764',
            fontSize: '0.65rem',
            display: 'block',
            textAlign: 'right',
            marginTop: '0.125rem',
          }}
        >
          {bio.length}/500
        </span>
      </div>

      <button
        type="submit"
        disabled={!canContinue}
        style={buttonStyle(!canContinue)}
      >
        {isSubmitting ? 'Creating profile…' : 'Create profile'}
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#618764',
          fontSize: '0.75rem',
          cursor: 'pointer',
          display: 'block',
          margin: '0.75rem auto 0',
          textDecoration: 'underline',
        }}
      >
        ← Back
      </button>
    </form>
  );
}
