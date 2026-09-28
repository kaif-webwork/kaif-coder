import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/navbar/Navbar';
import ClickSpark from './components/ClickSpark';
import Loading from './components/loading/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import { usePageTracker } from './hooks/usePageTracker';
import './App.css';

// Lazy-loaded route components with safe retry helper
function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      console.warn('Chunk load error, retrying once...', err);
      // Wait 1.5s and retry once in case of network glitch
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return await factory();
    }
  });
}

const Home = safeLazy(() => import('./pages/home/Home'));
const ProjectsLayout = safeLazy(() => import('./pages/ProjectsLayout'));
const BlogLayout = safeLazy(() => import('./pages/blogs/BlogLayout'));
const HowToPlanAProject = safeLazy(() => import('./pages/blogs/HowToPlanAProject'));
const ResumeLayout = safeLazy(() => import('./pages/resume/ResumeLayout'));
const CertificatesLayout = safeLazy(() => import('./pages/certificates/CertificatesLayout'));
const AnalyticsLayout = safeLazy(() => import('./pages/analytics/AnalyticsLayout'));
const UsesLayout = safeLazy(() => import('./pages/uses/UsesLayout'));
const SupportLayout = safeLazy(() => import('./pages/support/SupportLayout'));
const AdZeroPreview = safeLazy(() => import('./pages/projects/AdZeroPreview'));
const PageNotFound = safeLazy(() => import('./pages/notFound/PageNotFound'));

function PageTracker() {
  usePageTracker();
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <PageTracker />
        <ScrollToTop />
        <Navbar />
        <ClickSpark sparkColor="#ffffff" sparkSize={10} sparkRadius={16}>
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/projects" element={<ProjectsLayout />} />
                <Route path="/projects/adzero" element={<AdZeroPreview />} />
                <Route path="/blogs" element={<BlogLayout />} />
                <Route path="/blogs/how-to-plan-a-project" element={<HowToPlanAProject />} />
                <Route path="/uses" element={<UsesLayout />} />
                <Route path="/resume" element={<ResumeLayout />} />
                <Route path="/certificates" element={<CertificatesLayout />} />
                <Route path="/analytics" element={<AnalyticsLayout />} />
                <Route path="/support" element={<SupportLayout />} />
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <Analytics />
        </ClickSpark>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
