import HeroSwiper from '../HeroSwiper';
import CardRow from '../CardRow';
import { ArrowLink } from '../ArrowLink';
import { pickLang, resolveAssetUrl } from '../../utils/cmsText';
import { API_BASE_URL } from '../../lib/env';

/**
 * HOMEPAGE_V1 — fields live in `page.content`.
 */
export default function HomepageTemplateRenderer({ page }) {
  const base = API_BASE_URL;
  const c = page.content && typeof page.content === 'object' ? page.content : {};
  const templateKey = String(page.templateKey || '').toLowerCase();
  const isDedicatedHomeTemplate = templateKey === 'home_template' || page.templateKey === 'HOMEPAGE_V1';

  const bannerTitle = pickLang(c.bannerTitle);
  const bannerDescription = pickLang(c.bannerDescription);
  const bannerIntro = prepareHeroIntroHtml(bannerDescription);
  const bannerImage = resolveAssetUrl(c.bannerImage, base);

  const rows = [];
  for (let i = 1; i <= 8; i++) {
    const t = pickLang(c[`section${i}Title`]);
    const d = pickLang(c[`section${i}Description`]);
    const category = pickLang(c[`section${i}Category`]);
    const logo = resolveAssetUrl(c[`section${i}Logo`], base);
    const logoHover = resolveAssetUrl(c[`section${i}LogoHover`], base);
    const buttonText = pickLang(c[`section${i}ButtonText`]);
    const buttonLink = normalizeLink(pickLang(c[`section${i}ButtonLink`]) || c[`section${i}ButtonLink`]);
    const img = resolveAssetUrl(c[`section${i}Image`], base);
    if (!t && !d && !img && !category && !logo) continue;

    const footer =
      isDedicatedHomeTemplate && buttonText && buttonLink ? (
        <ArrowLink to={buttonLink}>{buttonText}</ArrowLink>
      ) : null;

    rows.push(
      <CardRow key={i} imageAlt={t || `Section ${i}`} imageSrc={img || '/assets/images/termly_img.png'} footer={footer}>
        {category ? <h6 dangerouslySetInnerHTML={{ __html: category }} /> : null}
        {logo ? (
          <div className="hover-logo">
            <img src={logo} className="img-default" alt={t || `Logo ${i}`} />
            <img src={logoHover || logo} className="img-hover" alt={t || `Logo ${i}`} />
          </div>
        ) : null}
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
              <div className="slide-content">
                {bannerIntro.html ? (
                  bannerIntro.tag === 'h2' ? (
                    <h2 dangerouslySetInnerHTML={{ __html: bannerIntro.html }} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: bannerIntro.html }} />
                  )
                ) : null}
              </div>
            </HeroSwiper>
          </div>
        ) : null}
      </section>
      {rows}
    </>
  );
}

function normalizeLink(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/')) {
    return v;
  }
  return `/${v}`;
}

function prepareHeroIntroHtml(html) {
  const raw = String(html || '').trim();
  if (!raw) return { tag: 'h2', html: '' };

  // If content is a single <p>...</p>, render it as h2 to match static home styling.
  const oneParagraph = /^<p(\s[^>]*)?>([\s\S]*?)<\/p>\s*$/i.exec(raw);
  if (oneParagraph) {
    return { tag: 'h2', html: oneParagraph[2].trim() };
  }

  if (!/<\/?[a-z][\s\S]*>/i.test(raw)) {
    return { tag: 'h2', html: raw };
  }

  return { tag: 'div', html: raw };
}
