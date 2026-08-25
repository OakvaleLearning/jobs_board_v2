import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp is auto-externalized, so @vercel/nft traces its native binding
  // (sharp-<platform>.node) by following the `require`. But the binding loads
  // libvips (libvips-cpp.so.*) via dlopen/RPATH at the C level, which the
  // tracer can't see — so on Vercel the .so is missing from the function
  // bundle and sharp throws ERR_DLOPEN_FAILED at runtime. Force-include the
  // @img platform packages (libvips .so + glib deps) into every server trace.
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/@img/**/*"],
  },
};

export default nextConfig;
