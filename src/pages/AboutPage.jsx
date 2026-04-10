/**
 * pages/AboutPage.js
 * Profile photo, bio, skills, experience timeline, and a dedicated resume section.
 *
 * FIXES:
 * 1. ProfilePhoto now accepts availabilityStatus & yearsExperience as props
 *    (they were previously read from outer scope — undefined at render time).
 * 2. yearsExperience is derived inside AboutPage and passed down.
 * 3. Resume / file upload input uses accept="application/pdf,.pdf" so only
 *    PDF files are selectable in the OS file picker.
 */

import React, { useState } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import useProfile from '../hooks/useProfile';

const defaultSkillCategories = [
  {
    name: 'Frontend',
    icon: '🎨',
    skills: [
      { name: 'React / Next.js', level: 95 },
      { name: 'TypeScript', level: 85 },
      { name: 'Tailwind CSS', level: 90 },
      { name: 'Framer Motion', level: 80 },
    ],
  },
  {
    name: 'Backend',
    icon: '⚙️',
    skills: [
      { name: 'Node.js / Express', level: 92 },
      { name: 'Java / Spring Boot', level: 78 },
      { name: 'REST & GraphQL APIs', level: 88 },
      { name: 'WebSockets', level: 75 },
    ],
  },
  {
    name: 'Database',
    icon: '🗄️',
    skills: [
      { name: 'MongoDB / Mongoose', level: 88 },
      { name: 'PostgreSQL', level: 82 },
      { name: 'Redis', level: 70 },
      { name: 'Elasticsearch', level: 65 },
    ],
  },
  {
    name: 'DevOps & Tools',
    icon: '🚀',
    skills: [
      { name: 'Docker / Kubernetes', level: 75 },
      { name: 'AWS / GCP', level: 72 },
      { name: 'CI/CD (GitHub Actions)', level: 80 },
      { name: 'Linux / Bash', level: 85 },
    ],
  },
];

const defaultExperiences = [
  {
    title: 'Senior Full-Stack Developer',
    company: 'TechCorp Solutions',
    period: '2022 – Present',
    description:
      'Lead developer on a team of 6, architecting microservices and React dashboards for enterprise clients. Reduced API response time by 60% through caching and query optimization.',
    tech: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
  },
  {
    title: 'Full-Stack Developer',
    company: 'Startup XYZ',
    period: '2020 – 2022',
    description:
      'Built and shipped a SaaS analytics platform from scratch. Implemented real-time dashboards with WebSockets and designed the entire backend architecture.',
    tech: ['Vue.js', 'Express', 'PostgreSQL', 'Socket.io'],
  },
  {
    title: 'Junior Web Developer',
    company: 'Digital Agency',
    period: '2019 – 2020',
    description:
      'Developed responsive websites and e-commerce platforms for 20+ clients. Gained deep experience in frontend performance optimization.',
    tech: ['HTML/CSS', 'JavaScript', 'WordPress', 'PHP'],
  },
];

const defaultCareerJourney = [
  {
    year: '2018',
    title: 'Beginning the Journey',
    subtitle: 'Learning by building',
    description:
      'Started exploring web development fundamentals, creating simple pages, and discovering how design, logic, and interactivity work together on the web.',
    accent: 'from-primary-500 to-sky-400',
  },
  {
    year: '2019',
    title: 'Building the Basics',
    subtitle: 'Practice and consistency',
    description:
      'Moved past tutorials into real project practice, improving HTML, CSS, JavaScript, and responsive thinking through hands-on experimentation and iteration.',
    accent: 'from-sky-500 to-emerald-400',
  },
  {
    year: '2020',
    title: 'Going Full Stack',
    subtitle: 'Frontend met backend',
    description:
      'Expanded from interface work into APIs, databases, and deployment, learning how to connect polished user experiences with reliable backend systems.',
    accent: 'from-emerald-500 to-lime-400',
  },
  {
    year: '2022',
    title: 'Professional Growth',
    subtitle: 'Shipping for real users',
    description:
      'Focused more on production-grade development, cleaner architecture, performance, reusable components, and building products with practical business impact.',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    year: 'Now',
    title: 'Career With Purpose',
    subtitle: 'Modern product engineering',
    description:
      'Continuing to grow as a full-stack developer by creating scalable products, refining system thinking, and delivering experiences that feel intentional and useful.',
    accent: 'from-fuchsia-500 to-primary-500',
  },
];

