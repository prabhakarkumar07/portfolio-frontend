/**
 * pages/HomePage.js - Landing page with hero, bio, featured projects, and CTA
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import { CardSkeleton, ErrorMessage } from '../components/LoadingSpinner';
import { getApiBase, projectsAPI } from '../utils/api';
import useFetch from '../hooks/useFetch';
import useProfile from '../hooks/useProfile';
import useSeo from '../hooks/useSeo';

// ── Animation Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
};

const stagger = {
  show: { transition: { staggerChildren: 0.15 } }
};

// ── Skill Tags shown on hero ───────────────────────────────────────────────────
// ── Stats ─────────────────────────────────────────────────────────────────────
const defaultStats = [];

const HomePage = () => {
  const { data, loading, error, refetch } = useFetch(
    () => projectsAPI.getAll({ featured: true, limit: 3 })
  );
  const {
    fullName,
    headline,
    heroDescription,
    availabilityBadge,
    availabilityStatus,
    homeCtaTitle,
    homeCtaDescription,
    homePrimaryCtaText,
    homeSecondaryCtaText,
    stats,
    profilePicUrl,
    hasResume,
    skillCategories,
  } = useProfile();
  const [imgError, setImgError] = React.useState(false);
  const displayName = fullName || 'Your Name';
  const displayHeadline = headline || '';
  const displayStats = stats.length > 0 ? stats : defaultStats;
  
  const apiBase = getApiBase();

  const featuredProjects = data?.data || [];
  const derivedSkills = skillCategories.flatMap((category) =>
    (category.skills || [])
      .map((skill) => skill?.name)
      .filter(Boolean)
  );
  const heroSkills = Array.from(new Set(derivedSkills)).slice(0, 10);
  const resumeHref = hasResume ? `${apiBase}/profile/resume?source=home` : null;

  useSeo({
    title: 'Home',
    description: heroDescription || `${displayName} builds full stack applications with Java, Spring Boot, React, and modern cloud-ready architecture.`,
    path: '/',
    image: profilePicUrl || undefined,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: displayName,
      jobTitle: displayHeadline,
      description: heroDescription || displayHeadline,
      url: window.location.origin,
    },
  });

  return (
    <div>
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fadeUp} className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {availabilityBadge || 'Available for opportunities'}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.05] mb-6"
              >
                Hi, I'm{' '}
                <span className="gradient-text">{displayName}</span>
                <br />
                <span className="text-slate-700 dark:text-slate-300 text-4xl md:text-5xl">
                  {displayHeadline || 'Update your headline in Admin'}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-lg"
              >
                {heroDescription || 'Update your hero description in the Admin dashboard.'}
              </motion.p>

              {/* Skill Tags */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-10">
                {heroSkills.length > 0 ? (
                  heroSkills.map((skill) => (
                    <span key={skill} className="tag">{skill}</span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">Add skills in Admin to show tags.</span>
                )}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link to="/projects" className="btn-primary">
                  {homePrimaryCtaText || 'View My Work'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link to="/contact" className="btn-secondary">
                  {homeSecondaryCtaText || 'Get In Touch'}
                </Link>
              </motion.div>
            </motion.div>

            {/* Right — Profile Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:flex flex-col items-center gap-6"
            >
              {/* Profile photo frame */}
              <div className="relative">
               

                {/* Glow */}
                <div className="absolute inset-4 rounded-2xl gradient-bg opacity-20 blur-xl" />

                {/* Photo or initials */}
                <div className="relative w-72 h-72 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl shadow-primary-500/25 z-10">
                  {profilePicUrl && !imgError ? (
                    <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover object-center"
                      onError={() => setImgError(true)} />
                  ) : (
                    <div className="w-full h-full gradient-bg flex flex-col items-center justify-center gap-2">
                      <span className="text-white font-display font-bold text-7xl">
                        {displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                      <span className="text-white/50 text-xs font-mono">Add photo via Admin</span>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{availabilityStatus || 'Open to opportunities'}</span>
                </motion.div>
              </div>

              {/* Stat pills row */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
                className="flex gap-3 mt-4">
                {displayStats.slice(0, 3).length > 0 ? (
                  displayStats.slice(0, 3).map((s) => (
                    <div key={s.label} className="card px-5 py-3 text-center">
                      <p className="font-display font-bold text-xl text-primary-600 dark:text-primary-400">{s.value}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                    </div>
                  ))
                ) : (
                  <div className="card px-5 py-3 text-center text-xs text-slate-500 dark:text-slate-400">
                    Add stats in Admin to show here.
                  </div>
                )}
              </motion.div>

              {/* Resume quick-link */}
              {hasResume && resumeHref && (
                <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
                  href={resumeHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Resume
                </motion.a>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-slate-400 font-mono">scroll down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-slate-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-900 dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {displayStats.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {displayStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="font-display text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 text-sm">
              Add stats in Admin to show your highlights here.
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED PROJECTS ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="section-title mb-2">Featured Projects</h2>
              <p className="section-subtitle">A selection of my best work</p>
            </div>
            <Link to="/projects" className="btn-ghost hidden sm:flex">
              All Projects →
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={refetch} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, i) => (
                <ProjectCard key={project._id} project={project} index={i} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/projects" className="btn-secondary">View All Projects</Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-bg rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 relative z-10">
              {homeCtaTitle || "Let's build something great together"}
            </h2>
            <p className="text-white/80 mb-8 text-lg relative z-10">
              {homeCtaDescription || "I'm currently available for freelance work and full-time opportunities."}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg relative z-10"
            >
              {homeSecondaryCtaText || 'Start a Conversation'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
