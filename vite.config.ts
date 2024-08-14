import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

const resolve = (url: string) => path.resolve(__dirname, url);
export default defineConfig({
  plugins: [
    dts({
      include: resolve("./lib"),
      outDir: resolve("./typings"),
    }),
  ],
  build: {
    lib: {
      entry: "./lib/index.ts",
      name: "FlyLayer",
      fileName: "index",
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external(id: string) {
        return Object.keys(pkg.dependencies).some((k) =>
          new RegExp(`^${k}`).test(id)
        );
      },
      output: {
        exports: "named",
        // banner,
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          leaflet: "L",
          lodash: "_",
        },
      },
    },
  },
});
