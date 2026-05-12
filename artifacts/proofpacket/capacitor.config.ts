import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Reverse-DNS style bundle ID — change to match your Apple/Google accounts
  appId: "com.proofpacket.app",
  appName: "ProofPacket",
  webDir: "dist/public",
  server: {
    // Keep androidScheme as https so cookies, IndexedDB, and camera work correctly
    androidScheme: "https",
  },
  ios: {
    // Allow camera and photo library access (used for photo evidence)
    backgroundColor: "#ffffff",
  },
  android: {
    backgroundColor: "#ffffff",
  },
};

export default config;
