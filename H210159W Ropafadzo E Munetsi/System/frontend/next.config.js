/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Disable font optimization to fix the font loading issue
    optimizeFonts: false,
  },
  // Ensure fonts are properly loaded
  webpack: (config, { isServer }) => {
    // Add a rule to handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    
    return config;
  },
};

module.exports = nextConfig;
