import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useSEO } from '../../hooks/useSEO';
import { FaGithub, FaAndroid, FaApple, FaGlobe, FaStar, FaShieldAlt } from 'react-icons/fa';
import {
  HiArrowLeft,
  HiArrowRight,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineArrowDownTray,
  HiOutlinePlay,
  HiOutlineSparkles,
  HiOutlineMagnifyingGlass,
  HiOutlineBolt,
  HiOutlineLockClosed,
  HiOutlineSquares2X2,
  HiOutlineArrowsPointingOut,
  HiXMark,
} from 'react-icons/hi2';
import { SiKotlin } from 'react-icons/si';
import SectionTitle from '../../components/sectionTitle/SectionTitle';
import Footer from '../../components/footer/Footer';
import { playClickSound } from '../../utils/sound';
import './AdZeroPreview.css';

const carouselSlides = [
  {
    id: 1,
    title: 'Launch Screen • AdZero - NO ADS. JUST WHAT YOU LOVE.',
    src: '/images/projects/adzero-splash.png',
    type: 'portrait',
    caption: 'Official Splash Screen & Branding',
  },
  {
    id: 2,
    title: 'Home Feed • Smart Categories & Curated Streaming',
    src: '/images/projects/adzero-home.png',
    type: 'portrait',
    caption: 'Home Screen with Categories',
  },
  {
    id: 3,
    title: 'Video Player • 100% Ad-Free Video Playback',
    src: '/images/projects/adzero-player.jpg',
    type: 'portrait',
    caption: 'Video Player & Controls',
  },
  {
    id: 4,
    title: 'Library & Settings • Anonymous, Private & SponsorBlock',
    src: '/images/projects/adzero-library.png',
    type: 'portrait',
    caption: 'Library, History & AdBlock Settings',
  },
];

