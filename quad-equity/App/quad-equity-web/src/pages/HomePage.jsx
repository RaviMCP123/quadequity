import { useRef, useState } from 'react';
import HeroSwiper from '../components/HeroSwiper';
import { ArrowLink } from '../components/ArrowLink';

export default function HomePage() {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);

  const toggleBanner = () => {
    const el = contentRef.current;
    if (!el) return;
    if (!expanded) {
      el.classList.add('active');
      el.style.height = `${el.scrollHeight}px`;
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }));
    } else {
      el.style.height = '0px';
      el.classList.remove('active');
    }
    setExpanded(!expanded);
  };

  return (
    <>
      <section className="hero-section">
        <div className="banner-img">
          <img src="/assets/images/banner.jpg" alt="Sydney CBD architecture aerial view" />
          <div className="content">
            <h1>Building Enduring Ventures</h1>
          </div>
          <button type="button" className="scroll-down-btn d-lg-none" id="scrollBtn" onClick={toggleBanner}>
            ↓
          </button>
        </div>
        <div className="banner-content" id="bannerContent" ref={contentRef}>
          <HeroSwiper>
            <h2>
              <span>Quad Equities</span> is a private investment and venture platform deploying disciplined capital
              across Australian and international markets.
            </h2>
          </HeroSwiper>
        </div>
      </section>

      <section className="card-section g-0">
        <div className="container">
          <div className="hover-parent row gap-3 gap-md-4 gap-lg-0 g-0 align-items-stretch">
            <div className="row col-12 p-4 py-2 p-md-0  col-md-6 g-0 line-before" style={{ position: 'relative' }}>
              <div className="d-none d-md-block col-md-1 hover-child">
                <div className="founder-strip">
                  <span />
                </div>
              </div>
              <div className="col-md-11 p-0 hover-child border-inline-gray">
                <img src="/assets/images/termly_img.png" className="w-100 h-100" alt="Termly Portfolio" />
              </div>
            </div>
            <div className="col-12 col-md-6 hover-child d-flex flex-column justify-content-between p-md-2 p-lg-5 p-4">
              <div className="d-flex flex-column gap-2 gap-md-4">
                <div className="d-flex flex-column gap-3">
                  <h6>FINTECH • EDUCATION</h6>
                  <div className="hover-logo">
                    <img src="/assets/images/termly-white.svg" className="img-default" alt="Termly Logo" />
                    <img src="/assets/images/termly-blue.svg" className="img-hover" alt="Termly Logo" />
                  </div>
                </div>
                <p className="mb-0">
                  Bridging the gap between families and educational institutions through structured school fee instalment
                  solutions.
                </p>
              </div>
              <ArrowLink to="/termly">Here is How</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <section className="card-section g-0">
        <div className="container">
          <div className="hover-parent row gap-3 gap-md-4 gap-lg-0 g-0 align-items-stretch">
            <div className="row col-12 p-4 py-2 p-md-0 col-md-6 g-0 line-before" style={{ position: 'relative' }}>
              <div className="d-none d-md-block col-md-1 hover-child">
                <div className="founder-strip">
                  <span />
                </div>
              </div>
              <div className="col-md-11 p-0 hover-child">
                <img src="/assets/images/everyday-car.jpg" className="w-100 h-100" alt="Everyday Cars Portfolio" />
              </div>
            </div>
            <div className="col-12 col-md-6 hover-child d-flex flex-column justify-content-between p-md-2 p-lg-5 p-4">
              <div className="d-flex flex-column gap-2 gap-md-4">
                <div className="d-flex flex-column gap-3">
                  <h6>AUTOMOTIVE • SERVICES</h6>
                  <div className="hover-logo">
                    <img src="/assets/images/everyday-car-logo-white.svg" className="img-default" alt="Everyday Cars Logo" />
                    <img src="/assets/images/everyday-car-logo-black.svg" className="img-hover" alt="Everyday Cars Logo" />
                  </div>
                </div>
                <p className="mb-0">Accessible, dependable car repair for Australian families and businesses.</p>
              </div>
              <ArrowLink to="/termly">Fast Fixes. Fair Prices.</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <section className="card-section g-0 ">
        <div className="container">
          <div className="hover-parent row gap-3 gap-md-4 gap-lg-0 g-0 align-items-stretch">
            <div className="row col-12 p-4 py-2 p-md-0 col-md-6 g-0 line-before" style={{ position: 'relative' }}>
              <div className="d-none d-md-block col-md-1 hover-child">
                <div className="founder-strip">
                  <span />
                </div>
              </div>
              <div className="col-md-11 p-0 hover-child">
                <img src="/assets/images/tovride.png" className="w-100 h-100" alt="TovRide Portfolio" />
              </div>
            </div>
            <div className="col-12 col-md-6 hover-child d-flex flex-column justify-content-between p-md-2 p-lg-5 p-4">
              <div className="d-flex flex-column gap-2 gap-md-4">
                <div className="d-flex flex-column gap-3">
                  <h6>MOBILITY • TRANSPORT</h6>
                  <div className="hover-logo">
                    <img src="/assets/images/tovride-white.svg" className="img-default" alt="TovRide Logo" />
                    <img src="/assets/images/tovride-blue.svg" className="img-hover" alt="TovRide Logo" />
                  </div>
                </div>
                <p className="mb-0">
                  A next-generation mobility platform designed for convenience, precision, and smart urban travel.
                </p>
              </div>
              <ArrowLink to="/termly">Smart Rides, Anytime Anywhere</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <section className="card-section g-0">
        <div className="container">
          <div className="hover-parent row gap-3 gap-md-4 gap-lg-0 g-0 align-items-stretch">
            <div className="row col-12 p-4 py-2 p-md-0 col-md-6 g-0 line-before" style={{ position: 'relative' }}>
              <div className="d-none d-md-block col-md-1 hover-child">
                <div className="founder-strip">
                  <span />
                </div>
              </div>
              <div className="col-md-11 p-0 hover-child">
                <img src="/assets/images/covers-you.jpg" className="w-100 h-100" alt="CoversYou Portfolio" />
              </div>
            </div>
            <div className="col-12 col-md-6 hover-child d-flex flex-column justify-content-between p-md-2 p-lg-5 p-4">
              <div className="d-flex flex-column gap-2 gap-md-4">
                <div className="d-flex flex-column gap-3">
                  <h6>INSURANCE • INSURTECH</h6>
                  <div className="hover-logo">
                    <img src="/assets/images/cover-you-white.svg" className="img-default" alt="CoversYou Logo" />
                    <img src="/assets/images/cover-you-main.svg" className="img-hover" alt="CoversYou Logo" />
                  </div>
                </div>
                <p className="mb-0">Accessible coverage solutions designed for individuals and families across Australia.</p>
              </div>
              <ArrowLink to="/termly">Secure Today, Confident Tomorrow.</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
