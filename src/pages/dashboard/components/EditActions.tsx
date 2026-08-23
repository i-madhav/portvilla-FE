import { Button } from '@shared-components/ui';

interface EditActionsProps {
  onCancel: () => void;
  saving: boolean;
  saveLabel?: string;
}

export function EditActions({ onCancel, saving, saveLabel = 'Save' }: EditActionsProps) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button type="button" variant="secondary" size="compact" onClick={onCancel} disabled={saving}>Cancel</Button>
      <Button type="submit" size="compact" disabled={saving}>{saving ? 'Saving…' : saveLabel}</Button>
    </div>
  );
}
