import { pickLang, resolveAssetUrl } from '../../utils/cmsText';
import { API_BASE_URL } from '../../lib/env';

/**
 * 2×2 product layout: 3 image cells + 1 rich text cell (Termly-style).
 * Set on a page section: sectionLayout: "quad-grid", plus:
 * topLeftImage, topRightImage, bottomLeftHeading, bottomLeftDescription (HTML),
 * bottomRightUrl, bottomRightLinkLabel, verticalLabel, partnerLogos: [{ imageUrl, href }]
 */
export default function QuadGridSection({ section, baseUrl = API_BASE_URL }) {
  const topL = resolveAssetUrl(section.topLeftImage, baseUrl);
  const topR = resolveAssetUrl(section.topRightImage, baseUrl);
  const head = pickLang(section.bottomLeftHeading);
  const body = pickLang(section.bottomLeftDescription);
  const extUrl = section.bottomRightUrl || section.bottomRightExternalUrl;
  const extLabel = pickLang(section.bottomRightLinkLabel) || 'Visit';
  const vLabel = pickLang(section.verticalLabel) || 'MORE PORTFOLIO STORIES';
  const partners = Array.isArray(section.partnerLogos) ? section.partnerLogos : [];

  return (
    <div className="pt-4 px-0">
      <div className="row g-0 align-items-center border-gray">
        <div className="col-lg-6 p-5 p-lg-0">
          {topL ? <img src={topL} alt="" width="100%" /> : null}
        </div>
        <div className="col-lg-6 border-gray">
          {topR ? <img src={topR} alt="" className="product-img w-100" /> : null}
        </div>
      </div>
      <div className="row g-0">
        <div className="col-lg-6 border-gray py-5 pe-2">
          {head ? <h4 style={{ color: 'beige' }}>{head}</h4> : null}
          {body ? <div className="quad-body" dangerouslySetInnerHTML={{ __html: body }} /> : null}
        </div>
        <div className="col-lg-6 border-gray py-5 px-5 text-white">
          {extUrl ? (
            <a
              href={extUrl}
              target="_blank"
              rel="noreferrer"
              className="vignette-link-external d-flex gap-4 text-white text-decoration-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ stroke: 'white' }} viewBox="0 0 24 24">
                <path d="M12,24A12,12,0,1,1,24,12,12.014,12.014,0,0,1,12,24ZM9.442,16A15.512,15.512,0,0,0,12,21.744,15.372,15.372,0,0,0,14.557,16ZM2.833,16a10.032,10.032,0,0,0,6.755,5.716A17.567,17.567,0,0,1,7.4,16ZM16.6,16a17.711,17.711,0,0,1-2.174,5.693A10.1,10.1,0,0,0,21.167,16Zm.238-6a20.171,20.171,0,0,1,.048,4H21.8a10.031,10.031,0,0,0,0-4H16.837ZM9.176,10a17.963,17.963,0,0,0-.053,4h5.753a18.036,18.036,0,0,0-.053-4ZM2.2,10a10.157,10.157,0,0,0,0,4H7.115a19.973,19.973,0,0,1,.047-4ZM14.367,2.292A20.31,20.31,0,0,1,16.513,8h4.654A10.1,10.1,0,0,0,14.367,2.292ZM12,2.223A18.7,18.7,0,0,0,9.536,8h4.927A18.518,18.518,0,0,0,12,2.223Zm-2.354.048A10.028,10.028,0,0,0,2.833,8H7.486A20.317,20.317,0,0,1,9.644,2.271Z" />
              </svg>
              {extLabel}
            </a>
          ) : null}
          <div className="row py-5">
            <div className="col-md-2">
              <div className="founder-strip portfolio-stories pe-2">
                <span>{vLabel}</span>
              </div>
            </div>
            <div className="col-md-10">
              {partners.map((p, i) => {
                const src = resolveAssetUrl(p.imageUrl || p.url, baseUrl);
                const href = p.href || p.url || '#';
                if (!src) return null;
                return (
                  <div className="py-3" key={i}>
                    <a href={href} target="_blank" rel="noreferrer" className="other-vignette-link vignette-trigger">
                      <img
                        width="220"
                        height="53"
                        src={src}
                        className="attachment-portfolio-logo size-portfolio-logo"
                        alt=""
                        decoding="async"
                      />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
