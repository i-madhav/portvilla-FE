import type { IncomingSlide } from '@typings/slides';

/**
 * The agent → browser protocol, over LiveKit's data channel on the
 * `ui-command` topic.
 *
 * Mirrors `portvilla-agent/agent/ui_commands.py`. There is exactly **one**
 * content command: `SHOW_SLIDE`, carrying its payload inline. It replaced four
 * hardcoded `SHOW_*` commands, each of which needed matching changes in three
 * repositories before a new section could appear on screen — now the backend
 * derives a slide, the agent forwards it, and this app renders whichever
 * templates it happens to know.
 */
export const UI_COMMAND_TOPIC = 'ui-command';

export type UiCommand =
  | { type: 'SHOW_SLIDE'; payload: IncomingSlide }
  | { type: 'ORB_TO_PIP' }
  | { type: 'ORB_FULLSCREEN' }
  | { type: 'CLEAR_CONTENT' }
  | { type: 'SHOW_WAITLIST' };

export type UiCommandType = UiCommand['type'];

/**
 * Decode one data-channel message.
 *
 * Returns null for anything unrecognisable rather than throwing: a command from
 * a newer agent must never break the conversation that is already running, and
 * the visitor would have no idea why the page died.
 */
export function parseUiCommand(text: string): UiCommand | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }

  if (typeof raw !== 'object' || raw === null) return null;
  const { type, payload } = raw as { type?: unknown; payload?: unknown };

  switch (type) {
    case 'ORB_TO_PIP':
    case 'ORB_FULLSCREEN':
    case 'CLEAR_CONTENT':
    case 'SHOW_WAITLIST':
      return { type };
    case 'SHOW_SLIDE':
      return isSlideLike(payload) ? { type, payload } : null;
    default:
      return null;
  }
}

/**
 * The minimum a slide needs to be routable: an id, a template to switch on, and
 * a title. The payload itself is only inspected by the renderer that claims the
 * template, so it stays `unknown` until then.
 */
function isSlideLike(value: unknown): value is IncomingSlide {
  if (typeof value !== 'object' || value === null) return false;
  const slide = value as Record<string, unknown>;
  return (
    typeof slide.slideId === 'string' &&
    typeof slide.template === 'string' &&
    typeof slide.title === 'string'
  );
}
