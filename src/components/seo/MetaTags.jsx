import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function MetaTags({ 
  title, 
  description, 
  image, 
  url,
  type = 'website'
}) {
  const fullTitle = title ? `${title} | Breslov Academy` : 'Breslov Academy - Torah Learning Platform';
  const fullDescription = description || 'World-class Torah courses from expert Breslov instructors';
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}