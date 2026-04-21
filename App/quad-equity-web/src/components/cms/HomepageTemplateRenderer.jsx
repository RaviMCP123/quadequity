import HeroSwiper from '../HeroSwiper';
import CardRow from '../CardRow';
import { pickLang, resolveAssetUrl } from '../../utils/cmsText';
import { API_BASE_URL } from '../../lib/env';

/**
 * HOMEPAGE_V1 — fields live in `page.content`.
 */
export default function HomepageTemplateRenderer({ page }) {
  const base = API_BASE_URL;
  const c = page.content && typeof page.content === 'object' ? page.content : {};

  const bannerTitle = pickLang(c.bannerTitle);
  const bannerDescription = pickLang(c.bannerDescription);
  const bannerImage = resolveAssetUrl(c.bannerImage, base);

  const rows = [];
  for (let i = 1; i <= 6; i++) {
    const t = pickLang(c[`section${i}Title`]);
    const d = pickLang(c[`section${i}Description`]);
    const img = resolveAssetUrl(c[`section${i}Image`], base);
    if (!t && !d && !img) continue;

    rows.push(
      <CardRow key={i} imageAlt={t || `Section ${i}`} imageSrc={img || '/assets/images/termly_img.png'}>
        {t ? <h2 dangerouslySetInnerHTML={{ __html: t }} /> : null}
        {d ? <div dangerouslySetInnerHTML={{ __html: d }} /> : null}
      </CardRow>,
    );
  }

  return (
    <>
      <section className="hero-section">
        {bannerImage ? (
          <div className="banner-img">
            <img src={bannerImage} alt="" />
            {bannerTitle ? (
              <div className="content">
                <h1 dangerouslySetInnerHTML={{ __html: bannerTitle }} />
              </div>
            ) : null}
          </div>
        ) : bannerTitle ? (
          <div className="container py-5">
            <h1 dangerouslySetInnerHTML={{ __html: bannerTitle }} />
          </div>
        ) : null}
        {bannerDescription ? (
          <div className="d-none d-lg-block banner-content">
            <HeroSwiper>
              <div dangerouslySetInnerHTML={{ __html: bannerDescription }} />
            </HeroSwiper>
          </div>
        ) : null}
      </section>
      {rows}
    </>
  );
}
