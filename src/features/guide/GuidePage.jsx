import { Link } from 'react-router';
import { ChevronRight, TriangleAlert } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { DISCLAIMER, SECTIONS, TOPICS } from './content';

export default function GuidePage() {
  return (
    <>
      <PageHeader title="Guide" subtitle="Short, step-by-step lens care" />
      <div className="flex flex-col gap-4">
        <Link to="/guide/putting-in" className="flex flex-col gap-2.5 rounded-[20px] bg-accent p-5 text-on-accent no-underline">
          <span className="text-xs font-semibold tracking-wider uppercase opacity-85">New to lenses?</span>
          <span className="text-lg font-bold">First-time walkthrough</span>
          <span className="text-sm leading-relaxed opacity-90">Putting lenses in, step by step. About 5 minutes.</span>
        </Link>

        <Link to="/guide/red-flags" className="flex items-center gap-3.5 rounded-2xl bg-danger-soft p-4 text-danger-strong no-underline">
          <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-surface">
            <TriangleAlert aria-hidden="true" size={22} strokeWidth={1.8} />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-bold">Red flags</span>
            <span className="text-[13px]">Pain, redness, blur, light sensitivity</span>
          </span>
          <ChevronRight aria-hidden="true" size={18} />
        </Link>

        {SECTIONS.map((section) => (
          <section key={section.id} aria-labelledby={`sec-${section.id}`} className="flex flex-col gap-2">
            <h2 id={`sec-${section.id}`} className="m-0 text-[13px] font-semibold tracking-wide text-muted uppercase">
              {section.title}
            </h2>
            <ul className="m-0 list-none overflow-hidden rounded-[20px] border border-line bg-surface p-0">
              {TOPICS.filter((t) => t.section === section.id).map((topic) => (
                <li key={topic.id} className="border-b border-line last:border-b-0">
                  <Link to={`/guide/${topic.id}`} className="flex min-h-11 items-center gap-3.5 px-4 py-3.5 text-fg no-underline hover:bg-bg">
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">{topic.title}</span>
                      <span className="text-[13px] text-muted">{topic.summary}</span>
                    </span>
                    <ChevronRight aria-hidden="true" size={18} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="m-0 text-xs leading-relaxed text-muted">{DISCLAIMER}</p>
      </div>
    </>
  );
}
