import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ErrorMessage, PageLoader } from '../components/LoadingSpinner';
import { projectsAPI } from '../utils/api';
import useFetch from '../hooks/useFetch';
import useSeo from '../hooks/useSeo';

const fallbackGalleryImage =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80';

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const { data, loading, error, refetch } = useFetch(
    () => projectsAPI.getBySlug(slug),
    [slug],
  );

  const project = data?.data;

  useSeo({
    title: project?.title || 'Project',
    description: project?.shortDescription,
    path: `/projects/${slug}`,
    image: project?.imageUrl || project?.gallery?.[0],
    type: 'article',
    jsonLd: project
      ? {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: project.title,
          description: project.shortDescription,
          programmingLanguage: project.technologies,
          codeRepository: project.githubUrl || undefined,
          url: `${window.location.origin}/projects/${slug}`,
        }
      : null,
  });

  if (loading) {
    return <PageLoader />;
  }

  if (error || !project) {
    return <ErrorMessage message={error || 'Project not found'} onRetry={refetch} />;
  }

  const gallery =
    Array.isArray(project.gallery) && project.gallery.length > 0
      ? project.gallery
      : [project.imageUrl || fallbackGalleryImage];

  const detailSections = [
    { title: 'The Challenge', body: project.problem },
    { title: 'What I Built', body: project.solution || project.description },
    { title: 'Impact', body: project.impact },
  ].filter((section) => section.body);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400">
            <span aria-hidden="true">←</span>
            Back to projects
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="tag">{project.category}</span>
            <span className="tag capitalize">{project.status?.replace('-', ' ')}</span>
            {project.role && <span className="tag">{project.role}</span>}
            {project.duration && <span className="tag">{project.duration}</span>}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <h1 className="section-title mb-4">{project.title}</h1>
              <p className="section-subtitle max-w-3xl">{project.shortDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  View Code
                </a>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <img
              src={gallery[0]}
              alt={project.title}
              className="h-full max-h-[440px] w-full object-cover"
              onError={(event) => {
                event.target.src = fallbackGalleryImage;
              }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {(project.metrics || []).length > 0 ? (
              project.metrics.map((metric) => (
                <div key={`${metric.label}-${metric.value}`} className="card p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{metric.label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                </div>
              ))
            ) : (
              <div className="card p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Project Summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{project.description}</p>
              </div>
            )}
          </div>
        </motion.div>

        {gallery.length > 1 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(1).map((image, index) => (
              <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <img
                  src={image}
                  alt={`${project.title} preview ${index + 2}`}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.target.src = fallbackGalleryImage;
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr]">
          <div className="space-y-8">
            {detailSections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.06 }}
                className="card p-7"
              >
                <h2 className="mb-3 font-display text-2xl font-semibold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-sm leading-8 text-slate-600 dark:text-slate-400">
                  {section.body}
                </p>
              </motion.section>
            ))}
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="mb-4 font-display text-xl font-semibold text-slate-900 dark:text-white">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {(project.technologies || []).map((tech) => (
                  <span key={tech} className="tag">{tech}</span>
                ))}
              </div>
            </div>

            {(project.keyFeatures || []).length > 0 && (
              <div className="card p-6">
                <h2 className="mb-4 font-display text-xl font-semibold text-slate-900 dark:text-white">Key Features</h2>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  {project.keyFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
