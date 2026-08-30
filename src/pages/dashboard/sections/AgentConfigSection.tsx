import { useState } from 'react';
import type {
  LlmProvider,
  AgentTone,
  AgentVerbosity,
  AgentTechnicalDepth,
  AgentSpeakingSpeed,
} from '@typings/profileApi';
import { LlmProvider as Provider } from '@typings/profileApi';
import { labelStyle, inputStyle, selectStyle } from '@shared-components/theme';
import { EditableSection } from '../components/EditableSection';
import { EditActions } from '../components/EditActions';
import { KeyValue } from '../components/display';
import { COLORS } from '../styles';
import type { SectionProps } from './types';

const miniLabel = { ...labelStyle, fontSize: '0.7rem', marginTop: '0.75rem' };

const PROVIDER_OPTIONS: { value: LlmProvider; label: string }[] = [
  { value: Provider.OpenAi, label: 'OpenAI' },
  { value: Provider.Anthropic, label: 'Anthropic' },
  { value: Provider.Groq, label: 'Groq' },
  { value: Provider.DeepSeek, label: 'DeepSeek' },
  { value: Provider.Ollama, label: 'Ollama' },
  { value: Provider.Custom, label: 'Custom' },
];

function labelsToOptions<T extends string>(map: Record<T, string>) {
  return (Object.entries(map) as [T, string][]).map(([value, label]) => ({ value, label }));
}

const TONE_LABELS: Record<AgentTone, string> = { formal: 'Formal', balanced: 'Balanced', casual: 'Casual' };
const VERBOSITY_LABELS: Record<AgentVerbosity, string> = { concise: 'Concise', detailed: 'Detailed' };
const DEPTH_LABELS: Record<AgentTechnicalDepth, string> = { high: 'High', medium: 'Medium', low: 'Low' };
const SPEED_LABELS: Record<AgentSpeakingSpeed, string> = { slow: 'Slow', normal: 'Normal', fast: 'Fast' };

/** Renders the two agent-configuration cards: LLM connection + voice persona. */
export function AgentConfigSection({ profile, save }: SectionProps) {
  return (
    <div className="pv-overview-grid">
      <VoicePersonaCard profile={profile} save={save} />
      <AiProviderCard profile={profile} save={save} />
    </div>
  );
}

// ─── AI provider (aiSettings) ────────────────────────────────────────────────

function AiProviderCard({ profile, save }: SectionProps) {
  const ai = profile.aiSettings;
  return (
    <EditableSection
      title="Content AI connection"
      description="Optional provider used for tasks such as repository summaries. It does not control the live voice model."
      view={
        <div>
          <KeyValue label="Provider" value={PROVIDER_OPTIONS.find((p) => p.value === ai.provider)?.label ?? ai.provider} />
          <KeyValue label="Model" value={ai.model} />
          <KeyValue label="Base URL" value={ai.baseUrl} />
          <KeyValue
            label="API key"
            value={
              <span style={{ color: ai.apiKeyConfigured ? COLORS.success : COLORS.textMuted }}>
                {ai.apiKeyConfigured ? '✓ Configured' : 'Not set'}
              </span>
            }
          />
        </div>
      }
      edit={({ done }) => <AiProviderEdit ai={ai} save={save} done={done} />}
    />
  );
}