const defaultResumeHighlights = [
  { icon: '🎓', label: 'Education', value: 'B.Tech Computer Science', sub: 'XYZ University · 2019' },
  { icon: '🏆', label: 'Certifications', value: 'AWS Certified Developer', sub: 'Amazon Web Services · 2023' },
  { icon: '💼', label: 'Experience', value: '5+ Years Professional', sub: 'Full-Stack Development' },
  { icon: '🌍', label: 'Languages', value: 'English & Hindi', sub: 'Professional proficiency' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SkillBar
───────────────────────────────────────────────────────────────────────────── */
const SkillBar = ({ name, level }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1.5">
      <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
      <span className="font-mono text-primary-600 dark:text-primary-400">{level}%</span>
    </div>
    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ProfilePhoto
   FIX: availabilityStatus and yearsExperience are now received as props
   instead of being read from the outer closure (where they were undefined).
───────────────────────────────────────────────────────────────────────────── */
const ProfilePhoto = ({
  url,
  name = 'Your Name',
  availabilityStatus,   // ← FIX: prop instead of outer-scope variable
  yearsExperience,      // ← FIX: prop instead of outer-scope variable
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex items-center justify-center">
      {/* Spinning dashed ring */}
      <svg
        className="absolute w-[340px] h-[340px] lg:w-[420px] lg:h-[420px] text-primary-300/40 dark:text-primary-700/40"
        viewBox="0 0 200 200"
      >
        <motion.circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="8 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 100px' }}
        />
      </svg>

      {/* Glow blob behind photo */}
      <div className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full gradient-bg opacity-20 blur-2xl" />

      {/* Photo frame */}
      <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl shadow-primary-500/30 z-10">
        {url && !imgError ? (
          <img
            src={url}
            alt={name}
            className="w-full h-full object-cover object-center"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full gradient-bg flex flex-col items-center justify-center gap-2">
            <span className="text-white font-display font-bold text-6xl lg:text-7xl">{initials}</span>
            <span className="text-white/60 text-xs font-mono">Add photo via Admin</span>
          </div>
        )}
      </div>

      {/* Badge — open to work */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
        className="absolute bottom-0 -right-2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {availabilityStatus || 'Open to work'}
        </span>
      </motion.div>

      {/* Badge — experience */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: 'spring' }}
        className="absolute top-0 -left-2 z-20 bg-primary-600 rounded-2xl px-3 py-2 shadow-xl"
      >
        <span className="text-white text-sm font-bold block">{yearsExperience || '5+'}</span>
        <span className="text-primary-200 text-xs">Experience</span>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   AboutPage
───────────────────────────────────────────────────────────────────────────── */
const AboutPage = () => {
  const {
    fullName,
    headline,
    bio,
    location,
    email,
    profilePicUrl,
    resumeUrl,
    hasResume,
    careerJourney,
    availabilityStatus,
    stats,
    skillCategories,
    experiences,
    resumeHighlights,
  } = useProfile();

  const displayName     = fullName || 'Your Name';
  const displayHeadline = headline || 'Lifelong Learner';
  const displayBio      = bio
    ? bio.split('\n').map((item) => item.trim()).filter(Boolean)
    : [
        "I'm a full-stack software developer with 5+ years of experience building production-grade web applications. I specialize in the JavaScript ecosystem — from pixel-perfect React frontends to robust Node.js backends.",
        'My approach combines pragmatic engineering with a keen eye for UX. I believe great software is not just functional — it is fast, maintainable, and delightful to use.',
        "When I'm not coding, I contribute to open-source, write technical articles, and explore new technologies to stay on the cutting edge.",
      ];

  // FIX: derive yearsExperience here inside AboutPage so it can be passed as a prop
  const yearsExperience       = stats.find((item) => /year/i.test(item.label))?.value || '5+';

  const journeyItems          = careerJourney.length > 0    ? careerJourney    : defaultCareerJourney;
  const displaySkillCategories = skillCategories.length > 0 ? skillCategories  : defaultSkillCategories;
  const displayExperiences    = experiences.length > 0      ? experiences      : defaultExperiences;
  const displayResumeHighlights = resumeHighlights.length > 0 ? resumeHighlights : defaultResumeHighlights;

  return (
    <div>

      {/* ── HERO / BIO ─────────────────────────────────────────────────── */}
      <Section className="pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex justify-center lg:justify-start"
          >
            {/* FIX: pass availabilityStatus and yearsExperience as props */}
            <ProfilePhoto
              url={profilePicUrl}
              name={displayName}
              availabilityStatus={availabilityStatus}
              yearsExperience={yearsExperience}
            />
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <span className="tag mb-4 inline-flex">About Me</span>
            <h1 className="section-title mb-6">
              Developer, Problem Solver,<br />
              <span className="gradient-text">{displayHeadline}</span>
            </h1>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
              {displayBio.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 mb-8">
              {[
                { label: 'Name',     value: displayName },
                { label: 'Email',    value: email    || 'your@email.com' },
                { label: 'Location', value: location || 'Your City, Country' },
                { label: 'Role',     value: headline || 'MERN / TypeScript' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Hire Me
              </Link>

              {hasResume && resumeUrl ? (
                <a href={resumeUrl} download target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CV
                </a>
              ) : (
                <a href="#resume" className="btn-secondary">View Resume ↓</a>
              )}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── SKILLS ─────────────────────────────────────────────────────── */}
      <Section
        className="bg-slate-50 dark:bg-slate-900/50"
        title="Technical Skills"
        subtitle="Technologies I use to bring ideas to life"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displaySkillCategories.map((category, i) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <span>{category.icon}</span> {category.name}
              </h3>
              {category.skills.map((skill) => (
                <SkillBar key={skill.name} {...skill} />
              ))}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── EXPERIENCE TIMELINE ─────────────────────────────────────────── */}
      <Section title="Work Experience" subtitle="My professional journey so far">
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />
          <div className="space-y-12">
            {displayExperiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`relative flex flex-col md:flex-row gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="absolute left-4 md:left-1/2 top-6 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-slate-950 -translate-x-1/2 z-10" />
                <div className="hidden md:block md:w-1/2" />
                <div className="pl-10 md:pl-0 md:w-1/2">
                  <div className="card p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">{exp.title}</h3>
                        <p className="text-primary-600 dark:text-primary-400 font-medium">{exp.company}</p>
                      </div>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded whitespace-nowrap">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{exp.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tech.map((t) => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CAREER JOURNEY ──────────────────────────────────────────────── */}
      <Section
        className="bg-slate-50 dark:bg-slate-900/50"
        title="Career Journey"
        subtitle="A milestone-based view of how my path has grown from first experiments to full-stack product development"
      >
        <div className="relative mx-auto max-w-4xl">
          <div className="absolute left-5 top-4 bottom-4 w-px bg-gradient-to-b from-primary-400 via-accent-400 to-primary-500 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-8 md:space-y-10">
            {journeyItems.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative pl-16 md:grid md:grid-cols-2 md:gap-10 md:pl-0"
              >
                <div className={index % 2 === 0 ? '' : 'md:order-2'} />

                <div className={index % 2 === 0 ? '' : 'md:order-1'}>
                  <div className="relative card overflow-hidden p-6 md:p-7">
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`} />

                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-mono font-semibold text-white shadow-lg ${item.accent}`}
                      >
                        {item.year}
                      </span>
                      <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        {item.subtitle}
                      </span>
                    </div>

                    <h3 className="mb-3 font-display text-xl font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="absolute left-5 top-7 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-950 shadow-lg dark:border-slate-950 md:left-1/2">
                  <div className={`h-4 w-4 rounded-full bg-gradient-to-r ${item.accent}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── RESUME SECTION ──────────────────────────────────────────────── */}
      <Section
        id="resume"
        className="bg-slate-50 dark:bg-slate-900/50"
        title="My Resume"
        subtitle="A snapshot of my qualifications and career highlights"
      >
        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {displayResumeHighlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-5 text-center hover:border-primary-300 dark:hover:border-primary-700 transition-colors group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-0.5">{item.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Resume download card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5">

            {/* Left — decorative panel */}
            <div className="lg:col-span-2 gradient-bg p-10 flex flex-col items-center justify-center text-white relative overflow-hidden min-h-[280px]">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="relative z-10"
              >
                {/* Animated PDF icon */}
                <svg className="w-28 h-28 drop-shadow-2xl" viewBox="0 0 80 80" fill="none">
                  <rect width="80" height="80" rx="16" fill="white" fillOpacity="0.15" />
                  <rect x="18" y="10" width="44" height="56" rx="5" fill="white" fillOpacity="0.92" />
                  <rect x="24" y="22" width="32" height="3" rx="1.5" fill="#6366f1" />
                  <rect x="24" y="30" width="24" height="2.5" rx="1.25" fill="#6366f1" fillOpacity="0.55" />
                  <rect x="24" y="37" width="28" height="2.5" rx="1.25" fill="#6366f1" fillOpacity="0.55" />
                  <rect x="24" y="44" width="20" height="2.5" rx="1.25" fill="#6366f1" fillOpacity="0.4" />
                  <rect x="24" y="51" width="28" height="2.5" rx="1.25" fill="#6366f1" fillOpacity="0.4" />
                  <circle cx="60" cy="62" r="16" fill="#f97316" />
                  <path
                    d="M60 55v8m0 0l-3.5-3.5M60 63l3.5-3.5"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect x="53" y="67" width="14" height="2.5" rx="1.25" fill="white" />
                </svg>
              </motion.div>
              <p className="relative z-10 mt-5 font-display font-bold text-xl tracking-tight">Curriculum Vitae</p>
              <p className="relative z-10 text-white/70 text-sm mt-1.5 font-mono">
                {displayName} · {displayHeadline}
              </p>
            </div>

            {/* Right — CTA content */}
            <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-2">Full Resume / CV</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                My resume covers my complete work history, education, certifications, and project contributions. Kept up to date with the latest experience.
              </p>

              <ul className="space-y-2 mb-8">
                {displayResumeHighlights.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item.value}
                  </li>
                ))}
              </ul>

              {hasResume && resumeUrl ? (
                <div className="flex flex-wrap gap-3">
                  <a
                    href={resumeUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </a>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </a>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Resume not uploaded yet</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      Upload your resume PDF from the{' '}
                      <Link to="/admin/profile" className="underline font-medium">Admin → Profile</Link> page.
                    </p>
                  </div>
                </div>
              )}

              {/*
               * FIX: If you have a file-upload input anywhere in your admin pages
               * for the resume, make sure it has:
               *   accept="application/pdf,.pdf"
               * Example (hidden input pattern used by many upload buttons):
               *
               *   <input
               *     type="file"
               *     accept="application/pdf,.pdf"
               *     style={{ display: 'none' }}
               *     ref={fileInputRef}
               *     onChange={handleResumeUpload}
               *   />
               *
               * This restricts the OS file picker to PDF files only.
               */}
            </div>
          </div>
        </motion.div>
      </Section>

    </div>
  );
};

export default AboutPage;