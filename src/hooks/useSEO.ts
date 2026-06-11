import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

export function useSEO({ title, description, canonicalPath, noIndex = false }: SEOProps) {
  useEffect(() => {
    // 1. Title
    const baseTitle = 'Folient — Free Open-Source AI Portfolio Builder';
    const finalTitle = title === 'Home' ? baseTitle : `${title} | Folient`;
    document.title = finalTitle;

    // 2. Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }

    // 3. Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const baseUrl = 'https://folient.dev';
    const finalUrl = canonicalPath ? `${baseUrl}${canonicalPath}` : baseUrl;
    if (canonicalLink) {
      canonicalLink.setAttribute('href', finalUrl);
    } else {
      const newLink = document.createElement('link');
      newLink.setAttribute('rel', 'canonical');
      newLink.setAttribute('href', finalUrl);
      document.head.appendChild(newLink);
    }

    // 4. Open Graph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', finalUrl);

    // 5. Twitter Card Tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', finalTitle);
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', finalUrl);

    // 6. Robots Index/NoIndex
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const robotsVal = noIndex ? 'noindex, nofollow' : 'index, follow';
    if (robotsMeta) {
      robotsMeta.setAttribute('content', robotsVal);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'robots';
      newMeta.content = robotsVal;
      document.head.appendChild(newMeta);
    }
  }, [title, description, canonicalPath, noIndex]);
}
