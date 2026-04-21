import { Link } from 'react-router-dom';
import { pickLang, resolveAssetUrl } from '../../utils/cmsText';
import { API_BASE_URL } from '../../lib/env';

/**
 * Portfolio index style: hero band + grid of tiles from pageSections.
 */
export default function PortfolioTemplateRenderer({ page }) {
  const base = API_BASE_URL;
  const tileBackgrounds = ['#1a3a5c', '#1c2e1c', '#1e1a2e', '#1a1f2e'];
  const kicker = pickLang(page.bannerTitle);
  const headline = stripOuterBlockTag(pickLang(page.bannerDescription));
  const sub = pickLang(page.description);
  const heroImage = resolveAssetUrl(page.bannerImage, base);
  const sections = Array.isArray(page.pageSections) ? page.pageSections : [];

  return (
    <>
      <section className="">
        <div className="">
          <div
            className="hero-section hero-portfolio"
            style={
              heroImage
                ? {
                    background: `linear-gradient(rgba(15, 27, 45, 0.55), rgba(15, 27, 45, 0.55)), url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                  }
                : undefined
            }
          >
            <div className="container">
              <div className="px-5 d-flex flex-column gap-3 hero-content">
                {kicker ? <h6 dangerouslySetInnerHTML={{ __html: kicker }} /> : null}
                {headline ? <h1 dangerouslySetInnerHTML={{ __html: headline }} /> : null}
                {sub ? <h3 dangerouslySetInnerHTML={{ __html: sub }} /> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="card-section card-portfolio">
        <div className="container">
          <div className="portfolio-content">
            {sections.map((section, idx) => {
              const title = pickLang(section.title);
              const descText = pickLang(section.description);
              const blurb =
                pickLang(section.subtitle) ||
                (descText ? descText.replace(/<[^>]+>/g, '').slice(0, 220) : '');
              const logo =
                Array.isArray(section.images) && section.images[0]
                  ? resolveAssetUrl(section.images[0], base)
                  : '';
              const raw = section.buttonUrl || '';
              const to = raw.startsWith('http')
                ? raw
                : raw
                  ? raw.startsWith('/')
                    ? raw
                    : `/${raw}`
                  : '/';

              const inner = (
                <>
                  {title ? <h6 dangerouslySetInnerHTML={{ __html: title }} /> : <h6> </h6>}
                  {logo ? <img src={logo} alt="" width="170px" /> : null}
                  {blurb ? (
                    <p className="text-center" dangerouslySetInnerHTML={{ __html: blurb }} />
                  ) : null}
                </>
              );

              const className = `portfolio-grid portfolio-tile-${idx}`;
              return (
                <div key={idx} className={className} style={{ backgroundColor: tileBackgrounds[idx % tileBackgrounds.length] }}>
                  {typeof to === 'string' && to.startsWith('http') ? (
                    <a href={to} className="d-flex flex-column gap-3 align-items-center">
                      {inner}
                    </a>
                  ) : (
                    <Link to={to} className="d-flex flex-column gap-3 align-items-center">
                      {inner}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function stripOuterBlockTag(html) {
  const t = String(html || '').trim();
  if (!t) return '';
  const oneDiv = /^<div(\s[^>]*)?>([\s\S]*?)<\/div>\s*$/i.exec(t);
  if (oneDiv) return oneDiv[2].trim();
  const oneP = /^<p(\s[^>]*)?>([\s\S]*?)<\/p>\s*$/i.exec(t);
  if (oneP) return oneP[2].trim();
  return t;
}
