/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: every route in this app prerenders, so no server is needed.
  output: "export",

  // Required by `output: 'export'` -- the optimizer needs a server. The blog
  // images are now local files under public/blog/, so there is nothing to
  // optimize remotely anyway.
  images: { unoptimized: true },

  // WARNING: this headers() block is NOT applied in production.
  //
  // `output: 'export'` drops it -- `next build` prints "rewrites, redirects,
  // and headers are not applied when exporting your application" on every
  // build. Leave that warning visible; it is the reminder that this file is
  // not the production source of truth.
  //
  // Production headers are served by Azure Static Web Apps from
  // ../next/staticwebapp.config.json (globalHeaders). This block exists only
  // so `next dev` behaves like production. KEEP THE TWO IN SYNC -- the only
  // intended difference is that this one also allows http://localhost:* so
  // the dev server can talk to a local backend.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://api.unfollowr.app http://localhost:*;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
