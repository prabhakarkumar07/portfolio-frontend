/**
 * pages/admin/AdminDashboard.js - Overview stats and quick actions
 */

import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { adminAPI } from '../../utils/api';
import useFetch from '../../hooks/useFetch';
import useProfile from '../../hooks/useProfile';
import { PageLoader } from '../../components/LoadingSpinner';

const StatCard = ({ label, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card p-6 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-display font-bold text-3xl text-slate-900 dark:text-white">{value}</p>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { data: projectsData, loading: pLoading } = useFetch(() => adminAPI.getProjects({ limit: 1 }));
  const { data: messagesData, loading: mLoading } = useFetch(() => adminAPI.getMessages({ limit: 1 }));
  const { data: unreadData } = useFetch(() => adminAPI.getMessages({ isRead: false, limit: 5 }));
  const profile = useProfile();

  const totalProjects = projectsData?.total ?? '—';
  const totalMessages = messagesData?.total ?? '—';
  const unreadCount = messagesData?.unreadCount ?? '—';
  const recentMessages = unreadData?.data || [];

  // Profile completeness
  const completenessItems = [
    { label: 'Profile picture', done: profile.hasProfile, link: '/admin/profile' },
    { label: 'Resume uploaded', done: profile.hasResume, link: '/admin/profile' },
    { label: 'Homepage stats added', done: (profile.stats?.length ?? 0) > 0, link: '/admin/profile' },
    { label: 'Skills added', done: (profile.skillCategories?.length ?? 0) > 0, link: '/admin/profile' },
    { label: 'Projects added', done: (projectsData?.total ?? 0) > 0, link: '/admin/projects' },
  ];
  const completePct = Math.round((completenessItems.filter((i) => i.done).length / completenessItems.length) * 100);

  if (pLoading || mLoading) return <PageLoader />;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Projects" value={totalProjects} icon="🗂️" color="bg-primary-50 dark:bg-primary-950" delay={0} />
        <StatCard label="Messages" value={totalMessages} icon="✉️" color="bg-blue-50 dark:bg-blue-950" delay={0.1} />
        <StatCard label="Unread" value={unreadCount} icon="🔔" color="bg-amber-50 dark:bg-amber-950" delay={0.2} />
      </div>

      {/* Profile Completeness */}
      {completePct < 100 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-semibold text-slate-900 dark:text-white">Portfolio Completeness</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Complete your profile so visitors see the best version of your portfolio.</p>
            </div>
            <span className="font-display font-bold text-2xl text-primary-600 dark:text-primary-400">{completePct}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <motion.div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${completePct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
          <div className="space-y-2">
            {completenessItems.map((item) => (
              <Link key={item.label} to={item.link}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm
                  ${item.done ? 'opacity-60 cursor-default pointer-events-none' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
                  {item.done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={item.done ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300 font-medium'}>
                  {item.label}
                </span>
                {!item.done && (
                  <span className="ml-auto text-xs text-primary-600 dark:text-primary-400">Fix →</span>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/projects" className="btn-primary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Project
          </Link>
          <Link to="/admin/messages" className="btn-secondary text-sm">
            View All Messages
          </Link>
          <Link to="/admin/profile" className="btn-ghost text-sm">
            Manage Site Content →
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
            View Portfolio ↗
          </a>
        </div>
      </motion.div>

      {/* Recent Unread Messages */}
      {recentMessages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
              Unread Messages <span className="text-primary-500 text-base">({unreadCount})</span>
            </h2>
            <Link to="/admin/messages" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div key={msg._id} className="card p-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm shrink-0">
                  {msg.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{msg.name}</p>
                    <p className="text-xs text-slate-400 shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">{msg.subject}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
