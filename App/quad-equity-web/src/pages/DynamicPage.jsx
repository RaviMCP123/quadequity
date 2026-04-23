import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageBySlug } from '../api/cms';
import { pickLang } from '../utils/cmsText';
import PageTemplateRenderer from '../components/cms/PageTemplateRenderer';
import HomepageTemplateRenderer from '../components/cms/HomepageTemplateRenderer';
import ContactTemplateRenderer from '../components/cms/ContactTemplateRenderer';
import PortfolioTemplateRenderer from '../components/cms/PortfolioTemplateRenderer';
import FaqTemplateRenderer from '../components/cms/FaqTemplateRenderer';
import RichDocumentRenderer from '../components/cms/RichDocumentRenderer';
import InnerPageTemplateRenderer from '../components/cms/InnerPageTemplateRenderer';
import NotFoundPage from './NotFoundPage';

const HOME_SLUG = import.meta.env.VITE_HOME_PAGE_SLUG ?? 'home';

export default function DynamicPage() {
  const { slug: routeSlug } = useParams();
  const slug = routeSlug ?? HOME_SLUG;

  const [page, setPage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPageBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data;
        if (!data) {
          setError('Page not found.');
          setPage(null);
          return;
        }
        setPage(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load page.');
        setPage(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    const t = pickLang(page.metaTitle) || pickLang(page.title);
    if (t) document.title = t;
  }, [page]);

  const body = useMemo(() => {
    if (!page) return null;

    const tk = page.templateKey || '';
    const cat = (page.category || '').toLowerCase();

    if (tk === 'footer_template' || tk === 'footer-template') {
      return (
        <div className="container py-5">
          <p>This entry is reserved for the site footer. Choose another page.</p>
        </div>
      );
    }

    if (tk === 'contactus_template' || tk === 'contact-us' || cat === 'contact-us' || cat === 'contact') {
      return <ContactTemplateRenderer page={page} />;
    }

    if (tk === 'portfolio_template' || slug === 'portfolio' || cat === 'portfolio') {
      return <PortfolioTemplateRenderer page={page} />;
    }

    if (tk === 'innerpage_template' || tk === 'INNER_PAGE_V1' || cat === 'inner-page') {
      return <InnerPageTemplateRenderer page={page} />;
    }

    if (tk === 'page_template' || tk === 'PAGE_TEMPLATE_V1' || !tk) {
      return <PageTemplateRenderer page={page} variant="default" />;
    }

    if (tk === 'faq' || cat === 'faq') {
      return <FaqTemplateRenderer page={page} />;
    }

    if (tk === 'home_template' || tk === 'HOMEPAGE_V1' || cat === 'home') {
      return <HomepageTemplateRenderer page={page} />;
    }

    if (tk === 'terms-condition' || tk === 'privacy-policy' || tk === 'register-school') {
      return <RichDocumentRenderer page={page} />;
    }

    if (page.content && typeof page.content === 'object' && Object.keys(page.content).length > 0) {
      return <HomepageTemplateRenderer page={page} />;
    }

    return <PageTemplateRenderer page={page} variant="default" />;
  }, [page, slug]);

  if (!import.meta.env.VITE_API_BASE_URL) {
    return (
      <section className="py-5">
        <div className="container">
          <p>
            Set <code>VITE_API_BASE_URL</code> in <code>.env</code> (e.g. <code>http://localhost:3000/api</code>) to load
            pages from the CMS.
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <p className="text-muted">Loading…</p>
        </div>
      </section>
    );
  }

  if (error || !page) {
    return (
      <NotFoundPage
        title="Page not available"
        message={error || 'No content is available for this page.'}
      />
    );
  }

  return <>{body}</>;
}
