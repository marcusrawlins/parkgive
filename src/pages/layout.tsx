/** @jsxImportSource hono/jsx */

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
        <script src="https://cdn.tailwindcss.com" />
        <meta name="description" content="Pay to park. Proceeds support local youth programs." />
      </head>
      <body class="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
