import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { fetchCmsCategories, fetchPageBySlug } from '../../api/cms';
import { API_BASE_URL } from '../../lib/env';

function categoryHeaderOrder(cat) {
  const placements = cat.placement || [];
  const h = placements.find((p) => p.type === 'header');
  if (h && typeof h.sortOrder === 'number') return h.sortOrder;
  return typeof cat.sortOrder === 'number' ? cat.sortOrder : 999;
}

function normalizeTemplateValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isWhiteHeaderTemplate(page) {
  if (!page) return false;
  const templateKey = normalizeTemplateValue(page.templateKey);
  const category = normalizeTemplateValue(page.category);

  return (
    templateKey.includes('contactus') ||
    templateKey.includes('innerpage') ||
    templateKey.includes('portfolio') ||
    category.includes('contactus') ||
    category === 'contact' ||
    category.includes('innerpage') ||
    category.includes('portfolio')
  );
}

function normalizePath(path) {
  if (!path) return '/';
  const normalized = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  return normalized || '/';
}

export default function SiteHeader() {
  const { pathname } = useLocation();
  const [categories, setCategories] = useState([]);
  const [failed, setFailed] = useState(false);
  const [whiteHeaderByTemplate, setWhiteHeaderByTemplate] = useState(false);

  useEffect(() => {
    if (!API_BASE_URL) {
      setFailed(true);
      setCategories([]);
      return;
    }
    fetchCmsCategories({ status: true, placement: 'header' })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        const headerCats = list.filter(
          (c) =>
            c.status !== false &&
            Array.isArray(c.placement) &&
            c.placement.some((p) => p.type === 'header'),
        );
        headerCats.sort((a, b) => categoryHeaderOrder(a) - categoryHeaderOrder(b));
        setCategories(headerCats);
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    const currentPath = normalizePath(pathname);
    if (!API_BASE_URL || currentPath === '/') {
      setWhiteHeaderByTemplate(false);
      return;
    }

    const slug = currentPath.replace(/^\//, '');
    let cancelled = false;

    fetchPageBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        setWhiteHeaderByTemplate(isWhiteHeaderTemplate(res?.data));
      })
      .catch(() => {
        if (!cancelled) {
          setWhiteHeaderByTemplate(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const navLinks = useMemo(() => {
    const fallback = [
      { slug: 'about-us', label: 'About Us', to: '/about-us' },
      { slug: 'approach', label: 'Approach', to: '/approach' },
      { slug: 'contact', label: 'Contact', to: '/contact' },
      { slug: 'portfolio', label: 'Portfolio', to: '/portfolio' },
    ];
    if (!failed && categories.length > 0) {
      return categories
        .filter((c) => c.slug)
        .map((c) => ({
          slug: c.slug,
          label: c.name || c.slug,
          to: c.slug === 'home' ? '/' : `/${c.slug}`,
        }));
    }
    return fallback;
  }, [categories, failed]);

  const navWhite =
    pathname === '/contact' ||
    pathname === '/contact-us' ||
    pathname === '/portfolio' ||
    pathname.endsWith('/contact') ||
    pathname.endsWith('/contact-us') ||
    pathname.endsWith('/portfolio') ||
    whiteHeaderByTemplate;

  const currentPath = normalizePath(pathname);

  return (
    <header className="header-section">
      <div className="container">
        <div className="header-flex">
          <div className="header-left">
            <div className="logo">
              <Link to="/">
                <img src="/assets/images/quadquities.svg" alt="Quad Equities" className="w-100" />
              </Link>
            </div>
          </div>
          <div className="header-right">
            <button
              className="menu-hemburger d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#MenuNavbar"
              aria-controls="MenuNavbar"
            >
              <span className="d-none d-lg-inline">Menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16.159" viewBox="0 0 24 16.159">
                <path d="M24,16.159H0V14.383H24v1.775Zm0-4.964H0V9.418H24v1.775Zm0-4.756H0V0H24V6.438ZM1.776,1.776V4.663H22.225V1.776Z" />
              </svg>
            </button>

            <div className={`nav-list d-none d-lg-flex${navWhite ? ' nav-white' : ''}`}>
              {navLinks.map((item) => (
                <Link
                  key={item.slug}
                  to={item.to}
                  className={normalizePath(item.to) === currentPath ? 'nav-active' : ''}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div
              className="MenuNavbar-offcanvas offcanvas w-100 h-100 offcanvas-top"
              style={{ backgroundImage: "url('/assets/images/burger-menu-bg.svg')" }}
              tabIndex={-1}
              id="MenuNavbar"
              aria-labelledby="MenuNavbarLabel"
            >
              <div className="offcanvas-header">
                <div className="container">
                  <div className="w-100 d-flex align-items-center justify-content-between">
                    <div className="logo">
                      <img src="/assets/images/logo.png" alt="Quad Equities" />
                    </div>
                    <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close">
                      Close
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17.11" height="17.11" viewBox="0 0 17.11 17.11">
                          <path d="M8.555,9.969,1.414,17.11,0,15.7,7.141,8.555,0,1.414,1.414,0,8.555,7.141,15.7,0,17.11,1.414,9.969,8.555,17.11,15.7,15.7,17.11Z" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="offcanvas-body d-flex justify-content-between flex-column">
                <div className="container h-100">
                  <ul className="menu-list h-100">
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    {navLinks
                      .filter((item) => item.slug !== 'home')
                      .map((item) => (
                        <li key={item.slug}>
                          <Link to={item.to} className={normalizePath(item.to) === currentPath ? 'nav-active' : ''}>
                            {item.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="menu-copyright">
                  <div className="container">
                    <div className="row">
                      <div className="col-8">
                        <p>&copy; Copyright 2026 QuadEquities</p>
                      </div>
                      <div className="col-4">
                        <ul className="menu-social-links">
                          <li>
                            <a href="/">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                              </svg>
                            </a>
                          </li>
                          <li>
                            <a href="/">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect width="4" height="12" x="2" y="9" />
                                <circle cx="4" cy="4" r="2" />
                              </svg>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
