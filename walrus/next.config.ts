import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mysten/walrus", "@mysten/walrus-wasm"],
  turbopack: {
    resolveExtensions: [".wasm", ".js", ".ts", ".tsx", ".json"],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;