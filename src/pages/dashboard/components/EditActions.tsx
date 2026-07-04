import { smallButtonStyle } from '../styles';

interface EditActionsProps {
  onCancel: () => void;
  saving: boolean;
  saveLabel?: string;
}

/** Shared Save / Cancel footer for an inline section edit form. */
export function EditActions({ onCancel, saving, saveLabel = 'Save' }: EditActionsProps) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
      <button type="button" style={smallButtonStyle('ghost')} onClick={onCancel} disabled={saving}>
        Cancel
      </button>
      <button type="submit" style={smallButtonStyle('primary')} disabled={saving}>
        {saving ? 'Saving…' : saveLabel}
      </button>
    </div>
  );
}
