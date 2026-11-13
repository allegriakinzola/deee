import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "nodemailer", "pdf-lib", "ws"],
};

export default nextConfig;
