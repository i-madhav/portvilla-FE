import { Button } from '@shared-components/ui';

interface EditActionsProps {
  onCancel: () => void;
  saving: boolean;
  saveLabel?: string;
  /**
   * Block the save while the form holds something the API will reject.
   * A refused PATCH surfaces as a generic toast with no pointer to the field
   * that caused it, so it is worth catching one step earlier.
   */
  disabled?: boolean;
}

export function EditActions({ onCancel, saving, saveLabel = 'Save', disabled = false }: EditActionsProps) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button type="button" variant="secondary" size="compact" onClick={onCancel} disabled={saving}>Cancel</Button>
      <Button type="submit" size="compact" disabled={saving || disabled}>{saving ? 'Saving…' : saveLabel}</Button>
    </div>
  );
}
