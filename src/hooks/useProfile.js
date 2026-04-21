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
  siteTitle: raw.siteTitle || 'Portfolio',
  logoLetter: raw.logoLetter || 'P',
  footerTagline: raw.footerTagline || '',
  availabilityBadge: raw.availabilityBadge || '',
  availabilityStatus: raw.availabilityStatus || '',
  availabilityDetails: raw.availabilityDetails || '',
  heroDescription: raw.heroDescription || '',
  homeCtaTitle: raw.homeCtaTitle || '',
  homeCtaDescription: raw.homeCtaDescription || '',
  homePrimaryCtaText: raw.homePrimaryCtaText || '',
  homeSecondaryCtaText: raw.homeSecondaryCtaText || '',
  contactIntro: raw.contactIntro || '',
  githubUrl: raw.githubUrl || '',
  linkedinUrl: raw.linkedinUrl || '',
  twitterUrl: raw.twitterUrl || '',
  projectsPageTag: raw.projectsPageTag || '',
  projectsPageTitle: raw.projectsPageTitle || '',
  projectsPageSubtitle: raw.projectsPageSubtitle || '',
  profilePicUrl: raw.profileImage?.url || null,
  resumeUrl: raw.resume?.url || null,
  resumeName: raw.resume?.originalName || '',
  resumeSize: Number(raw.resume?.size || 0),
  hasProfile: Boolean(raw.profileImage?.url),
  hasResume: Boolean(raw.resume?.url || raw.resume?.originalName || raw.resume?.size),
  careerJourney: Array.isArray(raw.careerJourney) ? raw.careerJourney : [],
  stats: Array.isArray(raw.stats) ? raw.stats : [],
  skillCategories: Array.isArray(raw.skillCategories) ? raw.skillCategories : [],
  experiences: Array.isArray(raw.experiences) ? raw.experiences : [],
  resumeHighlights: Array.isArray(raw.resumeHighlights) ? raw.resumeHighlights : [],
});

const useProfile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    headline: '',
    bio: '',
    location: '',
    email: '',
    siteTitle: 'Portfolio',
    logoLetter: 'P',
    footerTagline: '',
    availabilityBadge: '',
    availabilityStatus: '',
    availabilityDetails: '',
    heroDescription: '',
    homeCtaTitle: '',
    homeCtaDescription: '',
    homePrimaryCtaText: '',
    homeSecondaryCtaText: '',
    contactIntro: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    projectsPageTag: '',
    projectsPageTitle: '',
    projectsPageSubtitle: '',
    profilePicUrl: null,
    resumeUrl: null,
    resumeName: '',
    resumeSize: 0,
    hasProfile: false,
    hasResume: false,
    careerJourney: [],
    stats: [],
    skillCategories: [],
    experiences: [],
    resumeHighlights: [],
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
