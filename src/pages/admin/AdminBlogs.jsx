/**
 * pages/admin/AdminBlogs.jsx - CRUD for blog posts
 */

import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import useFetch from '../../hooks/useFetch';
import { PageLoader } from '../../components/LoadingSpinner';

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  tags: '',
  authorName: '',
  status: 'draft',
  featured: false,
  coverImage: { url: '', publicId: '' },
};

const AdminBlogs = () => {
  const { data, loading, refetch } = useFetch(() => adminAPI.getBlogs({ limit: 50 }));
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const blogs = useMemo(() => data?.data || [], [data]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      authorName: blog.authorName || '',
      status: blog.status || 'draft',
      featured: Boolean(blog.featured),
      coverImage: blog.coverImage || { url: '', publicId: '' },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await adminAPI.deleteBlog(id);
      toast.success('Blog deleted');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const res = await adminAPI.uploadBlogImage(file);
      setForm((current) => ({ ...current, coverImage: res.data.data }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        authorName: form.authorName.trim(),
        status: form.status,
        featured: form.featured,
        coverImage: form.coverImage,
      };

      if (editingId) {
        await adminAPI.updateBlog(editingId, payload);
        toast.success('Blog updated');
      } else {
        await adminAPI.createBlog(payload);
        toast.success('Blog created');
      }

      resetForm();
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Blog Posts</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Create, edit, and publish blog posts. Images are uploaded to Cloudinary.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Title</span>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Author Name</span>
            <input
              className="input-field"
              value={form.authorName}
              onChange={(e) => setForm((c) => ({ ...c, authorName: e.target.value }))}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-slate-600 dark:text-slate-300">Excerpt</span>
          <textarea
            className="input-field min-h-20"
            value={form.excerpt}
            onChange={(e) => setForm((c) => ({ ...c, excerpt: e.target.value }))}
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-600 dark:text-slate-300">Content</span>
          <textarea
            className="input-field min-h-40"
            value={form.content}
            onChange={(e) => setForm((c) => ({ ...c, content: e.target.value }))}
            required
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Tags (comma separated)</span>
            <input
              className="input-field"
              value={form.tags}
              onChange={(e) => setForm((c) => ({ ...c, tags: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Status</span>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((c) => ({ ...c, featured: e.target.checked }))}
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">Featured</span>
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="w-32 h-20 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {form.coverImage?.url ? (
              <img src={form.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-400">No image</span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              className="text-sm"
              disabled={uploading}
            />
            <p className="text-xs text-slate-400 mt-1">Recommended: 1200x630 JPG/PNG</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Blog' : 'Create Blog'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {blogs.length === 0 && (
          <div className="card p-6 text-sm text-slate-500 dark:text-slate-400">
            No blog posts yet. Create one above.
          </div>
        )}
        {blogs.map((blog) => (
          <div key={blog._id} className="card p-4 flex flex-col md:flex-row gap-4 md:items-center">
            <div className="w-28 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              {blog.coverImage?.url && (
                <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-1">
                <span className={blog.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}>
                  {blog.status}
                </span>
                {blog.publishedAt && <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>}
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">{blog.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{blog.excerpt}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm" onClick={() => handleEdit(blog)}>Edit</button>
              <button className="btn-ghost text-sm text-red-600" onClick={() => handleDelete(blog._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlogs;
