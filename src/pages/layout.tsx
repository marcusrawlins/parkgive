/** @jsxImportSource hono/jsx */

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
        <link rel="icon" type="image/png" href="/logo-icon.png" />
        <meta name="theme-color" content="#4B8EC1" />
        <meta name="description" content="Pay to park. Proceeds support local youth programs." />
        <script src="https://cdn.tailwindcss.com" />
        <script dangerouslySetInnerHTML={{ __html: TAILWIND_CONFIG }} />
      </head>
      <body class="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}

/* ─── Reusable logo using actual PNG ─── */
export function ParkGiveLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const h = size === 'sm' ? '28' : size === 'md' ? '36' : '44';
  return (
    <img src="/logo-name.png" alt="ParkGive" height={h} style={`height:${h}px; width:auto;`} />
  );
}
