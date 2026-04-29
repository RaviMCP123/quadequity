import HeroSwiper from '../HeroSwiper';
import CardRow from '../CardRow';
import { ArrowLink, ArrowLinkIcon } from '../ArrowLink';
import { Bullet, BulletLead } from '../Bullet';
import { pickLang, resolveAssetUrl, stripCmsInlineStyles } from '../../utils/cmsText';
import { API_BASE_URL } from '../../lib/env';
import QuadGridSection from './QuadGridSection';

/**
 * Renders a CMS page in the same layout as the static About (and Approach) page:
 * split hero (banner + overlay title + HeroSwiper lead on large screens), then
 * card-section + CardRow strips (image | content).
 */
export default function PageTemplateRenderer({ page, variant = 'default' }) {
  const base = API_BASE_URL;
  const titleLine = formatBannerTitleForHero(
    stripCmsInlineStyles(pickLang(page.bannerTitle) || ''),
  );
  const bannerFromApi = resolveAssetUrl(page.bannerImage, base);
  // Left side text: "Description text" from admin.
  const leftDescription = stripCmsInlineStyles(pickLang(page.description) || '');
  // Right side text: "Intro text (right column, large)" from admin.
  const swiperCopyHtml = normalizeBannerDescriptionHtml(pickLang(page.bannerDescription) || '');
  const heroImage = bannerFromApi || '';
  const shouldRenderHero = Boolean(heroImage || titleLine || leftDescription || swiperCopyHtml);

  const sections = Array.isArray(page.pageSections) ? page.pageSections : [];

  return (
    <>
      {shouldRenderHero && (
        <section className="hero-section">
          {heroImage ? (
            <div className="banner-img">
              <img src={heroImage} alt={stripHtmlToPlain(titleLine) || 'Page'} />
              {titleLine || leftDescription ? (
                <div
                  className="content"
                  style={{ top: 0, bottom: 0, height: "100%", justifyContent: "center" }}
                >
                  <div className="d-flex flex-column gap-3 w-100 align-items-start justify-content-center">
                    {titleLine ? (
                      <h1 style={{ width: "100%", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: titleLine }} />
                    ) : null}
                    {leftDescription ? (
                      <div
                        className="cms-left-description"
                        style={{ color: "#fff", width: "100%", textAlign: "left" }}
                      >
                        {renderSectionDescription(leftDescription)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (titleLine || leftDescription) ? (
            <div
              className="container py-5 d-flex flex-column align-items-start justify-content-center"
              style={{ minHeight: "60vh" }}
            >
              {titleLine ? (
                <h1 style={{ width: "100%", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: titleLine }} />
              ) : null}
              {leftDescription ? (
                <div
                  className="cms-left-description mt-3"
                  style={{ color: "#fff", width: "100%", textAlign: "left" }}
                >
                  {renderSectionDescription(leftDescription)}
                </div>
              ) : null}
            </div>
          ) : null}
          {swiperCopyHtml
            ? (() => {
                const intro = prepareHeroIntro(swiperCopyHtml);
                if (!intro.html) return null;
                const Tag = intro.tag;
                return (
                  <div className="d-none d-lg-block banner-content">
                    <HeroSwiper>
                      <div className="slide-content">
                        {intro.html ? (
                          <Tag className="cms-banner-description" dangerouslySetInnerHTML={{ __html: intro.html }} />
                        ) : null}
                      </div>
                    </HeroSwiper>
                  </div>
                );
              })()
            : null}
        </section>
      )}

      {sections.map((section, idx) => {
        if (section.sectionLayout === 'quad-grid') {
          return (
            <section key={idx} className="section-product">
              <div className="container">
                <QuadGridSection section={section} />
              </div>
            </section>
          );
        }

        const title = stripCmsInlineStyles(pickLang(section.title));
        const subtitle = stripCmsInlineStyles(pickLang(section.subtitle));
        const description = stripCmsInlineStyles(pickLang(section.description));
        const imageAltFromText = (() => {
          const plain = stripHtmlToPlain(description || title || '');
          if (!plain) return `Section ${idx + 1}`;
          return plain.length > 120 ? `${plain.slice(0, 117)}…` : plain;
        })();
        const img =
          Array.isArray(section.images) && section.images[0]
            ? resolveAssetUrl(section.images[0], base)
            : '';
        const imageUrl = img || '';

        const buttonText = pickLang(section.buttonText);
        const buttonUrl = section.buttonUrl || '';
        const internal = buttonUrl && !/^https?:\/\//i.test(buttonUrl);
        const footerLink =
          buttonText && buttonUrl ? (
            internal ? (
              <ArrowLink to={buttonUrl.startsWith('/') ? buttonUrl : `/${buttonUrl}`}>{buttonText}</ArrowLink>
            ) : (
              <a
                href={buttonUrl}
                className="border-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                <p className="m-0 d-flex justify-content-between align-items-center">
                  {buttonText}
                  <ArrowLinkIcon />
                </p>
              </a>
            )
          ) : null;

        return (
          <CardRow
            key={idx}
            imageAlt={imageAltFromText}
            imageSrc={imageUrl}
            footer={variant === 'portfolio' ? null : footerLink}
          >
            {title ? renderCmsHeading('h2', title) : null}
            {subtitle ? renderCmsHeading('h3', subtitle, 'h5') : null}
            {description ? renderSectionDescription(description) : null}
          </CardRow>
        );
      })}
    </>
  );
}

/**
 * Hero intro rendering:
 * - Plain text (no HTML tags) => h2, using site defaults.
 * - HTML from admin => div, keep markup exactly so inline styles are preserved.
 */
function prepareHeroIntro(html) {
  const t = (html || '').trim();
  if (!t) return { tag: 'h2', html: '' };
  const oneRootP = extractSingleParagraphInnerHtml(t);
  if (oneRootP) return { tag: 'h2', html: oneRootP };
  if (!/<\/?[a-z][\s\S]*>/i.test(t)) {
    return { tag: 'h2', html: t };
  }
  return { tag: 'div', html: t };
}

/**
 * Remove inline style/color/size noise from CKEditor output so banner intro follows
 * website CSS (.hero-section .banner-content .swiper-slide .slide-content p).
 */
function normalizeBannerDescriptionHtml(value) {
  const raw = String(value || '').replace(/\u200B/g, '').trim();
  if (!raw) return '';
  if (!/<\/?[a-z][\s\S]*>/i.test(raw)) return raw;
  return raw
    .replace(/\sstyle="[^"]*"/gi, '')
    .replace(/\sstyle='[^']*'/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .trim();
}

/**
 * Unwrap common CKEditor wrappers and return inner HTML when content is effectively
 * one paragraph so we can render it as <h2> (matching static About typography).
 */
function extractSingleParagraphInnerHtml(raw) {
  let t = String(raw || '').trim();
  if (!t) return '';

  // Peel redundant single-root <div> wrappers.
  for (let i = 0; i < 4; i += 1) {
    const m = /^<div(\s[^>]*)?>\s*([\s\S]*?)\s*<\/div>\s*$/i.exec(t);
    if (!m) break;
    // Stop if there are sibling block tags at this level.
    const inner = (m[2] || '').trim();
    if (/<\/div>\s*</i.test(inner)) break;
    t = inner;
  }

  const oneRootP = /^<p(\s[^>]*)?>([\s\S]*?)<\/p>\s*$/i.exec(t);
  if (oneRootP) return oneRootP[2].trim();
  return '';
}

function stripHtmlToPlain(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** True if string looks like HTML from legacy CKEditor (otherwise treat as plain textarea). */
function looksLikeHtmlMarkup(s) {
  if (!s || typeof s !== 'string') return false;
  return /<\/?[a-z][\s\S]*>/i.test(s.trim());
}

function renderCmsHeading(tag, content, extraClass) {
  const Tag = tag;
  if (looksLikeHtmlMarkup(content)) {
    return <Tag className={extraClass} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return (
    <Tag className={extraClass} style={{ whiteSpace: 'pre-wrap' }}>
      {content}
    </Tag>
  );
}

/**
 * API plain text (About-style):
 * - Paragraphs split by blank line (\n\n).
 * - First paragraph: line 1 → <h2>, or 3 short lines + body → <h2> with <br /> like “Measured / Structured / Accountable”.
 * - Remaining lines in first paragraph: pairs → <BulletLead>, else <Bullet>.
 * - Later paragraphs: same pairing (Venture Creation + body, etc.).
 * Legacy HTML → same flex wrapper as CardRow children.
 */
function renderSectionDescription(content) {
  if (!content || !String(content).trim()) return null;
  if (looksLikeHtmlMarkup(content)) {
    return (
      <div
        className="d-flex flex-column gap-md-4"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const normalized = String(content).replace(/\r\n/g, '\n').trim();
  const blocks = normalized
    .split(/\n\n+/)
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((b) => b.length > 0);

  if (blocks.length === 0) return null;

  const nodes = [];
  let k = 0;

  const pushRemainderAsPairs = (remain, prefix) => {
    let j = 0;
    while (j < remain.length) {
      if (j + 1 < remain.length) {
        nodes.push(
          <BulletLead key={`${prefix}-bl-${k++}`} title={remain[j]}>
            {remain[j + 1]}
          </BulletLead>,
        );
        j += 2;
      } else {
        nodes.push(<Bullet key={`${prefix}-b-${k++}`}>{remain[j]}</Bullet>);
        j += 1;
      }
    }
  };

  const first = blocks[0];
  if (
    first.length >= 4 &&
    isShortHeadingLine(first[0]) &&
    isShortHeadingLine(first[1]) &&
    isShortHeadingLine(first[2])
  ) {
    nodes.push(
      <h2 key={`h2-${k++}`}>
        {first[0]}
        <br />
        {first[1]}
        <br />
        {first[2]}
      </h2>,
    );
    pushRemainderAsPairs(first.slice(3), 'p0');
  } else {
    nodes.push(<h2 key={`h2-${k++}`}>{first[0]}</h2>);
    pushRemainderAsPairs(first.slice(1), 'p0');
  }

  for (let bi = 1; bi < blocks.length; bi++) {
    pushRemainderAsPairs(blocks[bi], `p${bi}`);
  }

  return <>{nodes}</>;
}

/** Lines that look like stacked hero words (Measured / Structured / Accountable), not body copy. */
function isShortHeadingLine(s) {
  const t = (s || '').trim();
  if (!t || t.length > 52) return false;
  if (/[.!?]['"]?$/.test(t)) return false;
  return true;
}

/**
 * Plain banner title without HTML: turn space-separated headline words into <br /> like static About.
 */
function formatBannerTitleForHero(s) {
  const t = (s || '').trim();
  if (!t || /<[a-z]/i.test(t)) return t;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 3 && words.length <= 10) {
    return words.join('<br /> ');
  }
  return t;
}
