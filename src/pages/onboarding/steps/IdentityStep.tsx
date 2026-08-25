import { useState } from 'react';
import { Button } from '@shared-components/ui';
import type { EntityType } from '@typings/profileApi';
import { EntityType as EntityTypeEnum } from '@typings/profileApi';
import { StepActions } from '../components/StepActions';
import { StepHeader } from '../components/StepHeader';
import type { IdentityStepData } from '../hooks/useOnboardingFlow';
import {
  COLORS,
  inputStyle,
  textareaStyle,
  selectStyle,
  labelStyle,
  fieldGroupStyle,
} from '../styles';

interface IdentityStepProps {
  initial: IdentityStepData;
  onContinue: (data: IdentityStepData) => void;
  busy: boolean;
}

const ENTITY_OPTIONS: { value: EntityType; label: string }[] = [
  { value: EntityTypeEnum.Individual, label: 'Individual / Freelancer' },
  { value: EntityTypeEnum.Company, label: 'Company / Startup' },
  { value: EntityTypeEnum.Product, label: 'Product' },
  { value: EntityTypeEnum.Organization, label: 'Organization / Community' },
];

function Field({
  label,
  htmlFor,
  optional,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={fieldGroupStyle()}>
      <label style={labelStyle} htmlFor={htmlFor}>
        {label}
        {optional && (
          <span style={{ color: COLORS.textMuted, fontWeight: 400, marginLeft: '0.3rem' }}>
            optional
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p style={{ color: COLORS.textMuted, fontSize: '0.73rem', margin: '0.35rem 0 0' }}>{hint}</p>
      )}
    </div>
  );
}

export function IdentityStep({ initial, onContinue, busy }: IdentityStepProps) {
  const [data, setData] = useState<IdentityStepData>(initial);
  // Seven fields at once read as a wall. Only `name` is actually required, so
  // the rest of the long tail stays folded until asked for.
  const [expanded, setExpanded] = useState(
    () => !!(initial.about || initial.location || initial.industry || initial.availability),
  );

  const set = <K extends keyof IdentityStepData>(key: K, value: IdentityStepData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const canContinue = data.name.trim().length > 0 && !busy;
  const isIndividual = data.entityType === EntityTypeEnum.Individual;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canContinue) return;
        onContinue(data);
      }}
    >
      <StepHeader
        title="Give your agent the essentials"
        subtitle="Start with the facts it needs to introduce and represent you accurately. You can add depth later."
      />

      <Field label="This profile is for" htmlFor="pv-entity">
        <select
          id="pv-entity"
          className="pv-field"
          value={data.entityType}
          onChange={(e) => set('entityType', e.target.value as EntityType)}
          style={selectStyle()}
        >
          {ENTITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={isIndividual ? 'Your name' : 'Name'} htmlFor="pv-name">
        <input
          id="pv-name"
          className="pv-field"
          type="text"
          required
          value={data.name}
          onChange={(e) => set('name', e.target.value)}
          style={inputStyle()}
          placeholder={isIndividual ? 'Jane Doe' : 'Acme Corp'}
          autoFocus
        />
      </Field>

      <Field
        label="Tagline"
        htmlFor="pv-tagline"
        optional
        hint="One line your agent can use to explain what you do."
      >
        <input
          id="pv-tagline"
          className="pv-field"
          type="text"
          value={data.tagline}
          onChange={(e) => set('tagline', e.target.value)}
          style={inputStyle()}
          placeholder="Full-stack engineer building developer tools"
          maxLength={120}
        />
      </Field>

      <Field
        label="Short bio"
        htmlFor="pv-bio"
        optional
        hint="Your agent uses this to introduce you. A couple of sentences is plenty."
      >
        <textarea
          id="pv-bio"
          className="pv-field"
          value={data.bio}
          onChange={(e) => set('bio', e.target.value)}
          style={textareaStyle()}
          placeholder="I design and build systems that…"
          rows={3}
          maxLength={500}
        />
      </Field>

      <Button
        type="button"
        variant="ghost"
        size="compact"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? 'Fewer details' : 'Add location, industry, availability'}
      </Button>

      {expanded && (
        <div style={{ marginTop: '1rem' }}>
          <Field label="About" htmlFor="pv-about" optional hint="The longer story, if you want one.">
            <textarea
              id="pv-about"
              className="pv-field"
              value={data.about}
              onChange={(e) => set('about', e.target.value)}
              style={textareaStyle()}
              placeholder="Background, what drives you, what you're building…"
              rows={4}
              maxLength={2000}
            />
          </Field>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 10rem', minWidth: 0 }}>
              <Field label="Location" htmlFor="pv-location" optional>
                <input
                  id="pv-location"
                  className="pv-field"
                  type="text"
                  value={data.location}
                  onChange={(e) => set('location', e.target.value)}
                  style={inputStyle()}
                  placeholder="Berlin, DE"
                />
              </Field>
            </div>
            <div style={{ flex: '1 1 10rem', minWidth: 0 }}>
              <Field label="Industry" htmlFor="pv-industry" optional>
                <input
                  id="pv-industry"
                  className="pv-field"
                  type="text"
                  value={data.industry}
                  onChange={(e) => set('industry', e.target.value)}
                  style={inputStyle()}
                  placeholder="Fintech"
                />
              </Field>
            </div>
          </div>

          <Field
            label="Availability"
            htmlFor="pv-availability"
            optional
            hint="Shown as a badge on your profile."
          >
            <input
              id="pv-availability"
              className="pv-field"
              type="text"
              value={data.availability}
              onChange={(e) => set('availability', e.target.value)}
              style={inputStyle()}
              placeholder="Open to freelance"
            />
          </Field>
        </div>
      )}

      <StepActions
        continueLabel="Save core context"
        disabled={!canContinue}
        busy={busy}
        disabledHint="Add your name to continue."
      />

      {/* The point where this stops being a draft and starts saving to the
          agent's knowledge record. Visibility may still be private. */}
      <p style={{ color: COLORS.textMuted, fontSize: '0.73rem', margin: '0.75rem 0 0', textAlign: 'center' }}>
        Your agent’s knowledge record starts here. Every later step saves as you go.
      </p>
    </form>
  );
}
