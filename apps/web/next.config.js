/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    const agentUrl = process.env.INTERNAL_AGENT_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${agentUrl}/api/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
