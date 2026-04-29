/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://tip-pick.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*'],
  additionalPaths: async (config) => {
    return [
      { loc: '/festivals', changefreq: 'daily', priority: 0.9 },
      { loc: '/benefits', changefreq: 'daily', priority: 0.9 },
      { loc: '/weekly', changefreq: 'daily', priority: 0.8 },
      { loc: '/deadline', changefreq: 'daily', priority: 0.8 },
      { loc: '/blog', changefreq: 'daily', priority: 0.9 },
    ]
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
    ],
  },
}
