import { useState } from 'react';
import { pickLang } from '../../utils/cmsText';

export default function FaqTemplateRenderer({ page }) {
  const sections = Array.isArray(page.faqSections) ? page.faqSections : [];
  const [open, setOpen] = useState(() => ({}));

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-4" dangerouslySetInnerHTML={{ __html: pickLang(page.title) }} />
        {sections.map((sec, si) => (
          <div key={si} className="mb-5">
            <h2 className="h4 mb-3" dangerouslySetInnerHTML={{ __html: pickLang(sec.heading) }} />
            {(sec.questions || []).map((q, qi) => {
              const key = `${si}-${qi}`;
              const expanded = !!open[key];
              return (
                <div key={qi} className="border-bottom py-3">
                  <button
                    type="button"
                    className="btn btn-link text-start text-white text-decoration-none p-0 w-100"
                    onClick={() => setOpen((o) => ({ ...o, [key]: !expanded }))}
                  >
                    <strong dangerouslySetInnerHTML={{ __html: pickLang(q.question) }} />
                  </button>
                  {expanded ? (
                    <div className="mt-2 small" dangerouslySetInnerHTML={{ __html: pickLang(q.answer) }} />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
