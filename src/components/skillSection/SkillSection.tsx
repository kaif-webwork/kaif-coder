import { FaReact, FaNodeJs, FaGitAlt, FaDocker, FaFigma, FaGithub } from 'react-icons/fa';
import {
  SiTypescript,
  SiJavascript,
  SiCss3,
  SiMongodb,
  SiExpress,
  SiTailwindcss,
  SiPostman,
  SiVercel,
  SiNetlify,
  SiRender,
  SiSwagger,
  SiSpringsecurity,
  SiNextdotjs,
  SiRedux,
  SiPython,
} from 'react-icons/si';
import { DiMysql } from 'react-icons/di';
import { VscVscode } from 'react-icons/vsc';
import { RiNotionFill } from 'react-icons/ri';
import type { IconType } from 'react-icons';
import SectionTitle from '../sectionTitle/SectionTitle';
import './SkillSection.css';

interface SkillItem {
  name: string;
  icon: IconType;
  color: string;
}

const technologies: SkillItem[] = [
  { name: 'CSS', icon: SiCss3, color: '#38bdf8' },
  { name: 'JavaScript', icon: SiJavascript, color: '#f7df1e' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178c6' },
  { name: 'React', icon: FaReact, color: '#61dafb' },
  { name: 'NodeJS', icon: FaNodeJs, color: '#22c55e' },
  { name: 'Express', icon: SiExpress, color: '#ffffff' },
  { name: 'Spring Security', icon: SiSpringsecurity, color: '#6db33f' },
  { name: 'MongoDB', icon: SiMongodb, color: '#47a248' },
  { name: 'MySQL', icon: DiMysql, color: '#4479a1' },
  { name: 'Python', icon: SiPython, color: '#3776ab' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06b6d4' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#ffffff' },
  { name: 'Redux', icon: SiRedux, color: '#764abc' },
];

const tools: SkillItem[] = [
  { name: 'Render', icon: SiRender, color: '#ffffff' },
  { name: 'Notion', icon: RiNotionFill, color: '#ffffff' },
  { name: 'Git', icon: FaGitAlt, color: '#f05032' },
  { name: 'GitHub', icon: FaGithub, color: '#ffffff' },
  { name: 'Postman', icon: SiPostman, color: '#ff6c37' },
  { name: 'Swagger', icon: SiSwagger, color: '#85ea2d' },
  { name: 'VS Code', icon: VscVscode, color: '#007acc' },
  { name: 'Netlify', icon: SiNetlify, color: '#00c7b7' },
  { name: 'Docker', icon: FaDocker, color: '#2496ed' },
  { name: 'Figma', icon: FaFigma, color: '#f24e1e' },
  { name: 'Vercel', icon: SiVercel, color: '#ffffff' },
];

function MarqueeRow({ items, reverse = false }: { items: SkillItem[]; reverse?: boolean }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="skill-marquee-container">
      <div className={`skill-marquee ${reverse ? 'reverse' : ''}`}>
        {doubled.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={`${item.name}-${index}`} className="skill-pill">
              <span className="skill-pill-icon" style={{ color: item.color }}>
                <Icon />
              </span>
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SkillSection() {
  return (
    <section className="skill-section">
      <SectionTitle>My Skills</SectionTitle>
      <MarqueeRow items={technologies} />
      <MarqueeRow items={tools} reverse />
      <div className="skill-section-divider" />
    </section>
  );
}
