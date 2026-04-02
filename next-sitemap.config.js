/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://roadmancycling.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
  },
  transform: async (config, path) => {
    // High priority for key pages
    const highPriority = ['/', '/podcast', '/blog', '/tools', '/community'];
    const mediumPriority = ['/about', '/strength-training', '/community/clubhouse', '/community/not-done-yet'];

    let priority = config.priority;
    let changefreq = config.changefreq;

    if (highPriority.includes(path)) {
      priority = 1.0;
      changefreq = 'daily';
    } else if (mediumPriority.includes(path)) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/blog/')) {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path.startsWith('/podcast/')) {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (path.startsWith('/tools/')) {
      priority = 0.9;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
