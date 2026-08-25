import { useDashboard } from '../context';
import { ProfileHero } from '../components/ProfileHero';
import { AgentConfigSection } from '../sections/AgentConfigSection';
import { PageHeader } from './PageHeader';

export function ConfigurationView() {
  const { profile, save } = useDashboard();

  return (
    <div className="pv-dashboard-workspace">
      <PageHeader eyebrow="Agent setup" title="Configuration" description="Control who can visit, how your agent speaks, and which content model supports background tasks." />
      <ProfileHero profile={profile} save={save} />
      <div className="pv-workspace-section-heading">
        <p className="meta">Conversation behavior</p>
        <h2>Voice and model settings</h2>
        <p>Changes affect future sessions. Current live conversations continue with their existing configuration.</p>
      </div>
      <AgentConfigSection profile={profile} save={save} />
    </div>
  );
}
