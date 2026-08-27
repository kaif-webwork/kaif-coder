import { useState } from 'react';
import SectionTitle from '../sectionTitle/SectionTitle';
import ExperienceCard from './ExperienceCard';
import Calendar from '../calendar/Calendar';
import './Experience.css';

const experiences = [
  {
    company: 'Open Source & Freelance',
    role: 'Full Stack Engineer',
    dates: 'Oct 2025 - Present',
    status: 'present',
    statusText: 'Active',
    logoUrl: 'https://github.com/kaif-webwork.png',
    link: 'https://github.com/kaif-webwork',
    description: [
      'Building scalable full-stack web applications and modern developer utilities',
      'Contributing to open-source software and open developer ecosystem',
      'Designing high-performance, responsive user interfaces with React, TypeScript & Node.js',
      'Deploying cloud-native solutions, REST APIs, and automated CI/CD workflows',
    ],
  },
  {
    company: 'AdZero',
    role: 'Full Stack Software Engineer',
    dates: 'May 2025 - Sep 2025',
    status: 'past',
    statusText: 'Done',
    logoUrl: '/images/projects/adzero-icon.svg',
    link: 'https://github.com/kaif-webwork/AdZero',
    description: [
      'Architected and built full-stack native Android application for seamless ad-free media streaming',
      'Engineered real-time smart categories, Dolby Atmos audio support, and custom video playback pipeline',
      'Integrated Material 3 UI design, Retrofit REST APIs, and Firebase cloud services',
      'Delivered v4.4 production release with optimized memory footprint and open-source distribution',
    ],
  },
];

export default function Experience() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <section className="experience-section">
      <SectionTitle>Work Experience</SectionTitle>
      <div className="experience-timeline">
        {experiences.map((exp, idx) => (
          <ExperienceCard
            key={exp.company}
            {...exp}
            isExpanded={expandedIdx === idx}
            onToggle={() =>
              setExpandedIdx(expandedIdx === idx ? null : idx)
            }
          />
        ))}
      </div>
      <Calendar />
      <div className="experience-section-divider" />
    </section>
  );
}
