import { useEffect } from 'react';

const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || window.location.origin;

const ensureMetaTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

const ensureCanonicalLink = (href) => {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

const ensureJsonLd = (schema) => {
  const id = 'seo-json-ld';
  let element = document.head.querySelector(`#${id}`);

  if (!schema) {
    if (element) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
};

const useSeo = ({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`;
    const nextTitle = title ? `${title} | Prabhakar Kumar` : 'Prabhakar Kumar';
    const nextDescription =
      description ||
      'Portfolio of Prabhakar Kumar, full stack Java developer building scalable apps with Spring Boot, React, and modern web tooling.';

    document.title = nextTitle;
    ensureCanonicalLink(canonicalUrl);

    ensureMetaTag('meta[name="description"]', {
      name: 'description',
      content: nextDescription,
    });

    ensureMetaTag('meta[property="og:title"]', {
      property: 'og:title',
      content: nextTitle,
    });
    ensureMetaTag('meta[property="og:description"]', {
      property: 'og:description',
      content: nextDescription,
    });
    ensureMetaTag('meta[property="og:type"]', {
      property: 'og:type',
      content: type,
    });
    ensureMetaTag('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });

    if (image) {
      ensureMetaTag('meta[property="og:image"]', {
        property: 'og:image',
        content: image,
      });
      ensureMetaTag('meta[name="twitter:image"]', {
        name: 'twitter:image',
        content: image,
      });
    }

    ensureMetaTag('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: image ? 'summary_large_image' : 'summary',
    });
    ensureMetaTag('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: nextTitle,
    });
    ensureMetaTag('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: nextDescription,
    });

    ensureJsonLd(jsonLd);

    return () => {
      ensureJsonLd(null);
    };
  }, [description, image, jsonLd, path, title, type]);
};

export default useSeo;
