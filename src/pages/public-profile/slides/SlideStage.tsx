import { SlideTemplate, isRenderable } from '@typings/slides';
import type { IncomingSlide } from '@typings/slides';
import {
  CapabilitiesSlide,
  ContactSlide,
  IdentitySlide,
  TimelineSlide,
  WorkSlide,
  WorkStageSlide,
} from './templates';

/**
 * Routes a slide to its renderer.
 *
 * **Renders nothing for a template it does not know**, and that is the whole
 * point of routing on `template` rather than on a command type. The backend can
 * add a template — feature sub-lifecycles are already sketched — and ship it to
 * the agent before this app redeploys; the visitor then hears about it without
 * seeing it, which is a far better failure than a blank page or a thrown error
 * in the middle of a conversation.
 */
export function SlideStage({ slide }: { slide: IncomingSlide }) {
  if (!isRenderable(slide)) {
    console.warn('[slides] no renderer for template %o — showing nothing', slide.template);
    return null;
  }

  switch (slide.template) {
    case SlideTemplate.Identity:
      return <IdentitySlide payload={slide.payload} />;
    case SlideTemplate.Work:
      return <WorkSlide payload={slide.payload} />;
    case SlideTemplate.WorkStage:
      return <WorkStageSlide payload={slide.payload} />;
    case SlideTemplate.Capabilities:
      return <CapabilitiesSlide payload={slide.payload} />;
    case SlideTemplate.Timeline:
      return <TimelineSlide payload={slide.payload} />;
    case SlideTemplate.Contact:
      return <ContactSlide payload={slide.payload} />;
  }
}
