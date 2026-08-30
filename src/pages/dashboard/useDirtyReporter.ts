import { useContext, useEffect } from 'react';
import { DirtyContext } from './dirtyContext';

/** Reports one editor's unsaved-changes state to the surrounding DirtyGuard. */
export function useDirtyReporter(id: string, dirty: boolean) {
  const { setDirty } = useContext(DirtyContext);
  useEffect(() => {
    setDirty(id, dirty);
    return () => setDirty(id, false);
  }, [id, dirty, setDirty]);
}
