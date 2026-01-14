// v8.6 Premium UI Tokens
// Single place to tune the "MasterClass x Ivy League x Sefaria" look.
// Keep purely presentational so it's safe to reuse across all pages.

export const tokens = {
  page: {
    outer:
      'min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground',
    inner: 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
  },
  glass: {
    card:
      'relative rounded-2xl border border-border/60 bg-background/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]',
    cardHover:
      'transition-all hover:border-border/80 hover:bg-background/50 hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.45)]',
  },
  text: {
    h1: 'text-3xl sm:text-4xl font-semibold tracking-tight',
    h2: 'text-xl sm:text-2xl font-semibold tracking-tight',
    lead: 'text-sm sm:text-base text-muted-foreground',
    meta: 'text-xs text-muted-foreground',
  },
  layout: {
    sectionGap: 'space-y-6',
    gridGap: 'gap-4 sm:gap-6',
  },
  focus:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
};

export const cx = (...parts) => parts.filter(Boolean).join(' ');
