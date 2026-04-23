import { pickLang, resolveAssetUrl } from '../../utils/cmsText';
import { API_BASE_URL } from '../../lib/env';
import { useNavigate } from 'react-router-dom';

/**
 * INNER_PAGE template:
 * - top-left image (required)
 * - top-right image (required)
 * - bottom-left rich text (required)
 * - bottom-right optional block (third image OR logo with link)
 */

function normalizeHref(value) {
  const href = String(value || '').trim();
  if (!href) return '';
  if (/^(https?:)?\/\//i.test(href) || href.startsWith('/')) return href;
  return `https://${href}`;
}

function LogoCard({ image, href, alt }) {
  if (!image) return null;

  const content = (
    <div>
      <img
        src={image}
        alt={alt}
        style={{
          width: '100%',
          maxWidth: '250px',
          maxHeight: '53px',
          objectFit: 'contain',
          objectPosition: 'left center',
        }}
      />
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
      {content}
    </a>
  );
}

export default function InnerPageTemplateRenderer({ page }) {
  const navigate = useNavigate();
  const base = API_BASE_URL;
  const c = page.content && typeof page.content === 'object' ? page.content : {};

  const thirdRightType = String(
    pickLang(c.thirdRightType) || c.thirdRightType || 'image',
  ).toLowerCase();
  const topLeftImage = resolveAssetUrl(c.topLeftImage, base);
  const topRightImage = resolveAssetUrl(c.topRightImage, base);
  const thirdImage = resolveAssetUrl(c.thirdImage, base) || resolveAssetUrl(c.bottomRightImage, base);
  const sideLabel = pickLang(c.sideLabel) || c.sideLabel || 'MORE PORTFOLIO STORIES';
  const logo1Image = resolveAssetUrl(c.logo1Image, base);
  const logo1Url = normalizeHref(pickLang(c.logo1Url) || c.logo1Url);
  const logo2Image = resolveAssetUrl(c.logo2Image, base);
  const logo2Url = normalizeHref(pickLang(c.logo2Url) || c.logo2Url);
  const logo3Image = resolveAssetUrl(c.logo3Image, base);
  const logo3Url = normalizeHref(pickLang(c.logo3Url) || c.logo3Url);
  const logo4Image = resolveAssetUrl(c.logo4Image, base);
  const logo4Url = normalizeHref(pickLang(c.logo4Url) || c.logo4Url);
  const bottomLeftText = pickLang(c.bottomLeftText);

  const logos = [
    { image: logo1Image, href: logo1Url, alt: 'Logo 1' },
    { image: logo2Image, href: logo2Url, alt: 'Logo 2' },
    { image: logo3Image, href: logo3Url, alt: 'Logo 3' },
    { image: logo4Image, href: logo4Url, alt: 'Logo 4' },
  ].filter((item) => item.image);

  return (
    <section className="section-product">
      <div className="container">
        <div className="row g-0">
          <div className="col-lg-1 border-block-gray">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="text-white bg-transparent border-0 p-0"
              style={{ position: 'sticky', top: '120px' }}
            >
              <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 30" fill="currentColor">
                <path d="M4.234,16,19.288,28.47,18,30,0,14.958,18,0l1.29,1.528L4.232,14H48v2Z" />
              </svg>
            </button>
          </div>
          <div className="col-lg-11 row g-0 product-content">
            <div className="row g-0 align-items-center border-gray">
              <div className="col-lg-6 p-5 p-lg-0">
                {topLeftImage ? <img src={topLeftImage} alt="" width="100%" /> : null}
              </div>
              <div className="col-lg-6 border-gray">
                {topRightImage ? <img src={topRightImage} alt="" className="product-img" /> : null}
              </div>
            </div>
            <div className="row g-0">
              <div className="col-lg-6 border-gray py-5 pe-2">
                {bottomLeftText ? (
                  <div dangerouslySetInnerHTML={{ __html: bottomLeftText }} />
                ) : null}
              </div>
              <div className="col-lg-6 border-gray py-5 px-5 text-white">
                {thirdRightType === 'logos' && logos.length > 0 ? (
                  <div className="row py-0">
                    <div className="col-md-2">
                      <div className="founder-strip portfolio-stories pe-2">
                        <span>{sideLabel}</span>
                      </div>
                    </div>
                    <div className="col-md-10">
                      {logos.map((item, idx) => (
                        <div key={`${item.alt}-${idx}`} className="py-3">
                          <LogoCard image={item.image} href={item.href} alt={item.alt} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : thirdImage ? (
                  <img
                    src={thirdImage}
                    alt=""
                    className="w-100"
                    style={{
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
