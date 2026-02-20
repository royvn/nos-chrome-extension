import vue from "rollup-plugin-vue";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import copy from "rollup-plugin-copy";

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: "src/main.js",
    output: {
      file: "dist/popup.js",
      format: "es",
    },
    plugins: [
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
        __DEV__: JSON.stringify(false),
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
      vue(),
      resolve(),
      copy({
        targets: [
          { src: "src/popup.html", dest: "dist" },
          { src: "src/manifest.json", dest: "dist" },
        ],
      }),
    ],
  },
  {
    input: "src/background.js",
    output: {
      file: "dist/background.js",
      format: "es",
    },
    plugins: [resolve()],
  },
];
