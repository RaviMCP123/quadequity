import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { fetchCmsCategories, fetchPageBySlug } from '../../api/cms';
import { pickLang } from '../../utils/cmsText';
import { API_BASE_URL } from '../../lib/env';

const FOOTER_SLUG = import.meta.env.VITE_FOOTER_PAGE_SLUG ?? 'footer';

function categoryFooterOrder(cat) {
  const placements = cat.placement || [];
  const footerPlacement = placements.find((item) => item?.type === 'footer');
  if (footerPlacement && typeof footerPlacement.sortOrder === 'number') {
    return footerPlacement.sortOrder;
  }
  return typeof cat.sortOrder === 'number' ? cat.sortOrder : 999;
}

export default function SiteFooter() {
  const [page, setPage] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!API_BASE_URL || !FOOTER_SLUG) return;
    fetchPageBySlug(FOOTER_SLUG)
      .then((res) => {
        if (res?.data) setPage(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!API_BASE_URL) return;
    fetchCmsCategories({ status: true, placement: 'footer' })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        const footerCategories = list.filter(
          (category) =>
            category?.status !== false &&
            Array.isArray(category?.placement) &&
            category.placement.some((placement) => placement?.type === 'footer'),
        );
        footerCategories.sort((a, b) => categoryFooterOrder(a) - categoryFooterOrder(b));
        setCategories(footerCategories);
      })
      .catch(() => setCategories([]));
  }, []);

  const footerLinks = useMemo(
    () =>
      categories
        .filter((category) => category?.slug)
        .map((category) => ({
          slug: category.slug,
          label: category.name || category.slug,
          to: category.slug === 'home' ? '/' : `/${category.slug}`,
        })),
    [categories],
  );

  const missionHtml = page ? pickLang(page.footerDescription) : '';
  const xUrl = page?.twitterUrl || page?.facebookUrl;
  const linkedinUrl = page?.linkedinUrl;
  const addressHtml = page ? pickLang(page.address) : '';

  return (
    <section>
      <div className="container">
        <footer>
          <div className="footer-logo ps-md-3">
            <div className="py-3 py-md-0">
              <img src="/assets/images/logo.png" alt="" style={{ width: '200px' }} aria-label="Quad Equities" />
            </div>
          </div>
          <div className="row w-100 g-0 footer-content">
            <div className="col-md-4 py-md-5 footer-block footer-column">
              <div className="footer-links-panel">
                <div className="footer-social-links">
                  {xUrl ? (
                    <a href={xUrl} target="_blank" rel="noreferrer" aria-label="X">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M17.7512 2.96094H20.818L14.1179 10.6187L22 21.0391H15.8284L10.9946 14.7191L5.4636 21.0391H2.39492L9.56132 12.8483L2 2.96094H8.32824L12.6976 8.73762L17.7512 2.96094ZM16.6748 19.2035H18.3742L7.40492 4.70014H5.58132L16.6748 19.2035Z"
                          fill="#ffffff"
                        />
                      </svg>
                    </a>
                  ) : (
                    <a href="/" aria-label="Twitter">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M17.7512 2.96094H20.818L14.1179 10.6187L22 21.0391H15.8284L10.9946 14.7191L5.4636 21.0391H2.39492L9.56132 12.8483L2 2.96094H8.32824L12.6976 8.73762L17.7512 2.96094ZM16.6748 19.2035H18.3742L7.40492 4.70014H5.58132L16.6748 19.2035Z"
                          fill="#ffffff"
                        />
                      </svg>
                    </a>
                  )}
                  {linkedinUrl ? (
                    <a href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                  ) : (
                    <a href="/" aria-label="LinkedIn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                  )}
                </div>
                {footerLinks.length > 0 && (
                  <div className="footer-nav footer-nav-side">
                    {footerLinks.map((item) => (
                      <Link key={item.slug} to={item.to}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-4 py-2 py-md-5 footer-block footer-column">
              <address>
                {addressHtml ? (
                  renderFooterAddress(addressHtml)
                ) : (
                  <>
                    Suite 2, 86 High Street, <br /> Berwick Victoria 3806
                  </>
                )}
              </address>
            </div>
            <div className="col-md-4 py-md-5 pe-md-5 footer-block footer-column">
              <p>
                {missionHtml ? (
                  <span dangerouslySetInnerHTML={{ __html: missionHtml }} />
                ) : (
                  <>
                    <span>Quad Equities</span> is a private investment and venture platform deploying disciplined capital
                    across Australian and international markets.
                  </>
                )}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}

function renderFooterAddress(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (/<\/?[a-z][\s\S]*>/i.test(text)) {
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 1) return <span>{text}</span>;

  return (
    <span>
      {lines.map((line, idx) => (
        <span key={idx}>
          {line}
          {idx < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}
