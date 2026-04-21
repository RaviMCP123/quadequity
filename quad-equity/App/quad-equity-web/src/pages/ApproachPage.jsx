import HeroSwiper from '../components/HeroSwiper';
import CardRow from '../components/CardRow';
import { ArrowLink } from '../components/ArrowLink';
import { Bullet } from '../components/Bullet';

export default function ApproachPage() {
  return (
    <>
      <section className="hero-section">
        <div className="banner-img">
          <img src="/assets/images/banner.jpg" alt="Sydney CBD architecture aerial view" />
          <div className="content">
            <h1>Disciplined by Design. </h1>
          </div>
        </div>
        <div className="d-none d-lg-block banner-content">
          <HeroSwiper>
            <h2>
              <span>Quad Equities</span> applies structured capital allocation and active oversight to build ventures
              designed for long-term performance.{' '}
            </h2>
          </HeroSwiper>
        </div>
      </section>

      <CardRow imageAlt="Structure Before Scale">
        <h2>Structure Before Scale</h2>
        <Bullet>We prioritise clarity of model, and capital efficiency before growth.</Bullet>
        <Bullet>Momentum follows structure — not the reverse.</Bullet>
        <Bullet>Our focus is disciplined growth — not rapid expansion.</Bullet>
      </CardRow>

      <CardRow imageAlt="Opportunity">
        <h2>Opportunity</h2>
        <Bullet>
          We pursue businesses with defined fundamentals, scalable economics and measurable pathways to value creation.
        </Bullet>
        <Bullet>Selective by design.</Bullet>
      </CardRow>

      <CardRow imageAlt="Capital">
        <h2>Capital</h2>
        <Bullet>Capital is deployed deliberately.</Bullet>
        <Bullet>Risk is calibrated.</Bullet>
        <Bullet>Balance sheet integrity is preserved.</Bullet>
        <Bullet>Growth is earned — not forced.</Bullet>
      </CardRow>

      <CardRow imageAlt="Oversight">
        <h2>Oversight</h2>
        <Bullet>We maintain active involvement in strategy, governance and execution.</Bullet>
        <Bullet>Accountability is embedded at every stage.</Bullet>
      </CardRow>

      <CardRow imageAlt="Scale">
        <h2>Scale</h2>
        <Bullet>Expansion is structured, not speculative.</Bullet>
        <Bullet>We support ventures through disciplined market entry and measured international growth.</Bullet>
      </CardRow>

      <CardRow imageAlt="Alignment is Foundational">
        <h2>Alignment is Foundational</h2>
        <Bullet>We partner with operators who value transparency, discipline and long-term alignment.</Bullet>
        <Bullet>We do not pursue volume.</Bullet>
        <Bullet>We pursue durability.</Bullet>
      </CardRow>

      <CardRow
        imageAlt="Built to Endure"
        footer={<ArrowLink to="/portfolio">Explore Portfolio</ArrowLink>}
      >
        <h2>Built to Endure</h2>
        <Bullet>
          Our approach is designed for resilience across market cycles and sustained value creation over time.
        </Bullet>
      </CardRow>
    </>
  );
}
