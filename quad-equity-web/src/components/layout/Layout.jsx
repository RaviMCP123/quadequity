import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function Layout() {
  useEffect(() => {
    const onScroll = () => {
      const header = document.querySelector('.header-section');
      if (!header) return;
      if (window.scrollY >= 5) header.classList.add('sticky');
      else header.classList.remove('sticky');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </>
  );
}