function AiProviderEdit({
  ai,
  save,
  done,
}: {
  ai: SectionProps['profile']['aiSettings'];
  save: SectionProps['save'];
  done: () => void;
}) {
  const [provider, setProvider] = useState<LlmProvider>(ai.provider);
  const [model, setModel] = useState(ai.model ?? '');
  const [baseUrl, setBaseUrl] = useState(ai.baseUrl ?? '');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await save({
        aiSettings: {
          provider,
          model: model.trim() || null,
          baseUrl: baseUrl.trim() || null,
          // Only send the key when the user typed a new one — blank leaves it unchanged.
          ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
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
      <label style={{ ...miniLabel, marginTop: 0 }}>Provider</label>
      <select aria-label="Content AI provider" value={provider} onChange={(e) => setProvider(e.target.value as LlmProvider)} style={selectStyle()}>
        {PROVIDER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label style={miniLabel}>Model</label>
      <input aria-label="Content AI model" value={model} onChange={(e) => setModel(e.target.value)} style={inputStyle()} placeholder="e.g. gpt-4o, claude-sonnet-4.5" />

      <label style={miniLabel}>Base URL</label>
      <input aria-label="Content AI base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} style={inputStyle()} placeholder="Optional — for custom / self-hosted" />

      <label style={miniLabel}>API key</label>
      <input
        aria-label="Content AI API key"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={inputStyle()}
        placeholder={ai.apiKeyConfigured ? '•••••••• (leave blank to keep)' : 'Paste your API key'}
        autoComplete="off"
      />

      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}

// ─── Voice persona (agentPersona) ────────────────────────────────────────────

function VoicePersonaCard({ profile, save }: SectionProps) {
  const p = profile.agentPersona;
  return (
    <EditableSection
      title="Conversation style"
      description="The name, tone and pacing visitors experience when they talk to your representative."
      view={
        <div>
          <KeyValue label="Agent name" value={p.agentName} />
          <KeyValue label="Tone" value={TONE_LABELS[p.tone]} />
          <KeyValue label="Verbosity" value={VERBOSITY_LABELS[p.verbosity]} />
          <KeyValue label="Technical depth" value={DEPTH_LABELS[p.technicalDepth]} />
          <KeyValue label="Speaking speed" value={SPEED_LABELS[p.speakingSpeed]} />
        </div>
      }
      edit={({ done }) => <VoicePersonaEdit persona={p} save={save} done={done} />}
    />
  );
}

function VoicePersonaEdit({
  persona,
  save,
  done,
}: {
  persona: SectionProps['profile']['agentPersona'];
  save: SectionProps['save'];
  done: () => void;
}) {
  const [agentName, setAgentName] = useState(persona.agentName);
  const [tone, setTone] = useState<AgentTone>(persona.tone);
  const [verbosity, setVerbosity] = useState<AgentVerbosity>(persona.verbosity);
  const [technicalDepth, setTechnicalDepth] = useState<AgentTechnicalDepth>(persona.technicalDepth);
  const [speakingSpeed, setSpeakingSpeed] = useState<AgentSpeakingSpeed>(persona.speakingSpeed);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || saving) return;
    setSaving(true);
    try {
      await save({
        agentPersona: {
          agentName: agentName.trim(),
          tone,
          verbosity,
          technicalDepth,
          speakingSpeed,
        },
      });
      done();
    } catch {
      /* toast handled upstream */
    } finally {
      setSaving(false);
    }
  };

  const Select = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle()}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  return (
    <form onSubmit={submit}>
      <label style={{ ...miniLabel, marginTop: 0 }}>Agent name</label>
      <input aria-label="Agent name" value={agentName} onChange={(e) => setAgentName(e.target.value)} style={inputStyle(agentName.trim() ? 'default' : 'error')} maxLength={32} />

      <label style={miniLabel}>Tone</label>
      <Select label="Agent tone" value={tone} onChange={(v) => setTone(v as AgentTone)} options={labelsToOptions(TONE_LABELS)} />

      <label style={miniLabel}>Verbosity</label>
      <Select label="Agent verbosity" value={verbosity} onChange={(v) => setVerbosity(v as AgentVerbosity)} options={labelsToOptions(VERBOSITY_LABELS)} />

      <label style={miniLabel}>Technical depth</label>
      <Select label="Agent technical depth" value={technicalDepth} onChange={(v) => setTechnicalDepth(v as AgentTechnicalDepth)} options={labelsToOptions(DEPTH_LABELS)} />

      <label style={miniLabel}>Speaking speed</label>
      <Select label="Agent speaking speed" value={speakingSpeed} onChange={(v) => setSpeakingSpeed(v as AgentSpeakingSpeed)} options={labelsToOptions(SPEED_LABELS)} />

      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}
