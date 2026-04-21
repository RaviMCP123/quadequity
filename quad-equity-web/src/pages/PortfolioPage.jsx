import { Link } from 'react-router-dom';

export default function PortfolioPage() {
  return (
    <>
      <section className="">
        <div className="">
          <div className="hero-section hero-portfolio">
            <div className="container">
              <div className="px-5 d-flex flex-column gap-3 hero-content">
                <h6>OUR PORTFOLIO — MELBOURNE, VICTORIA</h6>
                <h1>Ventures we&apos;re building for the long term</h1>
                <h3>A curated portfolio of companies across technology, mobility, and financial services.</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="card-section card-portfolio">
        <div className="container">
          <div className="portfolio-content">
            <div className="portfolio-grid portfolio-termly">
              <Link to="/termly" className="d-flex flex-column gap-3 align-items-center">
                <h6>FINTECH · EDUCATION</h6>
                <img src="/assets/images/termly-white.svg" alt="Termly Logo" width="170px" />
                <p className="text-center">
                  Bridging the gap between families and educational institutions through structured school fee instalment
                  solutions.
                </p>
              </Link>
            </div>
            <div className="portfolio-grid portfolio-everydaycar">
              <Link to="/termly" className="d-flex flex-column gap-3 align-items-center">
                <h6>AUTOMOTIVE · SERVICES</h6>
                <img src="/assets/images/everyday-car-logo-white.png" alt="Everday Logo" width="170px" />
                <p className="text-center">
                  Description Accessible, dependable car repair for Australian families and businesses.
                </p>
              </Link>
            </div>
            <div className="portfolio-grid portfolio-coversyou">
              <Link to="/termly" className="d-flex flex-column gap-3 align-items-center">
                <h6>INSURANCE · INSURTECH</h6>
                <img src="/assets/images/cover-you-white.svg" alt="Covers You Logo" width="170px" />
                <p className="text-center">
                  Accessible coverage solutions designed for individuals and families across Australia.
                </p>
              </Link>
            </div>
            <div className="portfolio-grid portfolio-tovride">
              <Link to="/termly" className="d-flex flex-column gap-3 align-items-center">
                <h6>MOBILITY · TRANSPORT</h6>
                <img src="/assets/images/tovride-white.svg" alt="TovRide Logo" width="170px" />
                <p className="text-center">
                  Description A next-generation mobility platform designed for convenience, precision, and smart urban
                  travel.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
