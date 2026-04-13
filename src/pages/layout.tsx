/** @jsxImportSource hono/jsx */

/* ─── Brand SVG favicon (P icon) ─── */
const FAVICON_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="%234B8EC1"/><path d="M8 4h9.5C21.6 4 25 7.4 25 12s-3.4 8-7.5 8H12v8H8V4zm4 4v8h5.5C19.6 16 21 14.5 21 12s-1.4-4-3.5-4H12z" fill="white"/></svg>`)}`;

/* ─── Tailwind custom brand colors ─── */
const TAILWIND_CONFIG = `
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4B8EC1',
          dark:    '#3A7BAF',
          light:   '#EBF5FF',
          soft:    '#D1E9F5',
          muted:   '#8BBFDF',
        },
        give:  '#78B340',
        heart: '#F5922F',
      }
    }
  }
}
`;

interface LayoutProps {
  title?: string;
  children: any;
}

export function Layout({ title, children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ?? 'ParkGive — Park with Purpose'}</title>
        <link rel="icon" type="image/svg+xml" href={FAVICON_SVG} />
        <meta name="theme-color" content="#4B8EC1" />
        <meta name="description" content="Pay to park. Proceeds support local youth programs." />
        <script src="https://cdn.tailwindcss.com" />
        <script dangerouslySetInnerHTML={{ __html: TAILWIND_CONFIG }} />
        <style dangerouslySetInnerHTML={{ __html: `
          .logo-i { position:relative; display:inline-block; }
          .logo-i-hidden { opacity:0; }
          .logo-heart {
            position:absolute;
            top:0; left:50%;
            transform:translateX(-50%) translateY(-52%);
            font-size:0.45em;
            line-height:1;
            color:#F5922F;
          }
        `}} />
      </head>
      <body class="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}

/* ─── Reusable wordmark logo ─── */
export function ParkGiveLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl';
  return (
    <span class={`font-extrabold tracking-tight leading-none inline-flex items-baseline ${sz}`}>
      <span style="color:#4B8EC1">Park</span>
      <span style="color:#78B340">
        G
        <span class="logo-i">
          <span class="logo-i-hidden">i</span>
          <span class="logo-heart">♥</span>
        </span>
        ve
      </span>
    </span>
  );
}
