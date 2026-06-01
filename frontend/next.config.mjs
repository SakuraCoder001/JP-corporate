/** @type {import('next').NextConfig} */

// Hostnames only — do NOT add http:// or :port here (causes dev redirect loops).
const allowedHosts = (process.env.ALLOWED_DEV_ORIGINS || '103.179.45.76,localhost')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: allowedHosts,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
