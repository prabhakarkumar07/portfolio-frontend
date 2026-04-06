/**
 * pages/admin/AdminMessages.js - View and manage contact form submissions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import useFetch from '../../hooks/useFetch';
import { PageLoader } from '../../components/LoadingSpinner';

const MessageDetail = ({ message, onClose, onMarkRead, onDelete }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-display font-semibold text-slate-900 dark:text-white">Message Details</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
            {message.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{message.name}</p>
            <a href={`mailto:${message.email}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{message.email}</a>
          </div>
        </div>

        {[
          { label: 'Subject', value: message.subject },
          { label: 'Received', value: new Date(message.createdAt).toLocaleString() },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-slate-800 dark:text-slate-200 text-sm">{item.value}</p>
          </div>
        ))}

        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Message</p>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {message.message}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {!message.isRead && (
            <button onClick={() => onMarkRead(message._id)} className="btn-primary flex-1 justify-center text-sm">
              Mark as Read
            </button>
          )}
          <a
            href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
            className="btn-secondary flex-1 justify-center text-sm"
          >
            Reply via Email
          </a>
          <button
            onClick={() => { onDelete(message._id); onClose(); }}
            className="px-4 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

const AdminMessages = () => {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const params = filter === 'unread' ? { isRead: false } : filter === 'read' ? { isRead: true } : {};
  const { data, loading, refetch } = useFetch(() => adminAPI.getMessages({ ...params, limit: 50 }), [filter]);
  const messages = data?.data || [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkRead = async (id) => {
    try {
      await adminAPI.markAsRead(id);
      toast.success('Marked as read');
      if (selected?._id === id) setSelected((p) => ({ ...p, isRead: true }));
      refetch();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminAPI.deleteMessage(id);
      toast.success('Message deleted');
      setSelected(null);
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Messages {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-sm rounded-full bg-primary-500 text-white">{unreadCount} new</span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{messages.length} messages</p>
        </div>
        {/* Filter Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="card divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No messages found</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                !msg.isRead ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''
              }`}
              onClick={() => setSelected(msg)}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                !msg.isRead
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {msg.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-medium text-sm truncate ${!msg.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {msg.name}
                    {!msg.isRead && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-primary-500 inline-block" />}
                  </p>
                  <p className="text-xs text-slate-400 shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-xs text-primary-600 dark:text-primary-400 truncate mb-0.5">{msg.subject}</p>
                <p className="text-xs text-slate-400 truncate">{msg.message}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!msg.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMarkRead(msg._id); }}
                    className="p-1 rounded text-slate-400 hover:text-emerald-500 transition-colors"
                    title="Mark as read"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}
                  className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <MessageDetail
            message={selected}
            onClose={() => setSelected(null)}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMessages;
