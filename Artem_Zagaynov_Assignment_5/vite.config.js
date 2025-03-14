/**
 * @type {import('vite').UserConfig}
 */
export default {
  // If your GitHub Pages URL is:
  // https://USERNAME.github.io/REPO_NAME/
  // then base should be "/REPO_NAME/".
  // For example, if your URL is:
  // https://sharkboy289.github.io/CSE160_Assignments/Artem_Zagaynov_Assignment_5/
  // your base is "/CSE160_Assignments/Artem_Zagaynov_Assignment_5/"

  base: '/CSE160_Assignments/Artem_Zagaynov_Assignment_5/',

  build: {
    outDir: 'docs',   // Output built files to "docs" folder
    sourcemap: true,
  },

  // (Optional) Force bundling of certain modules like three.js
  // to avoid "bare module specifier" errors:
  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/libs/stats.module.js',
      'three/addons/controls/OrbitControls.js'
    ]
  }
}
