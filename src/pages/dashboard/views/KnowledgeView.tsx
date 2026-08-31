import { NavLink, Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@routes/index';

import { useDashboard } from '../context';
import {
  DEFAULT_KNOWLEDGE_SECTION,
  entityCopy,
  isKnowledgeSectionId,
  knowledgeSections,
  visibleExtraSections,
} from '../knowledgeSections';
import { IdentitySection } from '../sections/IdentitySection';
import { CapabilitiesSection } from '../sections/CapabilitiesSection';
import { TimelineSection } from '../sections/TimelineSection';
import { WorksSection } from '../sections/WorksSection';
import { SocialSection } from '../sections/SocialSection';
import { ExtraSections } from '../sections/ExtraSections';
import { DisplayPreviews } from '../components/DisplayPreviews';
import { PageHeader } from './PageHeader';

/**
 * One knowledge section at a time. The full list used to be a single scroll of
 * roughly twelve editable cards; the sections now live in the rail, so the
 * screen holds one decision and the URL says which one.
 */
export function KnowledgeView() {
  const { profile, completeness, save, jumpToKnowledge } = useDashboard();
  const { section } = useParams();

  if (!isKnowledgeSectionId(section)) {
    // Absolute: relative navigation resolves against the route, not the URL,
    // so `..` from `knowledge/:section` would land on /dashboard.
    return <Navigate to={`${ROUTES.KNOWLEDGE}/${DEFAULT_KNOWLEDGE_SECTION}`} replace />;
  }

  const entity = entityCopy(profile);
  const sections = knowledgeSections(profile, completeness);
  const current = sections.find((item) => item.id === section)!;

  return (
    <div className="pv-dashboard-workspace">
      <PageHeader eyebrow="Agent knowledge" title={current.label} description={current.description} />

      {/* The rail carries this same list, but only from 64rem up. Below that it
          is an icon-only rail or a tab strip with no room for sub-navigation,
          which left every section except the default one unreachable. This is
          hidden again at 64rem so the rail stays the single answer to "where
          am I" on a wide window. */}
      <nav className="pv-knowledge-sectionbar" aria-label="Knowledge sections">
        {sections.map((item) => (
          <NavLink
            key={item.id}
            to={`${ROUTES.KNOWLEDGE}/${item.id}`}
            className="pv-knowledge-sectionbar-item pv-focusable"
          >
            <span>{item.label}</span>
            {item.needsAttention ? (
              <span className="pv-subnav-attention" aria-label="Incomplete" title="Incomplete" />
            ) : null}
          </NavLink>
        ))}
      </nav>

      {section === 'identity' ? (
        <div className="pv-entity-notice">
          <span aria-hidden="true">◎</span>
          <p><strong>Showing fields for a {entity.noun}.</strong> Irrelevant fields stay out of the way. Change the type below if this is wrong.</p>
        </div>
      ) : null}

      {section === 'identity' ? <IdentitySection profile={profile} save={save} /> : null}
      {section === 'capabilities' ? <CapabilitiesSection profile={profile} save={save} /> : null}
      {section === 'timeline' ? <TimelineSection profile={profile} save={save} /> : null}
      {section === 'works' ? <WorksSection profile={profile} save={save} /> : null}
      {section === 'more' ? (
        <ExtraSections profile={profile} save={save} visible={visibleExtraSections(profile)} />
      ) : null}
      {section === 'social' ? <SocialSection profile={profile} save={save} /> : null}
      {section === 'displays' ? <DisplayPreviews profile={profile} onEditSource={jumpToKnowledge} /> : null}
    </div>
  );
}
