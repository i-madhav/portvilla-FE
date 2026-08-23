import { Button } from '@shared-components/ui';

interface StepActionsProps {
  continueLabel?: string;
  onSkip?: () => void;
  skipLabel?: string;
  onFinishNow?: () => void;
  disabled?: boolean;
  busy?: boolean;
  disabledHint?: string;
}

export function StepActions({
  continueLabel = 'Continue',
  onSkip,
  skipLabel = 'Skip for now',
  onFinishNow,
  disabled = false,
  busy = false,
  disabledHint,
}: StepActionsProps) {
  const blocked = disabled || busy;

  return (
    <div className="mt-7 grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={blocked} className="flex-1">{busy ? 'Saving…' : continueLabel}</Button>
        {onSkip ? <Button variant="secondary" onClick={onSkip} disabled={busy}>{skipLabel}</Button> : null}
      </div>
      {disabled && disabledHint ? <p className="text-micro text-ink-45">{disabledHint}</p> : null}
      {onFinishNow ? (
        <Button variant="ghost" size="compact" className="justify-self-center" onClick={onFinishNow} disabled={busy}>
          Finish setup — I’ll add the rest later
        </Button>
      ) : null}
    </div>
  );
}
