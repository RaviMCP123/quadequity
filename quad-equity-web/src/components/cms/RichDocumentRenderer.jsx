import { pickLang } from '../../utils/cmsText';

/** Terms, privacy, or any page that is mainly rich HTML body. */
export default function RichDocumentRenderer({ page }) {
  const title = pickLang(page.title);
  const body = pickLang(page.description);

  return (
    <section className="py-5">
      <div className="container cms-rich-doc">
        {title ? <h1 className="mb-4">{title}</h1> : null}
        {body ? <div className="cms-body" dangerouslySetInnerHTML={{ __html: body }} /> : null}
      </div>
    </section>
  );
}
