import { useState, useRef, useCallback } from 'react';
import { Button } from '@shared-components/ui';
import { useUploadResume } from '@api-hooks/profile/useProfileHooks';
import type { ResumeSuggestionsDto } from '@typings/profileApi';
import { StepHeader } from '../components/StepHeader';
import { COLORS, RADIUS, MOTION, noticeStyle, pillStyle } from '../styles';

interface ResumeStepProps {
  onSuggestions: (s: ResumeSuggestionsDto) => void;
  onSkip: () => void;
  onFinishNow: () => void;
}

const MAX_BYTES = 5 * 1024 * 1024; // must match resumeUploadConfig on the server

export function ResumeStep({ onSuggestions, onSkip, onFinishNow }: ResumeStepProps) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<'none' | 'parsed' | 'stored-only'>('none');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useUploadResume();

  const handleFile = useCallback(
    async (file: File) => {
      setLocalError(null);

      // Check before the round-trip so the user isn't waiting to be told no.
      if (file.type !== 'application/pdf') {
        setLocalError('That needs to be a PDF.');
        return;
      }
      if (file.size > MAX_BYTES) {
        setLocalError('That file is over 5 MB. Try exporting a lighter PDF.');
        return;
      }

      try {
        const result = await upload.mutateAsync(file);
        if (result.suggestions) {
          setOutcome('parsed');
          onSuggestions(result.suggestions);
        } else {
          // Stored fine, but nothing structured came back — a scanned resume, or
          // extraction is unavailable. Not an error; just no shortcut.
          setOutcome('stored-only');
        }
      } catch {
        // The mutation hook toasts. Staying here lets them retry or skip.
      }
    },
    [upload, onSuggestions],
  );

  const busy = upload.isPending;

  return (
    <div>
      <StepHeader
        title="Skip the typing"
        subtitle="Upload your resume and we'll draft your skills, journey and work from it. You review everything before it's saved — nothing is published from this."
      />

      {outcome === 'stored-only' ? (
        <div style={{ ...noticeStyle('info'), marginBottom: '1.25rem' }}>
          <span>
            We saved your resume, but couldn't read enough from it to draft anything — scanned or
            image-based PDFs usually do this. No problem: the next steps are quick.
          </span>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          style={{
            border: `1.5px dashed ${dragging ? COLORS.accent : COLORS.border}`,
            background: dragging ? COLORS.accentSubtle : COLORS.surfaceRaised,
            borderRadius: RADIUS.lg,
            padding: '2rem 1.25rem',
            textAlign: 'center',
            transition: `border-color ${MOTION.fast}, background ${MOTION.fast}`,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              // Allows re-picking the same file after a failure.
              e.target.value = '';
            }}
          />

          {busy ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <span
                aria-hidden="true"
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  border: `2px solid ${COLORS.borderSubtle}`,
                  borderTopColor: COLORS.accent,
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              <p style={{ color: COLORS.textSecondary, fontSize: '0.85rem', margin: 0 }}>
                Reading your resume…
              </p>
              <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: 0 }}>
                This takes a few seconds.
              </p>
            </div>
          ) : (
            <>
              <p className="font-mono text-label uppercase text-violet">file.input / pdf</p>
              <p
                style={{
                  color: COLORS.textPrimary,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  margin: '0.6rem 0 0.2rem',
                }}
              >
                Drop your resume here
              </p>
              <p style={{ color: COLORS.textMuted, fontSize: '0.78rem', margin: '0 0 1rem' }}>
                PDF, up to 5 MB
              </p>
              <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>Choose file</Button>
            </>
          )}
        </div>
      )}

      {localError && <p style={{ ...noticeStyle('error'), marginTop: '0.75rem' }}>{localError}</p>}

      {/* Stated at the control, not buried in a policy page. The user is about to
          hand over their employment history. */}
      {outcome === 'none' && !busy && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.45rem',
            marginTop: '1rem',
            color: COLORS.textMuted,
            fontSize: '0.73rem',
            lineHeight: 1.5,
          }}
        >
          <span className="font-mono text-label uppercase text-violet" aria-hidden="true">privacy /</span>
          <span>
            Your resume text is stored on your profile and sent to an AI model to draft the
            suggestions. You can delete it any time from your dashboard.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1.5rem' }}>
        {['Skills', 'Journey', 'Work'].map((s) => (
          <span key={s} style={pillStyle('neutral')}>
            {s}
          </span>
        ))}
        <span style={{ color: COLORS.textMuted, fontSize: '0.75rem', alignSelf: 'center' }}>
          — what we'll try to fill in
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.75rem' }}>
        <Button
          type="button"
          variant={outcome === 'stored-only' ? 'primary' : 'secondary'}
          onClick={onSkip}
          disabled={busy}
          className="flex-1"
        >
          {outcome === 'stored-only' ? 'Continue' : "I'll type it myself"}
        </Button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.9rem' }}>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={onFinishNow}
          disabled={busy}
        >
          Finish setup — I'll add the rest later
        </Button>
      </div>
    </div>
  );
}
