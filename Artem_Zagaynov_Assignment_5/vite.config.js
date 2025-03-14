/**
 * @type {import('vite').UserConfig}
 */
export default {
  base: '/CSE160_Assignments/Artem_Zagaynov_Assignment_5/',
  build: {
    outDir: "public",
    sourcemap: true,
  },
  // (Optional) Force bundling of three to avoid bare module errors:
  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/libs/stats.module.js',
      'three/addons/controls/OrbitControls.js'
    ]
  }
}
