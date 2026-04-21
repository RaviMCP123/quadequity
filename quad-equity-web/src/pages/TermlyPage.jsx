import { Link } from 'react-router-dom';

export default function TermlyPage() {
  return (
    <section className="section-product">
      <div className="container">
        <div className="row g-0">
          <div className="col-lg-1 border-block-gray" style={{ position: 'sticky' }}>
            <Link to="/" className="text-white" aria-label="Back to home">
              <svg
                className="arrow-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 30"
                fill="currentColor"
                style={{ position: 'fixed' }}
              >
                <path d="M4.234,16,19.288,28.47,18,30,0,14.958,18,0l1.29,1.528L4.232,14H48v2Z" />
              </svg>
            </Link>
          </div>
          <div className="col-lg-11 row g-0 product-content">
            <div className="row g-0 align-items-center   border-gray">
              <div className="col-lg-6 p-5 p-lg-0">
                <div>
                  <img src="/assets/images/termly-logo-white.png" alt="Termly Logo" width="100%" />
                </div>
              </div>
              <div className="col-lg-6 border-gray">
                <div>
                  <img src="/assets/images/termly_img.png" alt="Termly" className="product-img" />
                </div>
              </div>
            </div>
            <div className="row g-0">
              <div className="col-lg-6 border-gray py-5 pe-2">
                <h4 style={{ color: 'beige' }}>
                  These days, you can do just about anything online—even visit your doctor. So why do you still need to
                  drive across town just to get someone to notarize a document?
                </h4>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. In natus accusamus id dicta saepe quae illo,
                  fugit perferendis ipsa tempora magni eius debitis asperiores, iste qui, commodi sed? Ipsa, ab
                  provident. Sapiente ratione vitae et. Quis, hic ab. Ratione aspernatur ipsum iure, minus cumque
                  natus. Perferendis sapiente labore quo velit?
                </p>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. In natus accusamus id dicta saepe quae illo,
                  fugit perferendis ipsa tempora magni eius debitis asperiores, iste qui, commodi sed? Ipsa, ab
                  provident. Sapiente ratione vitae et. Quis, hic ab. Ratione aspernatur ipsum iure, minus cumque
                  natus. Perferendis sapiente labore quo velit?
                </p>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. In natus accusamus id dicta saepe quae illo,
                  fugit perferendis ipsa tempora magni eius debitis asperiores, iste qui, commodi sed? Ipsa, ab
                  provident. Sapiente ratione vitae et. Quis, hic ab. Ratione aspernatur ipsum iure, minus cumque
                  natus. Perferendis sapiente labore quo velit?
                </p>
              </div>
              <div className="col-lg-6 border-gray py-5 px-5 text-white">
                <a
                  href="https://www.termly.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="vignette-link-external d-flex gap-4 text-white text-decoration-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ stroke: 'white' }} viewBox="0 0 24 24">
                    <path d="M12,24A12,12,0,1,1,24,12,12.014,12.014,0,0,1,12,24ZM9.442,16A15.512,15.512,0,0,0,12,21.744,15.372,15.372,0,0,0,14.557,16ZM2.833,16a10.032,10.032,0,0,0,6.755,5.716A17.567,17.567,0,0,1,7.4,16ZM16.6,16a17.711,17.711,0,0,1-2.174,5.693A10.1,10.1,0,0,0,21.167,16Zm.238-6a20.171,20.171,0,0,1,.048,4H21.8a10.031,10.031,0,0,0,0-4H16.837ZM9.176,10a17.963,17.963,0,0,0-.053,4h5.753a18.036,18.036,0,0,0-.053-4ZM2.2,10a10.157,10.157,0,0,0,0,4H7.115a19.973,19.973,0,0,1,.047-4ZM14.367,2.292A20.31,20.31,0,0,1,16.513,8h4.654A10.1,10.1,0,0,0,14.367,2.292ZM12,2.223A18.7,18.7,0,0,0,9.536,8h4.927A18.518,18.518,0,0,0,12,2.223Zm-2.354.048A10.028,10.028,0,0,0,2.833,8H7.486A20.317,20.317,0,0,1,9.644,2.271Z" />
                  </svg>
                  termly.com
                </a>
                <div className="row py-5">
                  <div className="col-md-2">
                    <div className="founder-strip portfolio-stories pe-2">
                      <span>MORE PORTFOLIO STORIES</span>
                    </div>
                  </div>
                  <div className="col-md-10">
                    <div className="py-3">
                      <a href="https://termly.com" target="_blank" rel="noreferrer" className="other-vignette-link vignette-trigger ">
                        <img
                          width="220"
                          height="53"
                          src="/assets/images/termly-logo-white.png"
                          className="attachment-portfolio-logo size-portfolio-logo"
                          alt="Termly logo"
                          decoding="async"
                        />
                      </a>
                    </div>
                    <div className="py-3">
                      <a href="https://termly.com" target="_blank" rel="noreferrer" className="other-vignette-link vignette-trigger ">
                        <img
                          width="220"
                          height="53"
                          src="/assets/images/tovride-logo-logo.png"
                          className="attachment-portfolio-logo size-portfolio-logo"
                          alt="TovRide Logo"
                          decoding="async"
                        />
                      </a>
                    </div>
                    <div className="py-3">
                      <a href="https://termly.com" target="_blank" rel="noreferrer" className="other-vignette-link vignette-trigger ">
                        <img
                          width="250"
                          height="53"
                          src="/assets/images/coveryou-white.png"
                          className="attachment-portfolio-logo size-portfolio-logo"
                          alt="CoverYou Logo"
                          decoding="async"
                        />
                      </a>
                    </div>
                    <div className="py-3">
                      <a href="https://termly.com" target="_blank" rel="noreferrer" className="other-vignette-link vignette-trigger ">
                        <img
                          width="220"
                          height="53"
                          src="/assets/images/everyday-auto-white.png"
                          className="attachment-portfolio-logo size-portfolio-logo"
                          alt="Everyday Auto logo"
                          decoding="async"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
