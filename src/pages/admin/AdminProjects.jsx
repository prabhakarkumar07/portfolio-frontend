/**
 * pages/admin/AdminProjects.js - Full CRUD for portfolio projects
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import useFetch from '../../hooks/useFetch';
import { PageLoader } from '../../components/LoadingSpinner';

const CATEGORIES = ['Web', 'Mobile', 'API', 'ML/AI', 'DevOps', 'Other'];
const STATUSES = ['completed', 'in-progress', 'planned'];

const emptyProject = {
  title: '', shortDescription: '', description: '', technologies: '',
  slug: '', category: 'Web', githubUrl: '', liveUrl: '', imageUrl: '',
  gallery: '', role: '', duration: '', problem: '', solution: '', impact: '',
  keyFeatures: '', metrics: '',
  featured: false, status: 'completed', order: 0,
};

// ── Field component defined OUTSIDE ProjectModal to prevent focus loss ─────────
// When Field is defined inside ProjectModal, React treats it as a new component
// type on every render → unmounts old input → mounts fresh one → focus lost.
// Keeping it here means React reuses the same component type and focus is preserved.
const Field = ({ label, name, type = 'text', placeholder, required, textarea, options, form, errors, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {options ? (
      <select
        name={name}
        value={form[name]}
        onChange={onChange}
        className="input-field"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : textarea ? (
      <textarea
        name={name}
        value={form[name]}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        className={`input-field resize-none ${errors[name] ? 'border-red-400' : ''}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${errors[name] ? 'border-red-400' : ''}`}
      />
    )}
    {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
  </div>
);

// ── Project Form Modal ─────────────────────────────────────────────────────────
const ProjectModal = ({ project, onClose, onSaved }) => {
  const isEdit = !!project?._id;
  const [form, setForm] = useState(
    project
      ? {
          ...project,
          technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
          gallery: Array.isArray(project.gallery) ? project.gallery.join(', ') : '',
          keyFeatures: Array.isArray(project.keyFeatures) ? project.keyFeatures.join('\n') : '',
          metrics: Array.isArray(project.metrics)
            ? project.metrics.map((item) => `${item.label}: ${item.value}`).join('\n')
            : '',
        }
      : emptyProject
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.shortDescription.trim()) e.shortDescription = 'Short description is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.technologies.trim()) e.technologies = 'At least one technology is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    const payload = {
      ...form,
      slug: form.slug.trim(),
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      gallery: form.gallery.split(',').map((item) => item.trim()).filter(Boolean),
      keyFeatures: form.keyFeatures.split('\n').map((item) => item.trim()).filter(Boolean),
      metrics: form.metrics
        .split('\n')
        .map((row) => row.trim())
        .filter(Boolean)
        .map((row) => {
          const [label, ...valueParts] = row.split(':');
          return {
            label: (label || '').trim(),
            value: valueParts.join(':').trim(),
          };
        })
        .filter((item) => item.label || item.value),
      order: Number(form.order) || 0,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await adminAPI.updateProject(project._id, payload);
        toast.success('Project updated!');
      } else {
        await adminAPI.createProject(payload);
        toast.success('Project created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Title" name="title" placeholder="E-Commerce Platform" required
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Slug" name="slug" placeholder="e-commerce-platform"
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Short Description" name="shortDescription" placeholder="One-liner about the project" required
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Full Description" name="description" placeholder="Detailed description..." required textarea
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Technologies" name="technologies" placeholder="React, Node.js, MongoDB (comma-separated)" required
            form={form} errors={errors} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" name="category" options={CATEGORIES}
              form={form} errors={errors} onChange={handleChange} />
            <Field label="Status" name="status" options={STATUSES}
              form={form} errors={errors} onChange={handleChange} />
          </div>

          <Field label="GitHub URL" name="githubUrl" placeholder="https://github.com/..."
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Live URL" name="liveUrl" placeholder="https://..."
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Image URL" name="imageUrl" placeholder="https://images.unsplash.com/..."
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Gallery URLs" name="gallery" placeholder="https://image-1..., https://image-2..."
            form={form} errors={errors} onChange={handleChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Your Role" name="role" placeholder="Full Stack Developer"
              form={form} errors={errors} onChange={handleChange} />
            <Field label="Duration" name="duration" placeholder="6 weeks"
              form={form} errors={errors} onChange={handleChange} />
          </div>

          <Field label="The Challenge" name="problem" placeholder="What problem did this solve?" textarea
            form={form} errors={errors} onChange={handleChange} />

          <Field label="The Solution" name="solution" placeholder="How did you approach it?" textarea
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Impact / Results" name="impact" placeholder="What changed after launch?" textarea
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Key Features" name="keyFeatures" placeholder={'Authentication\nDashboards\nSearch'} textarea
            form={form} errors={errors} onChange={handleChange} />

          <Field label="Metrics" name="metrics" placeholder={'Users: 10k+\nPerformance gain: 40%'} textarea
            form={form} errors={errors} onChange={handleChange} />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured Project</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort Order</label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                min="0"
                className="input-field w-20 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const AdminProjects = () => {
  const [modal, setModal] = useState(null); // null | 'new' | project object
  const [deleting, setDeleting] = useState(null);

  const { data, loading, refetch } = useFetch(() => adminAPI.getProjects({ limit: 50 }));
  const projects = data?.data || [];

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setDeleting(project._id);
    try {
      await adminAPI.deleteProject(project._id);
      toast.success('Project deleted');
      refetch();
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{projects.length} total projects</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Project</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400 hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400 hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400 hidden lg:table-cell">Featured</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.map((project) => (
                <motion.tr
                  key={project._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-9 h-9 rounded-lg object-cover bg-slate-100"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&q=80'; }}
                      />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{project.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{project.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="tag">{project.category}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`capitalize text-xs font-medium px-2 py-0.5 rounded-full ${
                      project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                      project.status === 'in-progress' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-center">
                    {project.featured ? '⭐' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal(project)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        disabled={deleting === project._id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">🗂️</p>
              <p className="font-medium">No projects yet</p>
              <button onClick={() => setModal('new')} className="btn-primary text-sm mt-4">
                Add your first project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal !== null && (
          <ProjectModal
            project={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={refetch}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProjects;