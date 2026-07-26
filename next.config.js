/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["firebase-admin", "jwks-rsa"],
};

module.exports = nextConfig;