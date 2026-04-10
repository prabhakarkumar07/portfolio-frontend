/**
 * pages/admin/AdminProfile.js
 * Upload / replace / delete profile picture and resume PDF from the admin panel.
 */

import React, { useEffect, useRef, useState } from "react";
// eslint-disable-next-line
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { profileAPI } from "../../utils/api";
import useProfile from "../../hooks/useProfile";

const accentOptions = [
  "from-primary-500 to-sky-400",
  "from-sky-500 to-emerald-400",
  "from-emerald-500 to-lime-400",
  "from-amber-400 to-orange-500",
  "from-fuchsia-500 to-primary-500",
];

// ── Drag-and-drop upload zone ─────────────────────────────────────────────────
const UploadZone = ({ accept, label, hint, icon, onFile, disabled }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 
        ${
          dragging
            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30 scale-[1.01]"
            : "border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-display font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {label}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
        Click to browse or drag & drop
      </p>
    </div>
  );
};

const ProfileDetailsForm = ({ profile, onSaved }) => {
  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    bio: "",
    location: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      fullName: profile.fullName || "",
      headline: profile.headline || "",
      bio: profile.bio || "",
      location: profile.location || "",
      email: profile.email || "",
    });
  }, [
    profile.bio,
    profile.email,
    profile.fullName,
    profile.headline,
    profile.location,
  ]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await profileAPI.update(form);
      toast.success("Profile details saved");
      onSaved();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not save profile details",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
          Profile Details
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Control the public name, headline, short bio, and contact details used
          across your portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Full Name
          </span>
          <input
            className="input-field"
            name="fullName"
            value={form.fullName}
            onChange={updateField}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Headline
          </span>
          <input
            className="input-field"
            name="headline"
            value={form.headline}
            onChange={updateField}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Location
          </span>
          <input
            className="input-field"
            name="location"
            value={form.location}
            onChange={updateField}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </span>
          <input
            className="input-field"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Bio
        </span>
        <textarea
          className="input-field min-h-32"
          name="bio"
          value={form.bio}
          onChange={updateField}
          placeholder="Use line breaks for multiple short paragraphs."
        />
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save Details"}
        </button>
      </div>
    </form>
  );
};

const CareerJourneyEditor = ({ profile, onSaved }) => {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(
      Array.isArray(profile.careerJourney) && profile.careerJourney.length > 0
        ? profile.careerJourney
        : [
            {
              year: "",
              title: "",
              subtitle: "",
              description: "",
              accent: accentOptions[0],
            },
          ],
    );
  }, [profile.careerJourney]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        year: "",
        title: "",
        subtitle: "",
        description: "",
        accent: accentOptions[current.length % accentOptions.length],
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({ careerJourney: items });
      toast.success("Career journey updated");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save timeline");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
            Career Journey
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Edit the vertical milestone timeline shown on your About page.
          </p>
        </div>
        <button type="button" onClick={addItem} className="btn-secondary">
          Add Milestone
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item.year}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Milestone {index + 1}
              </p>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs font-medium text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="input-field"
                placeholder="Year"
                value={item.year}
                onChange={(event) =>
                  updateItem(index, "year", event.target.value)
                }
              />
              <select
                className="input-field"
                value={item.accent}
                onChange={(event) =>
                  updateItem(index, "accent", event.target.value)
                }
              >
                {accentOptions.map((accent) => (
                  <option key={accent} value={accent}>
                    {accent}
                  </option>
                ))}
              </select>
              <input
                className="input-field md:col-span-2"
                placeholder="Title"
                value={item.title}
                onChange={(event) =>
                  updateItem(index, "title", event.target.value)
                }
              />
              <input
                className="input-field md:col-span-2"
                placeholder="Subtitle"
                value={item.subtitle}
                onChange={(event) =>
                  updateItem(index, "subtitle", event.target.value)
                }
              />
              <textarea
                className="input-field md:col-span-2 min-h-28"
                placeholder="Description"
                value={item.description}
                onChange={(event) =>
                  updateItem(index, "description", event.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn-primary"
        >
          {saving ? "Saving..." : "Save Timeline"}
        </button>
      </div>
    </div>
  );
};

