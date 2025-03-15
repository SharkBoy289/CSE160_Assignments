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


  build: {
    base:'/Artem_Zagaynov_Assignment_5/',
    sourcemap: true,
    outDir: 'docs/Artem_Zagaynov_Assignment_5',
    rollupOptions: {
      external:[]
    },
  },
}
