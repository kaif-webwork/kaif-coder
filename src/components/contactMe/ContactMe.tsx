import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { HiOutlineEnvelope, HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import { playClickSound } from '../../utils/sound';
import './ContactMe.css';

export default function ContactMe() {
  const contactButtons = [
    { name: 'Twitter', icon: <FaXTwitter />, url: 'https://x.com/kaif_coder' },
    { name: 'LinkedIn', icon: <FaLinkedin />, url: 'https://www.linkedin.com/in/mohd-kaif-6a453741a?utm_source=share_via&utm_content=profile&utm_medium=member_android' },
    { name: 'GitHub', icon: <FaGithub />, url: 'https://github.com/kaif-webwork' },
    { name: 'Instagram', icon: <FaInstagram />, url: 'https://instagram.com/Kaif_Coder' },
    { name: 'Email', icon: <HiOutlineEnvelope />, url: 'mailto:kaif.webwork@gmail.com' },
    { name: 'Resume', icon: <HiOutlineDocumentArrowDown />, url: '/resume' },
  ];

  return (
    <section className="contact-section">
      <div className="contact-connect-box">
        <h2 className="contact-connect-title">Let's Connect</h2>
        <p className="contact-connect-subtitle">
          Feel free to reach out through any of these platforms
        </p>

        <div className="contact-buttons-row">
          {contactButtons.map((btn) => (
            <a
              key={btn.name}
              href={btn.url}
              target={btn.url.startsWith('mailto') || btn.url.startsWith('/') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="contact-pill-btn"
              onClick={() => playClickSound()}
            >
              <span className="contact-btn-icon">{btn.icon}</span>
              <span>{btn.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
