/**
 * hooks/useProfile.js
 * Fetches profile picture URL and resume URL from the backend.
 * Falls back gracefully if the backend is not running.
 */

import { useState, useEffect } from 'react';
import { profileAPI } from '../utils/api';

const mapProfile = (raw = {}) => ({
  ...raw,
  fullName: raw.fullName || '',
  headline: raw.headline || '',
  bio: raw.bio || '',
  location: raw.location || '',
  email: raw.email || '',
  profilePicUrl: raw.profileImage?.url || null,
  resumeUrl: raw.resume?.url || null,
  hasProfile: Boolean(raw.profileImage?.url),
  hasResume: Boolean(raw.resume?.url),
  careerJourney: Array.isArray(raw.careerJourney) ? raw.careerJourney : [],
});

const useProfile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    headline: '',
    bio: '',
    location: '',
    email: '',
    profilePicUrl: null,
    resumeUrl: null,
    hasProfile: false,
    hasResume: false,
    careerJourney: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileAPI.get()
      .then((res) => setProfile(mapProfile(res.data.data)))
      .catch(() => {
        // Silently fail — page still renders with placeholder
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    profileAPI.get()
      .then((res) => setProfile(mapProfile(res.data.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return { ...profile, loading, refresh };
};

export default useProfile;
