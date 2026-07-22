import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  transpilePackages: ["framer-motion"],
  compress: true,
  // Pre-existing OUK-era lint errors must not block production/CI builds.
  // Keep `npm run lint` as a separate quality gate while the backlog is cleared.
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
      // SHAPE document repository is a Next.js page at /documents.
      // Backend file assets remain under /uploads and /api.
    ];
  },
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/the-project",
        permanent: false,
      },
      {
        source: "/about/:path*",
        destination: "/the-project",
        permanent: false,
      },
      {
        source: "/sw/about",
        destination: "/sw/the-project",
        permanent: false,
      },
      {
        source: "/sw/about/:path*",
        destination: "/sw/the-project",
        permanent: false,
      },
      {
        source: "/about-us",
        destination: "/the-project",
        permanent: false,
      },
      {
        source: "/about-us/:path*",
        destination: "/the-project",
        permanent: false,
      },
      {
        source: "/sw/about-us",
        destination: "/sw/the-project",
        permanent: false,
      },
      {
        source: "/sw/about-us/:path*",
        destination: "/sw/the-project",
        permanent: false,
      },
      {
        source: "/contacts",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/sw/contacts",
        destination: "/sw/contact",
        permanent: true,
      },
      {
        source: "/outputs",
        destination: "/documents",
        permanent: true,
      },
      {
        source: "/sw/outputs",
        destination: "/sw/documents",
        permanent: true,
      },
      {
        source: "/auth/reset-password",
        destination: "/admin/reset-password",
        permanent: false,
      },
      {
        source: "/library/e-repository",
        destination: "/library/e-resources",
        permanent: true,
      },
      {
        source: "/library/resources",
        destination: "/library/e-resources",
        permanent: true,
      },
      {
        source: "/short-courses/:path*",
        destination: "/academics/professional-development-courses/:path*",
        permanent: true,
      },
      {
        source: "/academic/programmes/:path*",
        destination: "/programmes/:path*",
        permanent: true,
      },
      {
        source: "/academics/programmes/:path*",
        destination: "/programmes/:path*",
        permanent: true,
      },
      {
        source: "/programs",
        destination: "/programmes",
        permanent: true,
      },
      {
        source: "/programs/:path*",
        destination: "/programmes/:path*",
        permanent: true,
      },
      {
        source: "/sw/programs",
        destination: "/sw/programmes",
        permanent: true,
      },
      {
        source: "/sw/programs/:path*",
        destination: "/sw/programmes/:path*",
        permanent: true,
      },
      {
        source: "/jobs",
        destination: "/careers",
        permanent: true,
      },
      {
        source: "/jobs/:path*",
        destination: "/careers/:path*",
        permanent: true,
      },
      {
        source: "/sw/jobs",
        destination: "/sw/careers",
        permanent: true,
      },
      {
        source: "/sw/jobs/:path*",
        destination: "/sw/careers/:path*",
        permanent: true,
      },
      {
        source: "/faculty",
        destination: "/about/staff",
        permanent: true,
      },
      {
        source: "/sw/faculty",
        destination: "/sw/about/staff",
        permanent: true,
      },
      {
        source: "/programmes/science-tech",
        destination: "/academics/schools/school-of-science-technology",
        permanent: true,
      },
      {
        source: "/sw/programmes/science-tech",
        destination: "/sw/academics/schools/school-of-science-technology",
        permanent: true,
      },
      {
        source: "/programmes/business-econ",
        destination: "/academics/schools/school-of-business-economics",
        permanent: true,
      },
      {
        source: "/sw/programmes/business-econ",
        destination: "/sw/academics/schools/school-of-business-economics",
        permanent: true,
      },
      {
        source: "/somas",
        destination: "https://somas.ouk.ac.ke",
        permanent: false,
      },
      {
        source: "/sw/somas",
        destination: "https://somas.ouk.ac.ke",
        permanent: false,
      },
      {
        source: "/about/schools/:path*",
        destination: "/academics/schools/:path*",
        permanent: true,
      },
      {
        source: "/schools/:path*",
        destination: "/academics/schools/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days for optimized images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "ouk.ac.ke",
      },
      {
        protocol: "https",
        hostname: "www.ouk.ac.ke",
      },
      {
        protocol: "https",
        hostname: "**.ouk.ac.ke",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
