import { Link } from 'react-router';
import { HiArrowRight } from 'react-icons/hi2';
import SectionTitle from '../sectionTitle/SectionTitle';
import { playClickSound } from '../../utils/sound';
import './UsesSection.css';

export default function UsesSection() {
  return (
    <section className="uses-section">
      <SectionTitle>/uses</SectionTitle>
      <div className="uses-teaser-card">
        <p className="uses-teaser-text">
          Curious about my setup? Check out the tools, gear, and software I use daily.
        </p>
        <Link
          to="/uses"
          className="uses-teaser-btn"
          onClick={() => playClickSound()}
        >
          <span>See my setup</span>
          <HiArrowRight className="arrow" />
        </Link>
      </div>
      <div className="uses-section-divider" />
    </section>
  );
}
