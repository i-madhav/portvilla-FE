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

const ENTITY_OPTIONS: {
  value: EntityType;
  label: string;
}[] = [
  { value: EntityTypeEnum.Individual, label: 'Individual / Freelancer' },
  { value: EntityTypeEnum.Company, label: 'Company / Startup' },
  { value: EntityTypeEnum.Product, label: 'Product' },
  { value: EntityTypeEnum.Organization, label: 'Organization / Community' },
];

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
      onContinue({ name: name.trim(), entityType, tagline: tagline.trim(), bio: bio.trim() });
    },
    [name, entityType, tagline, bio, canContinue, onContinue],
  );

  function renderField(
    labelText: string,
    required: boolean,
    children: React.ReactNode,
  ) {
    return (
      <div style={fieldGroupStyle('1.125rem')}>
        <label style={labelStyle}>
          {labelText}
          {required && (
            <span style={{ color: COLORS.mutedText, fontSize: '0.65rem', fontWeight: 400 }}>
              {' *'}
            </span>
          )}
          {!required && (
            <span style={{ color: COLORS.mutedText, fontSize: '0.65rem', fontWeight: 400, marginLeft: '0.25rem' }}>
              (optional)
            </span>
          )}
        </label>
        {children}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 style={titleStyle}>Introduce yourself</h1>
      <p style={subtitleStyle}>
        This is what visitors will see first on your profile.
      </p>

      {/* Entity type — select */}
      {renderField('Profile type', true, (
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value as EntityType)}
          style={selectStyle()}
        >
          {ENTITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {/* Name */}
      {renderField(
        entityType === EntityTypeEnum.Individual ? 'Your name' : 'Name / Brand',
        true,
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle(false)}
          placeholder={
            entityType === EntityTypeEnum.Individual ? 'e.g. Jane Doe' : 'e.g. Acme Corp'
          }
          autoFocus
        />,
      )}

      {/* Tagline */}
      {renderField('Tagline', false, (
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          style={inputStyle(false)}
          placeholder="Full-stack engineer · Designer · Creator"
          maxLength={120}
        />
      ))}

      {/* Bio */}
      {renderField('Bio', false, (
        <>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={textareaStyle(false)}
            placeholder="A short professional summary…"
            rows={4}
            maxLength={500}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '0.25rem',
            }}
          >
            <span style={{ color: COLORS.mutedText, fontSize: '0.65rem' }}>
              {bio.length}/500
            </span>
          </div>
        </>
      ))}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginTop: '1.5rem',
        }}
      >
        <button
          type="submit"
          disabled={!canContinue}
          style={primaryButtonStyle(!canContinue)}
        >
          {isSubmitting ? 'Creating your profile…' : 'Create profile'}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          style={ghostButtonStyle(isSubmitting)}
        >
          ← Back
        </button>
      </div>
    </form>
  );
}
