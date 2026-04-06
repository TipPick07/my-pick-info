export const dynamic = 'force-static';
export const revalidate = false;

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://tip-pick.com/sitemap.xml',
  };
}
