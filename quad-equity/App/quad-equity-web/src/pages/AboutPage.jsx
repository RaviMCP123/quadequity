import HeroSwiper from '../components/HeroSwiper';
import CardRow from '../components/CardRow';
import { ArrowLink } from '../components/ArrowLink';
import { Bullet, BulletLead } from '../components/Bullet';

export default function AboutPage() {
  return (
    <>
      <section className="hero-section">
        <div className="banner-img">
          <img src="/assets/images/banner.jpg" alt="Sydney CBD architecture aerial view" />
          <div className="content">
            <h1>
              Independent <br /> Selective <br /> Long-Term
            </h1>
          </div>
        </div>
        <div className="d-none d-lg-block banner-content">
          <HeroSwiper>
            <h2>
              <span>Quad Equities</span> is a private investment and venture platform focused on building and scaling
              businesses across Australian and international markets.{' '}
            </h2>
          </HeroSwiper>
        </div>
      </section>

      <CardRow imageAlt="An Independent Investment Platform">
        <h2>An Independent Investment Platform</h2>
        <Bullet>Quad Equities operates with a long-horizon mindset.</Bullet>
        <Bullet>
          We deploy capital selectively, maintain active oversight, and prioritise structure over speed.
        </Bullet>
        <Bullet>Our focus is disciplined growth — not rapid expansion.</Bullet>
      </CardRow>

      <CardRow imageAlt="Our Mandate">
        <h2>Our Mandate</h2>
        <BulletLead title="Venture Creation">Building scalable business models with structure and operational discipline.</BulletLead>
        <BulletLead title="Strategic Investment">
          Backing high-conviction opportunities aligned with long-term value creation.
        </BulletLead>
        <BulletLead title="Commercialisation">
          Supporting measured expansion across domestic and international markets.
        </BulletLead>
      </CardRow>

      <CardRow imageAlt="Measured Structured Accountable">
        <h2>
          Measured <br /> Structured <br /> Accountable
        </h2>
        <Bullet>
          We believe durability is built through clarity of structure and disciplined capital management.{' '}
        </Bullet>
        <Bullet>We prioritise resilience across cycles over short-term performance. </Bullet>
        <Bullet>We pursue alignment — not volume. </Bullet>
      </CardRow>

      <CardRow
        imageAlt="Built for Endurance"
        footer={<ArrowLink to="/contact">Contact Us</ArrowLink>}
      >
        <h2>Built for Endurance</h2>
        <Bullet>
          Quad Equities is committed to developing ventures designed to perform sustainably and create lasting value.
        </Bullet>
      </CardRow>
    </>
  );
}
