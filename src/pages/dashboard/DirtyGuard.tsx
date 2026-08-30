import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useBlocker } from 'react-router-dom';
import { Button } from '@shared-components/ui';
import { DirtyContext } from './dirtyContext';

/**
 * Tracks open editors that hold unsaved changes and stops navigation — both
 * in-app and away from the tab — before those changes are thrown away.
 *
 * Section forms own their own field state, so a view switch used to unmount
 * them silently. Rather than lifting every form's state, editors report
 * dirtiness here and the router does the rest.
 */
export function DirtyGuard({ children }: { children: ReactNode }) {
  const [dirtyIds, setDirtyIds] = useState<ReadonlySet<string>>(() => new Set());

  const setDirty = useCallback((id: string, dirty: boolean) => {
    setDirtyIds((current) => {
      if (current.has(id) === dirty) return current;
      const next = new Set(current);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const hasDirty = dirtyIds.size > 0;

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: { pathname: string }; nextLocation: { pathname: string } }) =>
        hasDirty && currentLocation.pathname !== nextLocation.pathname,
      [hasDirty],
    ),
  );

  // Covers reloads, tab closes and external links, which the router cannot see.
  useEffect(() => {
    if (!hasDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasDirty]);

  const value = useMemo(() => ({ setDirty }), [setDirty]);

  return (
    <DirtyContext.Provider value={value}>
      {children}
      {blocker.state === 'blocked' ? (
        <div className="pv-dialog-scrim" role="presentation">
          <div className="pv-dialog" role="alertdialog" aria-modal="true" aria-labelledby="pv-discard-title">
            <h2 id="pv-discard-title">Discard unsaved changes?</h2>
            <p>
              {dirtyIds.size === 1
                ? 'One section has edits that have not been saved.'
                : `${dirtyIds.size} sections have edits that have not been saved.`}{' '}
              Leaving now discards them.
            </p>
            <div className="pv-dialog-actions">
              <Button type="button" variant="secondary" size="compact" onClick={() => blocker.reset?.()}>
                Keep editing
              </Button>
              <Button
                type="button"
                size="compact"
                onClick={() => {
                  setDirtyIds(new Set());
                  blocker.proceed?.();
                }}
              >
                Discard changes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DirtyContext.Provider>
  );
}
