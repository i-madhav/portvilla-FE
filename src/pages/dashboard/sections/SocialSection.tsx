import { useState } from 'react';
import type { SocialDto } from '@typings/profileApi';
import { labelStyle, inputStyle } from '@shared-components/theme';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { EditableSection } from '../components/EditableSection';
import { EditActions } from '../components/EditActions';
import { KeyValue, EmptyText } from '../components/display';
import { COLORS } from '../styles';
import type { SectionProps } from './types';

type SocialLink = SocialDto['links'][number];

const makeEmptyLink = (): SocialLink => ({ platform: '', url: '', label: null });
const miniLabel = { ...labelStyle, fontSize: '0.68rem', marginBottom: '0.25rem' };

export function SocialSection({ profile, save }: SectionProps) {
  const social = profile.social;
  const hasAny =
    social.links.length > 0 || social.email || social.phone || social.calendarUrl;

  return (
    <EditableSection
      title="Contact & Links"
      description="How visitors can reach you."
      view={
        !hasAny ? (
          <EmptyText>No contact details yet.</EmptyText>
        ) : (
          <div>
            {social.links.map((l, i) => (
              <KeyValue
                key={i}
                label={l.platform}
                value={
                  <a href={l.url} target="_blank" rel="noreferrer" style={{ color: COLORS.textSecondary }}>
                    {l.url}
                  </a>
                }
              />
            ))}
            <KeyValue label="Email" value={social.email} />
            <KeyValue label="Phone" value={social.phone} />
            <KeyValue label="Scheduling" value={social.calendarUrl} />
          </div>
        )
      }
      edit={({ done }) => <SocialEdit initial={social} save={save} done={done} />}
    />
  );
}

function SocialEdit({
  initial,
  save,
  done,
}: {
  initial: SocialDto;
  save: SectionProps['save'];
  done: () => void;
}) {
  const [links, setLinks] = useState<SocialLink[]>(initial.links);
  const [email, setEmail] = useState(initial.email ?? '');
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [calendarUrl, setCalendarUrl] = useState(initial.calendarUrl ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await save({
        social: {
          links: links.filter((l) => l.platform.trim() && l.url.trim()),
          email: email.trim() || null,
          phone: phone.trim() || null,
          calendarUrl: calendarUrl.trim() || null,
        },
      });
      done();
    } catch {
      /* toast handled upstream */
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label style={miniLabel}>Links</label>
      <RepeatableList
        items={links}
        onChange={setLinks}
        makeEmpty={makeEmptyLink}
        addLabel="Add a link"
        emptyHint="No links yet."
        renderItem={(item, update) => (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={miniLabel}>Platform</label>
              <input value={item.platform} onChange={(e) => update({ platform: e.target.value })} style={inputStyle()} />
            </div>
            <div style={{ flex: 1.6 }}>
              <label style={miniLabel}>URL</label>
              <input value={item.url} onChange={(e) => update({ url: e.target.value })} style={inputStyle()} placeholder="https://…" />
            </div>
          </div>
        )}
      />

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <label style={miniLabel}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle()} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={miniLabel}>Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle()} />
        </div>
      </div>

      <label style={{ ...miniLabel, marginTop: '0.75rem' }}>Scheduling link</label>
      <input type="url" value={calendarUrl} onChange={(e) => setCalendarUrl(e.target.value)} style={inputStyle()} placeholder="https://cal.com/you" />

      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}
