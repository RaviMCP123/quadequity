/**
 * Two-column card layout used on About / Approach pages.
 */
export default function CardRow({ imageAlt, imageSrc = '/assets/images/termly_img.png', children, footer }) {
  return (
    <section className="card-section">
      <div className="container">
        <div className="hover-parent row gap-3 gap-md-4 gap-lg-0 g-0 align-items-stretch">
          <div className="row col-12 p-4 py-2 p-md-0  col-md-6 g-0 line-before" style={{ position: 'relative' }}>
            <div className="d-none d-md-block col-md-1 hover-child">
              <div className="founder-strip">
                <span />
              </div>
            </div>
            <div className="col-md-11 p-0 hover-child">
              <img src={imageSrc} className="w-100 h-100" alt={imageAlt} />
            </div>
          </div>
          <div className="col-12 col-md-6 hover-child d-flex flex-column justify-content-between p-md-2 p-lg-5 p-4">
            <div className="d-flex flex-column gap-md-4">{children}</div>
            {footer}
          </div>
        </div>
      </div>
    </section>
  );
}
