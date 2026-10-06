import { lazy, Suspense, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import FallbackLoading from '@/components/FallbackLoading';
import Footer from '@/components/layout/Footer';
import Preloader from '@/components/Preloader';

const TopNavigationBar = lazy(() => import('@/components/layout/TopNavigationBar'));
const VerticalNavigationBar = lazy(() => import('@/components/layout/VerticalNavigationBar'));

const AdminLayout = ({ children }) => {
  const { pathname } = useLocation();
  const previousPathname = useRef(null);

  useLayoutEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="wrapper">
      <Suspense fallback={<FallbackLoading />}>
        <TopNavigationBar />
      </Suspense>

      <Suspense fallback={<FallbackLoading />}>
        <VerticalNavigationBar />
      </Suspense>

      <div className="page-content">
        <div className="container-xxl">
          <Suspense fallback={<Preloader />}>{children}</Suspense>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
