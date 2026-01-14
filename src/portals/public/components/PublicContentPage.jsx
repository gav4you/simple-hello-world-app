import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

import content from '../publicContent.json';

/**
 * Renders a marketing page from publicContent.json.
 * This keeps copy + SEO metadata in one place (also used by build-time prerender).
 */
export function PublicContentPage({ routeKey }) {
  const page = content?.routes?.[routeKey];
  const site = content?.site;

  if (!page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The marketing content configuration is missing for <code>{routeKey}</code>.
        </p>
        <div className="mt-6">
          <Button asChild><Link to="/">Back home</Link></Button>
        </div>
      </div>
    );
  }

  const title = page.title || site?.name || 'Breslov Academy';
  const description = page.description || site?.defaultDescription || '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <Helmet>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
        {description ? <meta property="og:description" content={description} /> : null}
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {page.hero?.heading || site?.tagline || title}
          </h1>

          {page.hero?.body ? (
            <p className="mt-4 text-base text-muted-foreground">
              {page.hero.body}
            </p>
          ) : null}

          {Array.isArray(page.hero?.ctas) && page.hero.ctas.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {page.hero.ctas.map((cta) => (
                <Button key={cta.href + cta.label} asChild>
                  <a href={cta.href}>{cta.label}</a>
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-6">
          {Array.isArray(page.sections) ? (
            <div className="grid gap-5">
              {page.sections.map((sec, idx) => (
                <div key={idx}>
                  {sec.title ? <div className="text-sm font-medium">{sec.title}</div> : null}
                  {Array.isArray(sec.bullets) ? (
                    <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                      {sec.bullets.map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  ) : null}
                  {sec.body ? (
                    <p className="mt-2 text-sm text-muted-foreground">{sec.body}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 text-xs text-muted-foreground">
            Storefronts live at <code className="rounded bg-muted px-2 py-0.5">/s/&lt;school&gt;</code>.
          </div>
        </div>
      </section>
    </div>
  );
}
