import { useState } from 'react';
import type { SocialDto } from '@typings/profileApi';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import {
  titleStyle,
  subtitleStyle,
  labelStyle,
  inputStyle,
  primaryButtonStyle,
  ghostButtonStyle,
} from '../styles';

type SocialLink = SocialDto['links'][number];

interface ContactStepProps {
  initial: SocialDto;
  onSubmit: (social: SocialDto) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const makeEmptyLink = (): SocialLink => ({ platform: '', url: '', label: null });

const miniLabel = { ...labelStyle, fontSize: '0.68rem', marginBottom: '0.25rem' };

export function ContactStep({ initial, onSubmit, onBack, isSubmitting }: ContactStepProps) {
  const [links, setLinks] = useState<SocialLink[]>(initial.links);
  const [email, setEmail] = useState(initial.email ?? '');
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [calendarUrl, setCalendarUrl] = useState(initial.calendarUrl ?? '');

  const build = (): SocialDto => ({
    links: links.filter((l) => l.platform.trim() && l.url.trim()),
    email: email.trim() || null,
    phone: phone.trim() || null,
    calendarUrl: calendarUrl.trim() || null,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isSubmitting) return;
        onSubmit(build());
      }}
    >
      <h1 style={titleStyle}>How can people reach you?</h1>
      <p style={subtitleStyle}>
        Links and contact details your agent can share with interested visitors.
      </p>

      <div style={{ marginBottom: '1.125rem' }}>
        <label style={labelStyle}>Social & web links</label>
        <div style={{ marginTop: '0.375rem' }}>
          <RepeatableList
            items={links}
            onChange={setLinks}
            makeEmpty={makeEmptyLink}
            addLabel="Add a link"
            emptyHint="No links yet — LinkedIn, GitHub, website…"
            renderItem={(item, update) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={miniLabel}>Platform</label>
                  <input
                    type="text"
                    value={item.platform}
                    onChange={(e) => update({ platform: e.target.value })}
                    style={inputStyle(false)}
                    placeholder="e.g. LinkedIn"
                  />
                </div>
                <div style={{ flex: 1.6 }}>
                  <label style={miniLabel}>URL</label>
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) => update({ url: e.target.value })}
                    style={inputStyle(false)}
                    placeholder="https://…"
                  />
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, marginBottom: '1.125rem' }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle(false)}
            placeholder="you@example.com"
          />
        </div>
        <div style={{ flex: 1, marginBottom: '1.125rem' }}>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle(false)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <label style={labelStyle}>Scheduling link</label>
        <input
          type="url"
          value={calendarUrl}
          onChange={(e) => setCalendarUrl(e.target.value)}
          style={inputStyle(false)}
          placeholder="e.g. https://cal.com/you"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button type="submit" disabled={isSubmitting} style={primaryButtonStyle(isSubmitting)}>
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
