import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or is no longer available.",
}) {
  useEffect(() => {
    document.title = '404 | Quad Equities';

    const header = document.querySelector('.header-section');
    const footer = document.querySelector('footer');
    const previousHeaderDisplay = header instanceof HTMLElement ? header.style.display : '';
    const previousFooterDisplay = footer instanceof HTMLElement ? footer.style.display : '';

    if (header instanceof HTMLElement) {
      header.style.display = 'none';
    }
    if (footer instanceof HTMLElement) {
      footer.style.display = 'none';
    }

    return () => {
      if (header instanceof HTMLElement) {
        header.style.display = previousHeaderDisplay;
      }
      if (footer instanceof HTMLElement) {
        footer.style.display = previousFooterDisplay;
      }
    };
  }, []);

  return (
    <section className="py-5" style={{ background: '#0e1a2b', minHeight: '100vh' }}>
      <div className="container">
        <div
          className="mx-auto text-center"
          style={{
            maxWidth: '720px',
            padding: '72px 24px',
            color: '#f8f5ef',
          }}
        >
          <p
            style={{
              color: '#c9a962',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            404 Error
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 4.6rem)',
              lineHeight: 1.05,
              marginBottom: '18px',
              color: '#ffffff',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.82)',
              marginBottom: '32px',
            }}
          >
            {message}
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '190px',
              minHeight: '52px',
              padding: '0 24px',
              borderRadius: '999px',
              textDecoration: 'none',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #c9a962 0%, #b08d4a 55%, #8f733c 100%)',
              color: '#0e1a2b',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
