/** @type {import('next-sitemap').IConfig} */
const config = {
    siteUrl: 'https://lyceum3-production.up.railway.app',
    generateRobotsTxt: true,
    sitemapSize: 5000,
    changefreq: 'daily',
    priority: 0.7,
    exclude: [], // Исключает все API-эндпоинты из sitemap.xml
    robotsTxtOptions: {
      policies: [
        { userAgent: '*', allow: '/' },
        { userAgent: '*', disallow: ['/api', '/private', '/secret'] }, // Запрещает индексировать API
      ],
    },
  };
  
  module.exports = config;
  