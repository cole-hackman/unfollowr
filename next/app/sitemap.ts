import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://unfollowr.app/',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
