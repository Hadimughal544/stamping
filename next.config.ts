import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Load these from node_modules at runtime instead of bundling them. Bundling `ws` breaks its
  // optional native add-on ("bufferUtil.mask is not a function"), which kills the Neon connection.
  serverExternalPackages: ["ws", "@neondatabase/serverless"],
};

export default nextConfig;
