import { pickLang, resolveAssetUrl } from '../../utils/cmsText';
import { API_BASE_URL } from '../../lib/env';

/**
 * INNER_PAGE template: 2x2 block
 * - top-left image
 * - top-right image
 * - bottom-left rich text
 * - bottom-right image
 *
 * Uses existing site classes from style.css (section-product, border-gray, product-img).
 */
export default function InnerPageTemplateRenderer({ page }) {
  const base = API_BASE_URL;
  const c = page.content && typeof page.content === 'object' ? page.content : {};

  const topLeftImage = resolveAssetUrl(c.topLeftImage, base);
  const topRightImage = resolveAssetUrl(c.topRightImage, base);
  const bottomRightImage = resolveAssetUrl(c.bottomRightImage, base);
  const bottomLeftText = pickLang(c.bottomLeftText);

  return (
    <section className="section-product">
      <div className="container">
        <div className="row g-0 product-content border-gray">
          <div className="row g-0 align-items-stretch border-gray">
            <div
              className="col-lg-6 p-4 p-lg-5 d-flex align-items-center justify-content-center"
              style={{ minHeight: '360px', backgroundColor: '#0E1A2B' }}
            >
              {topLeftImage ? (
                <img
                  src={topLeftImage}
                  alt=""
                  style={{ width: '100%', maxWidth: '360px', maxHeight: '240px', objectFit: 'contain' }}
                />
              ) : null}
            </div>
            <div
              className="col-lg-6 border-gray d-flex align-items-stretch justify-content-center"
              style={{ minHeight: '360px', backgroundColor: '#0E1A2B' }}
            >
              {topRightImage ? (
                <img
                  src={topRightImage}
                  alt=""
                  className="w-100 h-100"
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                    padding: '18px',
                  }}
                />
              ) : null}
            </div>
          </div>
          <div className="row g-0 align-items-stretch">
            <div className="col-lg-6 border-gray py-4 py-lg-5 pe-lg-2 px-3 px-lg-0">
              {bottomLeftText ? (
                <div dangerouslySetInnerHTML={{ __html: bottomLeftText }} />
              ) : null}
            </div>
            <div
              className="col-lg-6 border-gray d-flex align-items-stretch justify-content-center"
              style={{ minHeight: '360px', backgroundColor: '#0E1A2B' }}
            >
              {bottomRightImage ? (
                <img
                  src={bottomRightImage}
                  alt=""
                  className="w-100 h-100"
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                    padding: '18px',
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
