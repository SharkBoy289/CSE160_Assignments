/**
* @type {import('vite').UserConfig}
*/
export default {
  base: "./", // Fixes incorrect paths for assets
  build: {
    outDir: "dist",
    sourcemap: true
  }
}