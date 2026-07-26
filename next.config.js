/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fixes Firebase Admin and jose/jwks-rsa module loading errors on Vercel serverless
  serverExternalPackages: ["firebase-admin"],
};

module.exports = nextConfig;