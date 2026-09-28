import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { HiOutlineEye, HiOutlineArrowTopRightOnSquare, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';
import type { Certificate } from '../../data/certificates';
import CertificateBanner from './CertificateBanner';
import { playClickSound } from '../../utils/sound';

interface CertificateCardProps {
  cert: Certificate;
  onPreview: (cert: Certificate) => void;
  onCopyId: (e: React.MouseEvent, id: string) => void;
  copiedId: string | null;
}

export default function CertificateCard({
  cert,
  onPreview,
  onCopyId,
  copiedId,
}: CertificateCardProps) {
  return (
    <div className="project-card cert-native-card">
      <div
        className="cert-banner-click-wrapper"
        onClick={() => onPreview(cert)}
        title="Click to enlarge certificate"
      >
        <CertificateBanner cert={cert} />
      </div>

      <div className="project-content">
        <div className="project-header-row">
          <h3 className="project-title">
            {cert.title}
            <RiVerifiedBadgeFill
              className="cert-verified-badge-icon"
              style={{ color: cert.accentColor }}
              title="Verified Certification"
            />
          </h3>

          <div className="project-action-links">
            <button
              type="button"
              className="project-action-btn"
              onClick={() => onPreview(cert)}
              title="Preview Certificate"
            >
              <HiOutlineEye /> Preview
            </button>

            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-action-btn"
              onClick={() => playClickSound()}
              title="Verify Official Authority"
            >
              <HiOutlineArrowTopRightOnSquare /> Verify
            </a>
          </div>
        </div>

        {/* Issuer & Credential ID Subline */}
        <div className="cert-meta-subline">
          {cert.image && (
            <>
              <span className="cert-badge-pill">{cert.badgeLeft}</span>
              <span className="cert-badge-pill gold">{cert.badgeRight}</span>
              <span className="cert-meta-pipe">/</span>
            </>
          )}
          <span className="cert-meta-issuer">{cert.issuer}</span>
          <span className="cert-meta-pipe">/</span>
          <span className="cert-meta-date">{cert.issueDate}</span>
          <span className="cert-meta-pipe">/</span>
          <button
            type="button"
            className={`cert-id-copy-pill ${copiedId === cert.credentialId ? 'copied' : ''}`}
            onClick={(e) => onCopyId(e, cert.credentialId)}
            title="Click to copy Credential ID"
          >
            {copiedId === cert.credentialId ? (
              <>
                <HiOutlineClipboardDocumentCheck className="copy-icon" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <span className="mono-label">ID:</span>
                <span>{cert.credentialId}</span>
              </>
            )}
          </button>
        </div>

        {/* Description */}
        <p className="project-desc">{cert.description}</p>

        {/* Tech / Skills Tags */}
        <div className="project-tech-section">
          <span className="project-tech-label">Skills &amp; Core Competencies:</span>
          <div className="project-tech-list">
            {cert.skills.map((skill) => (
              <span key={skill} className="project-tech-pill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
