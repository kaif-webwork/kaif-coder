import type { Certificate } from '../../data/certificates';

interface CertificateBannerProps {
  cert: Certificate;
}

export default function CertificateBanner({ cert }: CertificateBannerProps) {
  if (cert.image) {
    return (
      <div className="project-banner-wrapper cert-img-banner-wrap">
        <img
          src={cert.image}
          alt={cert.title}
          className="cert-real-banner-img"
          loading="lazy"
        />
      </div>
    );
  }

  const getBannerSvg = () => {
    switch (cert.id) {
      case 'meta-fullstack':
        return (
          <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="cert-svg-graphic">
            <defs>
              <linearGradient id="meta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#08101e" />
                <stop offset="50%" stopColor="#0a182c" />
                <stop offset="100%" stopColor="#060c18" />
              </linearGradient>
              <linearGradient id="meta-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0081fb" />
                <stop offset="100%" stopColor="#00c6ff" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#meta-grad)" />
            {/* Guilloche pattern lines */}
            <circle cx="160" cy="100" r="85" stroke="#0081fb" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.25" />
            <circle cx="160" cy="100" r="65" stroke="#0081fb" strokeWidth="0.75" opacity="0.15" />
            <circle cx="160" cy="100" r="45" stroke="#0081fb" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.2" />
            
            {/* Meta Infinity Loop */}
            <path
              d="M130 92 C115 76 95 80 95 100 C95 120 115 124 130 108 L190 92 C205 76 225 80 225 100 C225 120 205 124 190 108 Z"
              stroke="url(#meta-accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />
            {/* Center Label */}
            <text x="160" y="148" fill="#e2e8f0" fontSize="11" fontWeight="700" fontFamily="Figtree, sans-serif" textAnchor="middle" letterSpacing="2">
              META VERIFIED
            </text>
            <text x="160" y="164" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle" letterSpacing="1">
              FULL-STACK SPECIALIST
            </text>
          </svg>
        );

      case 'google-cloud-dev':
        return (
          <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="cert-svg-graphic">
            <defs>
              <linearGradient id="gcp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a0d0d" />
                <stop offset="50%" stopColor="#221111" />
                <stop offset="100%" stopColor="#0e0808" />
              </linearGradient>
              <linearGradient id="gcp-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ea4335" />
                <stop offset="100%" stopColor="#fbbc05" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#gcp-grad)" />
            {/* Cloud Hexagons */}
            <polygon points="160,50 195,70 195,110 160,130 125,110 125,70" stroke="#ea4335" strokeWidth="0.8" opacity="0.2" fill="none" />
            <polygon points="160,40 205,65 205,115 160,140 115,115 115,65" stroke="#ea4335" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" fill="none" />
            
            {/* Cloud Icon */}
            <g transform="translate(136, 75)">
              <path
                d="M38 16 C37 10 31 6 25 7 C21 2 14 3 11 8 C5 9 1 14 1 20 C1 26 6 31 12 31 L37 31 C42 31 47 27 47 22 C47 18 43 16 38 16 Z"
                stroke="url(#gcp-accent)"
                strokeWidth="3.5"
                fill="none"
                strokeLinejoin="round"
              />
            </g>
            <text x="160" y="148" fill="#e2e8f0" fontSize="11" fontWeight="700" fontFamily="Figtree, sans-serif" textAnchor="middle" letterSpacing="2">
              GOOGLE CLOUD
            </text>
            <text x="160" y="164" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle" letterSpacing="1">
              CLOUD ARCHITECTURE
            </text>
          </svg>
        );

      case 'android-kotlin':
        return (
          <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="cert-svg-graphic">
            <defs>
              <linearGradient id="and-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06160e" />
                <stop offset="50%" stopColor="#0b2417" />
                <stop offset="100%" stopColor="#040e09" />
              </linearGradient>
              <linearGradient id="and-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#and-grad)" />
            {/* Geometric Android Bugdroid */}
            <circle cx="160" cy="100" r="75" stroke="#10b981" strokeWidth="0.75" strokeDasharray="4 2" opacity="0.2" />
            <g transform="translate(138, 70)">
              {/* Head */}
              <path d="M7 26 A 17 17 0 0 1 41 26 Z" fill="none" stroke="url(#and-accent)" strokeWidth="3.5" />
              {/* Eyes */}
              <circle cx="17" cy="18" r="2" fill="#34d399" />
              <circle cx="31" cy="18" r="2" fill="#34d399" />
              {/* Antennae */}
              <line x1="14" y1="9" x2="10" y2="3" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="34" y1="9" x2="38" y2="3" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
              {/* Body */}
              <rect x="7" y="30" width="34" height="22" rx="4" fill="none" stroke="url(#and-accent)" strokeWidth="3" />
            </g>
            <text x="160" y="148" fill="#e2e8f0" fontSize="11" fontWeight="700" fontFamily="Figtree, sans-serif" textAnchor="middle" letterSpacing="2">
              ANDROID CERTIFIED
            </text>
            <text x="160" y="164" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle" letterSpacing="1">
              KOTLIN APPLICATIONS
            </text>
          </svg>
        );

      case 'python-dsa':
      default:
        return (
          <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="cert-svg-graphic">
            <defs>
              <linearGradient id="py-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1406" />
                <stop offset="50%" stopColor="#251c08" />
                <stop offset="100%" stopColor="#0e0a03" />
              </linearGradient>
              <linearGradient id="py-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#py-grad)" />
            <circle cx="160" cy="100" r="80" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="2 4" opacity="0.25" />
            <g transform="translate(138, 70)">
              {/* HackerRank brackets */}
              <text x="24" y="36" fill="url(#py-accent)" fontSize="32" fontWeight="900" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                [H]
              </text>
            </g>
            <text x="160" y="148" fill="#e2e8f0" fontSize="11" fontWeight="700" fontFamily="Figtree, sans-serif" textAnchor="middle" letterSpacing="2">
              HACKERRANK CERTIFIED
            </text>
            <text x="160" y="164" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle" letterSpacing="1">
              PYTHON &amp; DSA EXPERT
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="project-banner-wrapper">
      {getBannerSvg()}
      <span className="project-banner-badge-left">{cert.badgeLeft}</span>
      <span className="project-banner-badge-right">{cert.badgeRight}</span>
    </div>
  );
}
