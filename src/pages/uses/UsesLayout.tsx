import { HiArrowTopRightOnSquare } from 'react-icons/hi2';
import { useSEO } from '../../hooks/useSEO';
import { usesData } from '../../data/uses';
import SectionTitle from '../../components/sectionTitle/SectionTitle';
import Footer from '../../components/footer/Footer';
import './UsesLayout.css';

export default function UsesLayout() {
  useSEO({
    title: 'Gear & Tech Stack | Mohd Kaif (kaifcoder) • kaifcoder.in',
    description:
      'Explore the software, hardware, IDE setup, and developer gear used daily by Mohd Kaif (kaifcoder / kaif coder).',
    canonical: 'https://www.kaifcoder.in/uses',
  });

  return (
    <div className="uses-page-wrapper">
      <div className="uses-page">
        <div className="uses-header-box">
          <SectionTitle>/uses</SectionTitle>
        </div>

        <p className="uses-subtitle">
          Tools, software, and gear I use on a daily basis.
        </p>

        {usesData.map((category) => (
          <div key={category.category} className="uses-category-section">
            <h2 className="uses-category-title">{category.category}</h2>
            <div className="uses-category-card">
              {category.items.map((item) => (
                <a
                  key={item.label}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uses-row-link"
                >
                  <div className="uses-row-left">
                    <span className="uses-row-label">{item.label}</span>
                    <span className="uses-row-dash">—</span>
                    <span className="uses-row-name">{item.name}</span>
                  </div>
                  <HiArrowTopRightOnSquare className="uses-row-icon" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
