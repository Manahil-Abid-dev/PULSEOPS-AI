/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["firebase-admin", "google-auth-library", "jose", "jwks-rsa"],
};

module.exports = nextConfig;