const SiteContentForm = ({ profile, onSaved }) => {
  const [form, setForm] = useState({
    siteTitle: "",
    logoLetter: "",
    footerTagline: "",
    availabilityBadge: "",
    availabilityStatus: "",
    availabilityDetails: "",
    heroDescription: "",
    homeCtaTitle: "",
    homeCtaDescription: "",
    homePrimaryCtaText: "",
    homeSecondaryCtaText: "",
    contactIntro: "",
    githubUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    projectsPageTag: "",
    projectsPageTitle: "",
    projectsPageSubtitle: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      siteTitle: profile.siteTitle || "",
      logoLetter: profile.logoLetter || "",
      footerTagline: profile.footerTagline || "",
      availabilityBadge: profile.availabilityBadge || "",
      availabilityStatus: profile.availabilityStatus || "",
      availabilityDetails: profile.availabilityDetails || "",
      heroDescription: profile.heroDescription || "",
      homeCtaTitle: profile.homeCtaTitle || "",
      homeCtaDescription: profile.homeCtaDescription || "",
      homePrimaryCtaText: profile.homePrimaryCtaText || "",
      homeSecondaryCtaText: profile.homeSecondaryCtaText || "",
      contactIntro: profile.contactIntro || "",
      githubUrl: profile.githubUrl || "",
      linkedinUrl: profile.linkedinUrl || "",
      twitterUrl: profile.twitterUrl || "",
      projectsPageTag: profile.projectsPageTag || "",
      projectsPageTitle: profile.projectsPageTitle || "",
      projectsPageSubtitle: profile.projectsPageSubtitle || "",
    });
  }, [
    profile.siteTitle,
    profile.logoLetter,
    profile.footerTagline,
    profile.availabilityBadge,
    profile.availabilityStatus,
    profile.availabilityDetails,
    profile.heroDescription,
    profile.homeCtaTitle,
    profile.homeCtaDescription,
    profile.homePrimaryCtaText,
    profile.homeSecondaryCtaText,
    profile.contactIntro,
    profile.githubUrl,
    profile.linkedinUrl,
    profile.twitterUrl,
    profile.projectsPageTag,
    profile.projectsPageTitle,
    profile.projectsPageSubtitle,
  ]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await profileAPI.update(form);
      toast.success("Site content saved");
      onSaved();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not save site content",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
          Site Content
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update the shared text and links used across the navbar, footer, home,
          contact, and projects pages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="input-field"
          name="siteTitle"
          placeholder="Site title"
          value={form.siteTitle}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="logoLetter"
          placeholder="Logo letter"
          maxLength={2}
          value={form.logoLetter}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="availabilityBadge"
          placeholder="Availability badge"
          value={form.availabilityBadge}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="availabilityStatus"
          placeholder="Availability status"
          value={form.availabilityStatus}
          onChange={updateField}
        />
        <input
          className="input-field md:col-span-2"
          name="availabilityDetails"
          placeholder="Availability details"
          value={form.availabilityDetails}
          onChange={updateField}
        />
        <input
          className="input-field md:col-span-2"
          name="footerTagline"
          placeholder="Footer tagline"
          value={form.footerTagline}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="projectsPageTag"
          placeholder="Projects page tag"
          value={form.projectsPageTag}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="projectsPageTitle"
          placeholder="Projects page title"
          value={form.projectsPageTitle}
          onChange={updateField}
        />
        <input
          className="input-field md:col-span-2"
          name="projectsPageSubtitle"
          placeholder="Projects page subtitle"
          value={form.projectsPageSubtitle}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="homePrimaryCtaText"
          placeholder="Primary CTA text"
          value={form.homePrimaryCtaText}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="homeSecondaryCtaText"
          placeholder="Secondary CTA text"
          value={form.homeSecondaryCtaText}
          onChange={updateField}
        />
        <input
          className="input-field md:col-span-2"
          name="homeCtaTitle"
          placeholder="Home CTA title"
          value={form.homeCtaTitle}
          onChange={updateField}
        />
      </div>

      <textarea
        className="input-field min-h-24"
        name="heroDescription"
        placeholder="Hero description"
        value={form.heroDescription}
        onChange={updateField}
      />
      <textarea
        className="input-field min-h-24"
        name="homeCtaDescription"
        placeholder="Home CTA description"
        value={form.homeCtaDescription}
        onChange={updateField}
      />
      <textarea
        className="input-field min-h-24"
        name="contactIntro"
        placeholder="Contact intro"
        value={form.contactIntro}
        onChange={updateField}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="input-field"
          name="githubUrl"
          placeholder="GitHub URL"
          value={form.githubUrl}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="linkedinUrl"
          placeholder="LinkedIn URL"
          value={form.linkedinUrl}
          onChange={updateField}
        />
        <input
          className="input-field"
          name="twitterUrl"
          placeholder="Twitter URL"
          value={form.twitterUrl}
          onChange={updateField}
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save Site Content"}
        </button>
      </div>
    </form>
  );
};

