import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/navbar/Navbar';
import ClickSpark from './components/ClickSpark';
import Loading from './components/loading/Loading';
import './App.css';

// Lazy-loaded route components
const Home = lazy(() => import('./pages/home/Home'));
const ProjectsLayout = lazy(() => import('./pages/ProjectsLayout'));
const BlogLayout = lazy(() => import('./pages/blogs/BlogLayout'));
const HowToPlanAProject = lazy(() => import('./pages/blogs/HowToPlanAProject'));
const ResumeLayout = lazy(() => import('./pages/resume/ResumeLayout'));
const AnalyticsLayout = lazy(() => import('./pages/analytics/AnalyticsLayout'));
const UsesLayout = lazy(() => import('./pages/uses/UsesLayout'));
const SupportLayout = lazy(() => import('./pages/support/SupportLayout'));
const AdZeroPreview = lazy(() => import('./pages/projects/AdZeroPreview'));
const PageNotFound = lazy(() => import('./pages/notFound/PageNotFound'));

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <ClickSpark sparkColor="#ffffff" sparkSize={10} sparkRadius={16}>
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
            <Route path="/analytics" element={<AnalyticsLayout />} />
            <Route path="/support" element={<SupportLayout />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
        <Analytics />
      </ClickSpark>
    </BrowserRouter>
  );
}
