import { useState, useCallback } from 'react';
import type { EntityType } from '@typings/profileApi';
import { EntityType as EntityTypeEnum } from '@typings/profileApi';
import {
  titleStyle,
  subtitleStyle,
  labelStyle,
  inputStyle,
  textareaStyle,
  selectStyle,
  fieldGroupStyle,
  primaryButtonStyle,
  ghostButtonStyle,
  COLORS,
} from '../styles';

export interface IdentityStepData {
  name: string;
  entityType: EntityType;
  tagline: string;
  bio: string;
  about: string;
  location: string;
  industry: string;
  availability: string;
}

interface IdentityStepProps {
  initial: IdentityStepData;
  onContinue: (data: IdentityStepData) => void;
  onBack: () => void;
}

const ENTITY_OPTIONS: { value: EntityType; label: string }[] = [
  { value: EntityTypeEnum.Individual, label: 'Individual / Freelancer' },
  { value: EntityTypeEnum.Company, label: 'Company / Startup' },
  { value: EntityTypeEnum.Product, label: 'Product' },
  { value: EntityTypeEnum.Organization, label: 'Organization / Community' },
];

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={fieldGroupStyle('1.125rem')}>
      <label style={labelStyle}>
        {label}
        <span
          style={{
            color: COLORS.mutedText,
            fontSize: '0.65rem',
            fontWeight: 400,
            marginLeft: '0.25rem',
          }}
        >
          {required ? '*' : '(optional)'}
        </span>
      </label>
      {children}
    </div>
  );
}

export function IdentityStep({ initial, onContinue, onBack }: IdentityStepProps) {
  const [data, setData] = useState<IdentityStepData>(initial);

  const set = <K extends keyof IdentityStepData>(key: K, value: IdentityStepData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const canContinue = data.name.trim().length > 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (data.name.trim().length === 0) return;
      onContinue({
        ...data,
        name: data.name.trim(),
        tagline: data.tagline.trim(),
        bio: data.bio.trim(),
        about: data.about.trim(),
        location: data.location.trim(),
        industry: data.industry.trim(),
        availability: data.availability.trim(),
      });
    },
    [data, onContinue],
  );

  const isIndividual = data.entityType === EntityTypeEnum.Individual;

  return (
    <form onSubmit={handleSubmit}>
      <h1 style={titleStyle}>Introduce yourself</h1>
      <p style={subtitleStyle}>
        This is what visitors — and your AI agent — will know about you first.
      </p>

      <Field label="Profile type" required>
        <select
          value={data.entityType}
          onChange={(e) => set('entityType', e.target.value as EntityType)}
          style={selectStyle()}
        >
          {ENTITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={isIndividual ? 'Your name' : 'Name / Brand'} required>
        <input
          type="text"
          required
          value={data.name}
          onChange={(e) => set('name', e.target.value)}
          style={inputStyle(false)}
          placeholder={isIndividual ? 'e.g. Jane Doe' : 'e.g. Acme Corp'}
          autoFocus
        />
      </Field>

      <Field label="Tagline">
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => set('tagline', e.target.value)}
          style={inputStyle(false)}
          placeholder="Full-stack engineer · Designer · Creator"
          maxLength={120}
        />
      </Field>

      <Field label="Bio">
        <textarea
          value={data.bio}
          onChange={(e) => set('bio', e.target.value)}
          style={textareaStyle(false)}
          placeholder="A short professional summary…"
          rows={3}
          maxLength={500}
        />
      </Field>

      <Field label="About">
        <textarea
          value={data.about}
          onChange={(e) => set('about', e.target.value)}
          style={textareaStyle(false)}
          placeholder="A longer story — background, what drives you, what you're building…"
          rows={4}
          maxLength={2000}
        />
      </Field>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <Field label="Location">
            <input
              type="text"
              value={data.location}
              onChange={(e) => set('location', e.target.value)}
              style={inputStyle(false)}
              placeholder="e.g. Berlin, DE"
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Industry">
            <input
              type="text"
              value={data.industry}
              onChange={(e) => set('industry', e.target.value)}
              style={inputStyle(false)}
              placeholder="e.g. Fintech"
            />
          </Field>
        </div>
      </div>

      <Field label="Availability">
        <input
          type="text"
          value={data.availability}
          onChange={(e) => set('availability', e.target.value)}
          style={inputStyle(false)}
          placeholder="e.g. Open to freelance · Hiring · Not available"
        />
      </Field>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginTop: '1.5rem',
        }}
      >
        <button type="submit" disabled={!canContinue} style={primaryButtonStyle(!canContinue)}>
          Continue
        </button>
        <button type="button" onClick={onBack} style={ghostButtonStyle()}>
          ← Back
        </button>
      </div>
    </form>
  );
}
