/**
 * pages/ProjectsPage.js - Full projects listing with category filters
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import { CardSkeleton, ErrorMessage } from '../components/LoadingSpinner';
import { projectsAPI } from '../utils/api';
import useFetch from '../hooks/useFetch';
import Section from '../components/Section';
import useProfile from '../hooks/useProfile';
import useSeo from '../hooks/useSeo';

const categories = ['All', 'Web', 'Mobile', 'API', 'ML/AI', 'DevOps', 'Other'];

const ProjectsPage = () => {
  const { projectsPageTag, projectsPageTitle, projectsPageSubtitle } = useProfile();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => projectsAPI.getAll({ limit: 50 })
  );

  useSeo({
    title: projectsPageTitle || 'Projects',
    description: projectsPageSubtitle || 'Explore featured full stack, backend, and frontend projects by Prabhakar Kumar.',
    path: '/projects',
  });

  const allProjects = useMemo(() => data?.data || [], [data]);

  // Client-side filtering
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allProjects, activeCategory, searchQuery]);

  return (
    <div>
      {/* Header */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="tag mb-4 inline-flex">{projectsPageTag || 'My Work'}</span>
            <h1 className="section-title mb-4">{projectsPageTitle || 'All Projects'}</h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              {projectsPageSubtitle || "A collection of things I've built, from weekend side projects to production systems serving real users."}
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          {/* Search */}
          <div className="relative flex-grow">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        {!loading && !error && (
          <motion.p layout className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredProjects.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{allProjects.length}</span> projects
          </motion.p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-display font-semibold text-xl text-slate-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, i) => (
                <ProjectCard key={project._id} project={project} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </Section>
    </div>
  );
};

export default ProjectsPage;
