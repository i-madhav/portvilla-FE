import { useState } from 'react';
import type { SocialDto } from '@typings/profileApi';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { StepActions } from '../components/StepActions';
import { StepHeader } from '../components/StepHeader';
import { COLORS, labelStyle, inputStyle, selectStyle, fieldGroupStyle } from '../styles';

interface ContactStepProps {
  initial: SocialDto;
  onSubmit: (social: SocialDto) => void;
  busy: boolean;
}

type SocialLink = SocialDto['links'][number];

const PLATFORMS = [
  'github',
  'linkedin',
  'x',
  'website',
  'dribbble',
  'behance',
  'youtube',
  'instagram',
  'other',
];

// Defaults to a real platform rather than an empty string: a blank `platform`
// silently disqualified the row from being saved.
const makeEmptyLink = (): SocialLink => ({ platform: 'github', url: '', label: null });

const miniLabel = { ...labelStyle, fontSize: '0.72rem', marginBottom: '0.3rem' };
const orNull = (s: string): string | null => (s.trim() ? s.trim() : null);

export function ContactStep({ initial, onSubmit, busy }: ContactStepProps) {
  const [links, setLinks] = useState<SocialLink[]>(initial.links);
  const [email, setEmail] = useState(initial.email ?? '');
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [calendarUrl, setCalendarUrl] = useState(initial.calendarUrl ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      links: links.filter((l) => l.url.trim()),
      email: orNull(email),
      phone: orNull(phone),
      calendarUrl: orNull(calendarUrl),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <StepHeader
        title="How should people reach you?"
        subtitle="Last one. Your agent points visitors here when they want to talk to the real you."
      />

      <div style={fieldGroupStyle('1.25rem')}>
        <label style={labelStyle} htmlFor="pv-email">
          Email
          <span style={{ color: COLORS.textMuted, fontWeight: 400, marginLeft: '0.3rem' }}>
            optional
          </span>
        </label>
        <input
          id="pv-email"
          className="pv-field"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle()}
          placeholder="you@example.com"
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 10rem', minWidth: 0 }}>
          <div style={fieldGroupStyle('1.25rem')}>
            <label style={labelStyle} htmlFor="pv-phone">
              Phone
              <span style={{ color: COLORS.textMuted, fontWeight: 400, marginLeft: '0.3rem' }}>
                optional
              </span>
            </label>
            <input
              id="pv-phone"
              className="pv-field"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle()}
              placeholder="+49 …"
            />
          </div>
        </div>
        <div style={{ flex: '1 1 10rem', minWidth: 0 }}>
          <div style={fieldGroupStyle('1.25rem')}>
            <label style={labelStyle} htmlFor="pv-calendar">
              Booking link
              <span style={{ color: COLORS.textMuted, fontWeight: 400, marginLeft: '0.3rem' }}>
                optional
              </span>
            </label>
            <input
              id="pv-calendar"
              className="pv-field"
              type="url"
              value={calendarUrl}
              onChange={(e) => setCalendarUrl(e.target.value)}
              style={inputStyle()}
              placeholder="https://cal.com/you"
            />
          </div>
        </div>
      </div>

      <div style={fieldGroupStyle('0.5rem')}>
        <span style={labelStyle}>Profiles &amp; links</span>
        <RepeatableList
          items={links}
          onChange={setLinks}
          makeEmpty={makeEmptyLink}
          addLabel="Add a link"
          itemNoun="link"
          emptyHint="GitHub, LinkedIn, your site — wherever your work already lives."
          renderItem={(item, update, index) => (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 7rem', minWidth: 0 }}>
                <label style={miniLabel} htmlFor={`pv-link-platform-${index}`}>
                  Platform
                </label>
                <select
                  id={`pv-link-platform-${index}`}
                  className="pv-field"
                  value={item.platform}
                  onChange={(e) => update({ platform: e.target.value })}
                  style={selectStyle()}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '2 1 12rem', minWidth: 0 }}>
                <label style={miniLabel} htmlFor={`pv-link-url-${index}`}>
                  URL
                </label>
                <input
                  id={`pv-link-url-${index}`}
                  className="pv-field"
                  type="url"
                  value={item.url}
                  onChange={(e) => update({ url: e.target.value })}
                  style={inputStyle()}
                  placeholder="https://…"
                />
              </div>
            </div>
          )}
        />
      </div>

      <StepActions continueLabel="Finish setup" busy={busy} />
    </form>
  );
}
