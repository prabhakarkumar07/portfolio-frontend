/**
 * pages/BlogPage.jsx - Public blog list
 */

import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { blogAPI } from '../utils/api';
import useFetch from '../hooks/useFetch';
import { CardSkeleton, ErrorMessage } from '../components/LoadingSpinner';

const BlogCard = ({ blog, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    className="card overflow-hidden flex flex-col"
  >
    {blog.coverImage?.url ? (
      <img
        src={blog.coverImage.url}
        alt={blog.title}
        className="h-48 w-full object-cover"
      />
    ) : (
      <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm">
        Add cover image in Admin
      </div>
    )}

    <div className="p-6 flex flex-col gap-3 flex-1">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {blog.authorName && <span>{blog.authorName}</span>}
        {blog.publishedAt && (
          <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
        )}
      </div>
      <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
        {blog.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {blog.excerpt || 'Add excerpt in Admin.'}
      </p>
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto pt-2">
        <Link to={`/blog/${blog.slug}`} className="text-primary-600 dark:text-primary-400 text-sm font-medium">
          Read More →
        </Link>
      </div>
    </div>
  </motion.article>
);

const BlogPage = () => {
  const { data, loading, error, refetch } = useFetch(() => blogAPI.getAll({ limit: 12 }));
  const blogs = data?.data || [];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="section-title mb-2">Blog</h1>
          <p className="section-subtitle">Thoughts, lessons, and product notes</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-slate-500 dark:text-slate-400">
            No blog posts yet. Add your first post in Admin.
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPage;