export default function AdZeroPreview() {
  useSEO({
    title: 'AdZero (v4.4) by Mohd Kaif | 100% Ad-Free Android App • kaifcoder.in',
    description:
      'Download AdZero v4.4 APK built with Kotlin & Material 3 by Mohd Kaif (kaifcoder / kaif coder). Enjoy uninterrupted, sponsor-free media streaming with background playback and privacy.',
    canonical: 'https://www.kaifcoder.in/projects/adzero',
  });

  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Preload all carousel slides into browser memory to eliminate flash/glitch
  useEffect(() => {
    carouselSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });
  }, []);

  const handlePrev = useCallback(() => {
    playClickSound();
    setCurrentSlideIdx((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    playClickSound();
    setCurrentSlideIdx((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
  }, []);

  const handleSelectSlide = (idx: number) => {
    playClickSound();
    setCurrentSlideIdx(idx);
  };

  // Keyboard navigation & escape listener for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, handleNext, handlePrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Trigger swipe when horizontal gesture is stronger than vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX > 0) {
        handleNext(); // Swipe Right -> Next Image
      } else {
        handlePrev(); // Swipe Left -> Previous Image
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleDownloadApk = () => {
    playClickSound();
    setIsDownloading(true);

    const apkUrl = 'https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk';
    window.location.href = apkUrl;

    setTimeout(() => {
      setIsDownloading(false);
    }, 2500);
  };

  const activeSlide = carouselSlides[currentSlideIdx];

  return (
    <div className="adzero-page-wrapper">
      <div className="adzero-page">
        {/* Top Breadcrumb Header */}
        <div className="adzero-top-nav">
          <Link
            to="/projects"
            className="adzero-back-pill"
            onClick={() => playClickSound()}
          >
            <HiArrowLeft /> <span>Back to Projects</span>
          </Link>
        </div>

        <SectionTitle>/projects/adzero</SectionTitle>

        {/* 1. App Hero Card (Play Store Header Style) */}
        <div className="adzero-app-hero-card">
          <div className="adzero-hero-top-row">
            <div className="adzero-app-icon-wrapper">
              <div className="adzero-app-logo-badge">
                <svg viewBox="0 0 40 40" className="adzero-logo-svg">
                  <circle cx="20" cy="20" r="18" fill="#e50914" />
                  <path
                    d="M12 20.5 L17.5 26 L28.5 14"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="adzero-hero-title-area">
              <div className="adzero-title-row">
                <h1 className="adzero-app-title">AdZero</h1>
                <span className="adzero-version-tag">v4.4</span>
              </div>
              <p className="adzero-app-subtitle">
                Entertainment Without Interruptions
              </p>
              <p className="adzero-app-developer">
                A Project by <span className="dev-name">Mohd Kaif</span> • Open Source Android App
              </p>
            </div>
          </div>

          {/* Quick Play Store Stats Bar */}
          <div className="adzero-stats-bar">
            <div className="adzero-stat-col">
              <div className="adzero-stat-val">
                <FaStar className="star-icon" /> <span>5.0</span>
              </div>
              <span className="adzero-stat-lbl">Community Rating</span>
            </div>

            <div className="adzero-stat-divider" />

            <div className="adzero-stat-col">
              <div className="adzero-stat-val">
                <FaAndroid className="android-icon" /> <span>v4.4</span>
              </div>
              <span className="adzero-stat-lbl">Latest Build</span>
            </div>

            <div className="adzero-stat-divider" />

            <div className="adzero-stat-col">
              <div className="adzero-stat-val">
                <FaShieldAlt className="shield-icon" /> <span>100%</span>
              </div>
              <span className="adzero-stat-lbl">Ad-Free & Safe</span>
            </div>

            <div className="adzero-stat-divider" />

            <div className="adzero-stat-col">
              <div className="adzero-stat-val">
                <SiKotlin className="kotlin-icon" /> <span>Native</span>
              </div>
              <span className="adzero-stat-lbl">Kotlin & Material 3</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="adzero-actions-row">
            <a
              href="https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk"
              className="adzero-primary-btn"
              onClick={handleDownloadApk}
            >
              <HiOutlineArrowDownTray className="btn-icon" />
              <span>{isDownloading ? 'Starting Download...' : 'Download APK (v4.4)'}</span>
            </a>

            <a
              href="https://github.com/kaif-webwork/AdZero"
              target="_blank"
              rel="noopener noreferrer"
              className="adzero-secondary-btn"
              onClick={() => playClickSound()}
            >
              <FaGithub className="btn-icon" />
              <span>Source Code</span>
            </a>
          </div>
        </div>

        {/* 2. Interactive Screenshot Carousel Showcase */}
        <div className="adzero-showcase-box">
          <div className="adzero-showcase-header">
            <div className="adzero-header-left">
              <span className="adzero-box-label">App Screenshots & Preview</span>
              <span className="adzero-box-sub">{activeSlide.title}</span>
            </div>
            <div className="adzero-carousel-controls">
              <span className="adzero-slide-counter">
                {currentSlideIdx + 1} / {carouselSlides.length}
              </span>
              <button
                type="button"
                className="adzero-carousel-btn"
                onClick={handlePrev}
                aria-label="Previous image"
                title="Previous image"
              >
                <HiChevronLeft />
              </button>
              <button
                type="button"
                className="adzero-carousel-btn"
                onClick={handleNext}
                aria-label="Next image"
                title="Next image"
              >
                <HiChevronRight />
              </button>
            </div>
          </div>

          {/* Image Display Area */}
          <div
            className="adzero-image-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="adzero-slide-viewport portrait">
              {carouselSlides.map((slide, idx) => (
                <img
                  key={slide.id}
                  src={slide.src}
                  alt={slide.title}
                  className={`adzero-carousel-img portrait ${currentSlideIdx === idx ? 'active' : ''}`}
                  loading="eager"
                  decoding="async"
                  onClick={() => {
                    playClickSound();
                    setIsLightboxOpen(true);
                  }}
                  title="Click to preview full image"
                />
              ))}
            </div>
            <button
              type="button"
              className="adzero-expand-badge"
              onClick={() => {
                playClickSound();
                setIsLightboxOpen(true);
              }}
              title="Fullscreen Preview"
              aria-label="Fullscreen Preview"
            >
              <HiOutlineArrowsPointingOut />
            </button>
          </div>

          {/* Carousel Dots & Thumbnail Indicators */}
          <div className="adzero-carousel-footer">
            <div className="adzero-dots-row">
              {carouselSlides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`adzero-dot ${currentSlideIdx === idx ? 'active' : ''}`}
                  onClick={() => handleSelectSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  title={s.caption}
                />
              ))}
            </div>
            <span className="adzero-current-caption">{activeSlide.caption}</span>
          </div>
        </div>

        {/* Fullscreen Image Preview Lightbox Modal */}
        {isLightboxOpen && (
          <div
            className="adzero-lightbox-overlay"
            onClick={() => setIsLightboxOpen(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="adzero-lightbox-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header bar */}
              <div className="adzero-lightbox-header">
                <div className="adzero-lightbox-info">
                  <span className="adzero-lightbox-title">{activeSlide.title}</span>
                  <span className="adzero-lightbox-counter">
                    {currentSlideIdx + 1} / {carouselSlides.length}
                  </span>
                </div>
                <button
                  type="button"
                  className="adzero-lightbox-close-btn"
                  onClick={() => setIsLightboxOpen(false)}
                  title="Close (Esc)"
                  aria-label="Close fullscreen preview"
                >
                  <HiXMark />
                </button>
              </div>

              {/* Main Preview Image */}
              <div className="adzero-lightbox-body">
                <button
                  type="button"
                  className="adzero-lightbox-nav-btn prev"
                  onClick={handlePrev}
                  title="Previous image"
                  aria-label="Previous image"
                >
                  <HiChevronLeft />
                </button>

                <div className="adzero-lightbox-img-wrapper">
                  <img
                    src={activeSlide.src}
                    alt={activeSlide.title}
                    className="adzero-lightbox-img"
                  />
                </div>

                <button
                  type="button"
                  className="adzero-lightbox-nav-btn next"
                  onClick={handleNext}
                  title="Next image"
                  aria-label="Next image"
                >
                  <HiChevronRight />
                </button>
              </div>

              {/* Footer Caption */}
              <div className="adzero-lightbox-footer">
                <span>{activeSlide.caption}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. About This App Section */}
        <div className="adzero-content-block">
          <h2 className="adzero-block-heading">About This App</h2>
          <p className="adzero-about-text">
            <strong>AdZero</strong> is a modern, high-performance streaming application designed to deliver an uninterrupted media experience. Say goodbye to intrusive video ads, sponsored popups, and buffering delays. Built natively in <strong>Kotlin</strong> with <strong>Material 3</strong> design principles, <strong>Retrofit</strong> networking, and <strong>Firebase</strong> integration.
          </p>
        </div>

        {/* 4. Key Features Grid */}
        <div className="adzero-content-block">
          <h2 className="adzero-block-heading">Key Features</h2>
          <div className="adzero-features-grid">
            <div className="adzero-feature-card">
              <div className="feature-icon-box red-glow">
                <HiOutlineSparkles />
              </div>
              <h3 className="feature-title">100% Ads Free Experience</h3>
              <p className="feature-desc">
                Stream videos, podcasts, and trailers without commercial breaks, popups, or annoying banners.
              </p>
            </div>

            <div className="adzero-feature-card">
              <div className="feature-icon-box cyan-glow">
                <HiOutlinePlay />
              </div>
              <h3 className="feature-title">High-Quality Video Streaming</h3>
              <p className="feature-desc">
                Adaptive video playback with Dolby Atmos & 8DX music support for cinematic immersive audio.
              </p>
            </div>

            <div className="adzero-feature-card">
              <div className="feature-icon-box green-glow">
                <HiOutlineSquares2X2 />
              </div>
              <h3 className="feature-title">Smart Curated Categories</h3>
              <p className="feature-desc">
                Instant one-tap category filters for Trending, Movies, Gaming, Music, and Live feeds.
              </p>
            </div>

            <div className="adzero-feature-card">
              <div className="feature-icon-box yellow-glow">
                <HiOutlineMagnifyingGlass />
              </div>
              <h3 className="feature-title">Lightning-Fast Search</h3>
              <p className="feature-desc">
                Powerful real-time search indexing to instantly locate any channel, video, or trailer.
              </p>
            </div>

            <div className="adzero-feature-card">
              <div className="feature-icon-box purple-glow">
                <HiOutlineBolt />
              </div>
              <h3 className="feature-title">Optimized Native Performance</h3>
              <p className="feature-desc">
                Clean, low-memory Kotlin codebase optimized for battery life and zero background bloat.
              </p>
            </div>

            <div className="adzero-feature-card">
              <div className="feature-icon-box blue-glow">
                <HiOutlineLockClosed />
              </div>
              <h3 className="feature-title">Secure & Privacy-First</h3>
              <p className="feature-desc">
                Zero telemetry, zero tracking SDKs, and clean minimal device permissions.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Platform Availability */}
        <div className="adzero-content-block">
          <h2 className="adzero-block-heading">Platform Availability</h2>
          <div className="adzero-platforms-grid">
            <div className="adzero-platform-card active-platform">
              <div className="platform-top">
                <FaAndroid className="platform-icon android" />
                <span className="platform-status-badge available">Available Now</span>
              </div>
              <h3 className="platform-name">Android</h3>
              <p className="platform-detail">Version 4.4 • Android 8.0 or higher</p>
              <a
                href="https://github.com/kaif-webwork/AdZero/releases/download/v4.4/adzero.apk"
                className="platform-dl-link"
                onClick={handleDownloadApk}
              >
                <span>{isDownloading ? 'Starting Download...' : 'Download APK'}</span> <HiArrowRight />
              </a>
            </div>

            <div className="adzero-platform-card coming-soon">
              <div className="platform-top">
                <FaApple className="platform-icon apple" />
                <span className="platform-status-badge pending">Coming Soon</span>
              </div>
              <h3 className="platform-name">iOS App</h3>
              <p className="platform-detail">Under active development for iPhone & iPad</p>
            </div>

            <div className="adzero-platform-card coming-soon">
              <div className="platform-top">
                <FaGlobe className="platform-icon web" />
                <span className="platform-status-badge pending">Coming Soon</span>
              </div>
              <h3 className="platform-name">Web Version</h3>
              <p className="platform-detail">Direct web browser streaming version</p>
            </div>
          </div>
        </div>

        {/* 6. Technical Specifications Table */}
        <div className="adzero-content-block">
          <h2 className="adzero-block-heading">Technical Specifications</h2>
          <div className="adzero-specs-card">
            <div className="adzero-spec-row">
              <span className="spec-label">Project Name</span>
              <span className="spec-value">AdZero</span>
            </div>
            <div className="adzero-spec-row">
              <span className="spec-label">Lead Developer</span>
              <span className="spec-value">Mohd Kaif (@kaif-webwork)</span>
            </div>
            <div className="adzero-spec-row">
              <span className="spec-label">Latest Version</span>
              <span className="spec-value">v4.4</span>
            </div>
            <div className="adzero-spec-row">
              <span className="spec-label">Language</span>
              <span className="spec-value">Kotlin 100%</span>
            </div>
            <div className="adzero-spec-row">
              <span className="spec-label">Architecture</span>
              <span className="spec-value">Android Native • MVVM • Material 3</span>
            </div>
            <div className="adzero-spec-row">
              <span className="spec-label">Libraries & SDKs</span>
              <span className="spec-value">Retrofit, OkHttp, Coil, Firebase</span>
            </div>
            <div className="adzero-spec-row">
              <span className="spec-label">License</span>
              <span className="spec-value">Open Source</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="adzero-bottom-nav">
          <Link
            to="/projects"
            className="adzero-nav-pill-btn"
            onClick={() => playClickSound()}
          >
            <HiArrowLeft /> <span>All Projects</span>
          </Link>
          <Link
            to="/"
            className="adzero-nav-pill-btn"
            onClick={() => playClickSound()}
          >
            <span>Home</span> <HiArrowRight />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
