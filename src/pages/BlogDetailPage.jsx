/**
 * pages/BlogDetailPage.jsx - Public blog detail
 */

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { blogAPI } from '../utils/api';
import useFetch from '../hooks/useFetch';
import { PageLoader, ErrorMessage } from '../components/LoadingSpinner';
import useSeo from '../hooks/useSeo';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const { data, loading, error, refetch } = useFetch(() => blogAPI.getBySlug(slug));
  const blog = data?.data;

  useSeo({
    title: blog?.title || 'Blog',
    description: blog?.excerpt || blog?.content?.slice(0, 160),
    path: `/blog/${slug}`,
    image: blog?.coverImage?.url,
    type: 'article',
    jsonLd: blog
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: blog.title,
          description: blog.excerpt || blog.content?.slice(0, 160),
          image: blog.coverImage?.url || undefined,
          author: {
            '@type': 'Person',
            name: blog.authorName || 'Prabhakar Kumar',
          },
          datePublished: blog.publishedAt || undefined,
          url: `${window.location.origin}/blog/${slug}`,
        }
      : null,
  });

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center text-slate-500 dark:text-slate-400">
        Blog not found.
      </div>
    );
  }

  const paragraphs = String(blog.content || '').split('\n').map((p) => p.trim()).filter(Boolean);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/blog" className="text-sm text-primary-600 dark:text-primary-400">
          ← Back to Blog
        </Link>
        <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">
          {blog.title}
        </h1>
        <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-3">
          {blog.authorName && <span>{blog.authorName}</span>}
          {blog.publishedAt && <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>}
        </div>

        {blog.coverImage?.url && (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="mt-6 w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-8 space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={`${i}-${p.slice(0, 18)}`}>{p}</p>)
          ) : (
            <p>Blog content missing. Update it in Admin.</p>
          )}
        </div>

        {blog.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogDetailPage;
