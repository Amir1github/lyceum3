export const metadata = {
  title: 'Lyceum №3 - Excellence in Education',
  description: 'Official website of Lyceum №3, dedicated to academic excellence, innovation, and student development.',
};

import './styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Title and Meta Tags */}
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        
        {/* Open Graph for Social Media */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content="/assets/logo.png" />
        <meta property="og:url" content="https://lyceum3.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content="/images/lyceum-banner.jpg" />

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Lyceum №3",
            "url": "https://lyceum3.com",
            "description": metadata.description,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Main Street",
              "addressLocality": "Your City",
              "postalCode": "12345",
              "addressCountry": "Your Country"
            }
          })}
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}
