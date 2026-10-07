import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The parent folder has its own lockfile, so Next would otherwise infer it as
  // the workspace root and try to compile files outside this repo.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
