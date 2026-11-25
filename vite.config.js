import Sitemap from "vite-plugin-sitemap";

const githubRepository = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const githubPagesHostname = githubRepository.length === 2
  ? `https://${githubRepository[0].toLowerCase()}.github.io/${githubRepository[1]}/`
  : null;

export default {
  base: process.env.GITHUB_PAGES === "true" ? "./" : "/",
  plugins: process.env.GITHUB_PAGES === "true"
    ? []
    : [
        Sitemap({
          hostname: "https://wha-spell-maker.daviamsilva.dev/",
          changefreq: "weekly",
        }),
      ],
  build: {
    target: "es2022",
    minify: "terser",
    terserOptions: {
      ecma: 2022,
      module: true,
      compress: {
        passes: 2,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          p5: ["p5"],
        },
      },
    },
  },
};