const StatsEditor = ({ profile, onSaved }) => {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(
      Array.isArray(profile.stats) && profile.stats.length > 0
        ? profile.stats
        : [
            { label: "Years Experience", value: "5+" },
            { label: "Projects Shipped", value: "40+" },
          ],
    );
  }, [profile.stats]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () =>
    setItems((current) => [...current, { label: "", value: "" }]);
  const removeItem = (index) =>
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({ stats: items });
      toast.success("Stats updated");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save stats");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
            Homepage Stats
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add, update, or remove the stat cards shown on the homepage.
          </p>
        </div>
        <button type="button" onClick={addItem} className="btn-secondary">
          Add Stat
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`stat-${index}`}
            className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <input
              className="input-field"
              placeholder="Label"
              value={item.label}
              onChange={(event) =>
                updateItem(index, "label", event.target.value)
              }
            />
            <input
              className="input-field"
              placeholder="Value"
              value={item.value}
              onChange={(event) =>
                updateItem(index, "value", event.target.value)
              }
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="btn-secondary"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn-primary"
        >
          {saving ? "Saving..." : "Save Stats"}
        </button>
      </div>
    </div>
  );
};

const SkillsEditor = ({ profile, onSaved }) => {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(
      Array.isArray(profile.skillCategories) ? profile.skillCategories : [],
    );
  }, [profile.skillCategories]);

  const updateCategory = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const updateSkill = (categoryIndex, skillIndex, field, value) => {
    setItems((current) =>
      current.map((category, itemIndex) =>
        itemIndex === categoryIndex
          ? {
              ...category,
              skills: category.skills.map((skill, currentSkillIndex) =>
                currentSkillIndex === skillIndex
                  ? {
                      ...skill,
                      [field]: field === "level" ? Number(value) : value,
                    }
                  : skill,
              ),
            }
          : category,
      ),
    );
  };

  const addCategory = () =>
    setItems((current) => [
      ...current,
      { name: "", icon: "✨", skills: [{ name: "", level: 80 }] },
    ]);
  const removeCategory = (index) =>
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  const addSkill = (categoryIndex) =>
    setItems((current) =>
      current.map((category, itemIndex) =>
        itemIndex === categoryIndex
          ? {
              ...category,
              skills: [...category.skills, { name: "", level: 80 }],
            }
          : category,
      ),
    );
  const removeSkill = (categoryIndex, skillIndex) => {
    setItems((current) =>
      current.map((category, itemIndex) =>
        itemIndex === categoryIndex
          ? {
              ...category,
              skills: category.skills.filter(
                (_, currentSkillIndex) => currentSkillIndex !== skillIndex,
              ),
            }
          : category,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({ skillCategories: items });
      toast.success("Skills updated");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save skills");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
            Skills
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage skill categories and the individual skills shown on the About
            page.
          </p>
        </div>
        <button type="button" onClick={addCategory} className="btn-secondary">
          Add Category
        </button>
      </div>

      <div className="space-y-4">
        {items.map((category, categoryIndex) => (
          <div
            key={`category-${categoryIndex}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-[90px_1fr_auto] gap-3">
              <input
                className="input-field"
                placeholder="Icon"
                value={category.icon}
                onChange={(event) =>
                  updateCategory(categoryIndex, "icon", event.target.value)
                }
              />
              <input
                className="input-field"
                placeholder="Category name"
                value={category.name}
                onChange={(event) =>
                  updateCategory(categoryIndex, "name", event.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeCategory(categoryIndex)}
                className="btn-secondary"
              >
                Delete
              </button>
            </div>

            <div className="space-y-3">
              {category.skills.map((skill, skillIndex) => (
                <div
                  key={`skill-${categoryIndex}-${skillIndex}`}
                  className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3"
                >
                  <input
                    className="input-field"
                    placeholder="Skill name"
                    value={skill.name}
                    onChange={(event) =>
                      updateSkill(
                        categoryIndex,
                        skillIndex,
                        "name",
                        event.target.value,
                      )
                    }
                  />
                  <input
                    className="input-field"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Level"
                    value={skill.level}
                    onChange={(event) =>
                      updateSkill(
                        categoryIndex,
                        skillIndex,
                        "level",
                        event.target.value,
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(categoryIndex, skillIndex)}
                    className="btn-secondary"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addSkill(categoryIndex)}
              className="btn-secondary"
            >
              Add Skill
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn-primary"
        >
          {saving ? "Saving..." : "Save Skills"}
        </button>
      </div>
    </div>
  );
};

const ExperiencesEditor = ({ profile, onSaved }) => {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(Array.isArray(profile.experiences) ? profile.experiences : []);
  }, [profile.experiences]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () =>
    setItems((current) => [
      ...current,
      { title: "", company: "", period: "", description: "", tech: [] },
    ]);
  const removeItem = (index) =>
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        experiences: items.map((item) => ({
          ...item,
          tech: Array.isArray(item.tech)
            ? item.tech
            : String(item.tech || "")
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean),
        })),
      });
      toast.success("Experience updated");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save experience");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
            Work Experience
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage the timeline cards on the About page.
          </p>
        </div>
        <button type="button" onClick={addItem} className="btn-secondary">
          Add Role
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`experience-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="input-field"
                placeholder="Title"
                value={item.title}
                onChange={(event) =>
                  updateItem(index, "title", event.target.value)
                }
              />
              <input
                className="input-field"
                placeholder="Company"
                value={item.company}
                onChange={(event) =>
                  updateItem(index, "company", event.target.value)
                }
              />
              <input
                className="input-field md:col-span-2"
                placeholder="Period"
                value={item.period}
                onChange={(event) =>
                  updateItem(index, "period", event.target.value)
                }
              />
            </div>
            <textarea
              className="input-field min-h-24"
              placeholder="Description"
              value={item.description}
              onChange={(event) =>
                updateItem(index, "description", event.target.value)
              }
            />
            <input
              className="input-field"
              placeholder="Tech stack, comma separated"
              value={
                Array.isArray(item.tech)
                  ? item.tech.join(", ")
                  : item.tech || ""
              }
              onChange={(event) =>
                updateItem(index, "tech", event.target.value)
              }
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="btn-secondary"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn-primary"
        >
          {saving ? "Saving..." : "Save Experience"}
        </button>
      </div>
    </div>
  );
};

const ResumeHighlightsEditor = ({ profile, onSaved }) => {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(
      Array.isArray(profile.resumeHighlights) ? profile.resumeHighlights : [],
    );
  }, [profile.resumeHighlights]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () =>
    setItems((current) => [
      ...current,
      { icon: "✨", label: "", value: "", sub: "" },
    ]);
  const removeItem = (index) =>
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({ resumeHighlights: items });
      toast.success("Resume highlights updated");
      onSaved();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not save resume highlights",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
            Resume Highlights
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control the highlight cards and bullet points used in the resume
            section.
          </p>
        </div>
        <button type="button" onClick={addItem} className="btn-secondary">
          Add Highlight
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`highlight-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-[90px_1fr_1fr] gap-3">
              <input
                className="input-field"
                placeholder="Icon"
                value={item.icon}
                onChange={(event) =>
                  updateItem(index, "icon", event.target.value)
                }
              />
              <input
                className="input-field"
                placeholder="Label"
                value={item.label}
                onChange={(event) =>
                  updateItem(index, "label", event.target.value)
                }
              />
              <input
                className="input-field"
                placeholder="Value"
                value={item.value}
                onChange={(event) =>
                  updateItem(index, "value", event.target.value)
                }
              />
            </div>
            <input
              className="input-field"
              placeholder="Subtext"
              value={item.sub}
              onChange={(event) => updateItem(index, "sub", event.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="btn-secondary"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn-primary"
        >
          {saving ? "Saving..." : "Save Highlights"}
        </button>
      </div>
    </div>
  );
};

// ── Profile Picture Card ──────────────────────────────────────────────────────
const ProfilePicCard = ({ url, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imgErr, setImgErr] = useState(false);
  const handleFile = async (file) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    // temporary preview
    const tempUrl = URL.createObjectURL(file);
    setPreview(tempUrl);

    setImgErr(false);
    setUploading(true);

    try {
      const res = await profileAPI.uploadPicture(file);

      // 👉 replace with actual URL from backend
      const imageUrl = res.data.imageUrl;

      setPreview(imageUrl);

      toast.success("Profile picture updated! ✅");
      onUpload();
    } catch (err) {
      setPreview(null);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || url;
  const hasPhoto = !!(displayUrl && !imgErr);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await profileAPI.deleteAsset("profileImage");
      setPreview(null);
      toast.success("Profile picture deleted");
      onUpload();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not delete profile picture",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
        Profile Picture
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        This photo appears on your homepage and About page. JPG, PNG, or WebP ·
        max 5 MB.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Preview */}
        <div className="shrink-0">
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800">
            {hasPhoto ? (
              <img
                src={displayUrl}
                alt="Profile"
                className="w-full h-full object-cover object-center"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-400 to-accent-500">
                <svg
                  className="w-10 h-10 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-white/60 text-xs mt-1">No photo</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            )}
          </div>
          {hasPhoto && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="mt-2 w-36 text-center text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors font-medium"
            >
              {deleting ? "Removing…" : "✕ Remove photo"}
            </button>
          )}
        </div>

        {/* Upload zone */}
        <div className="flex-1 w-full">
          <UploadZone
            accept="image/jpeg,image/png,image/webp"
            label={hasPhoto ? "Replace Photo" : "Upload Photo"}
            hint="JPG, PNG, or WebP · max 5 MB"
            icon="🖼️"
            onFile={handleFile}
            disabled={uploading}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
          💡 Tips for best results
        </p>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
          <li>• Use a square image (1:1 ratio) for best display</li>
          <li>• Minimum 400×400 px recommended</li>
          <li>• Clear background or professional headshot works best</li>
        </ul>
      </div>
    </div>
  );
};

// ── Resume Card ───────────────────────────────────────────────────────────────
const ResumeCard = ({ url, hasResume, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFile = async (file) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed for resume");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume must be under 10 MB");
      return;
    }

    setUploading(true);

    try {
      const res = await profileAPI.uploadResume(file);

      const resumeUrl = res.data.resumeUrl; // ✅ FIXED

      toast.success("Resume uploaded! ✅");

      onUpload(resumeUrl); // ✅ now works
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await profileAPI.deleteAsset("resume");
      toast.success("Resume deleted");
      onUpload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete resume");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-1">
        Resume / CV
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Visitors can download your resume from the About page. PDF only · max 10
        MB.
      </p>

      {/* Current resume status */}
      {hasResume && url ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 mb-6"
        >
          {/* PDF icon */}
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">
              Resume uploaded ✓
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate mt-0.5 font-mono">
              {url}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
            >
              Preview
            </a>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              {deleting ? "…" : "Remove"}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-6">
          <svg
            className="w-5 h-5 text-amber-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            No resume uploaded yet. Upload one below.
          </p>
        </div>
      )}

      {/* Upload zone */}
      <UploadZone
        accept="application/pdf"
        label={hasResume ? "Replace Resume" : "Upload Resume"}
        hint="PDF only · max 10 MB"
        icon="📄"
        onFile={handleFile}
        disabled={uploading || deleting}
      />

      {uploading && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800">
          <svg
            className="w-4 h-4 animate-spin text-primary-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-primary-700 dark:text-primary-300">
            Uploading resume…
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
          💡 Tips for a great resume
        </p>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
          <li>• Keep it 1–2 pages for most roles</li>
          <li>• Make sure fonts are embedded in the PDF</li>
          <li>• Use ATS-friendly formatting (no tables or text boxes)</li>
        </ul>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminProfile = () => {
  const profile = useProfile();

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Profile & Resume
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your profile picture, career timeline, and downloadable resume.
          Changes go live immediately.
        </p>
      </div>

      {/* Live preview link */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <svg
          className="w-4 h-4 text-slate-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Preview changes live on your{" "}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            portfolio homepage
          </a>{" "}
          and{" "}
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            About page
          </a>
          .
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ProfileDetailsForm profile={profile} onSaved={profile.refresh} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <SiteContentForm profile={profile} onSaved={profile.refresh} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <StatsEditor profile={profile} onSaved={profile.refresh} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <CareerJourneyEditor profile={profile} onSaved={profile.refresh} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SkillsEditor profile={profile} onSaved={profile.refresh} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <ExperiencesEditor profile={profile} onSaved={profile.refresh} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
      >
        <ResumeHighlightsEditor profile={profile} onSaved={profile.refresh} />
      </motion.div>

      {/* Profile picture */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <ProfilePicCard
          url={profile.profilePicUrl}
          onUpload={profile.refresh}
        />
      </motion.div>

      {/* Resume */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <ResumeCard
          url={profile.resumeUrl}
          hasResume={profile.hasResume}
         onUpload={() => {
  profile.refresh();
}}
        />
      </motion.div>
    </div>
  );
};

export default AdminProfile;
