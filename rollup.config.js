// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import node_builtin from 'rollup-plugin-node-builtins';
import alias from '@rollup/plugin-alias';

export default [
  {
    input: "src/index.ts",
    treeshake: true,
    output: {
      dir: "out",
      format: "amd"
    },
    external: ["VSS/Controls", "TFS/Build/RestClient"],
    plugins: [typescript(), resolve(), commonjs(), node_builtin(), alias({
      entries: [
        {
          find: 'minimatch', replacement: './../node_modules/minimatch-browser/minimatch'
        }
      ]
    })]
  },
  {
    input: "src/reportBuilder.ts",
    treeshake: true,
    output: {
      dir: "out",
      format: 'iife'
    },
    plugins: [typescript(), resolve(), commonjs(), node_builtin(), alias({
      entries: [
        {
          find: 'minimatch', replacement: './../node_modules/minimatch-browser/minimatch'
        }
      ]
    })]
  },
  {
    input: "localtest/index.ts",
    treeshake: true,
    output: {
      dir: "localtest",
      format: 'iife'
    },
    plugins: [typescript(), resolve(), commonjs(), node_builtin(), alias({
      entries: [
        {
          find: 'minimatch', replacement: './../node_modules/minimatch-browser/minimatch'
        }
      ]
    })]
  },
  {
    input: "src/reportBuilder.ts",
    treeshake: true,
    output: {
      dir: "localtest/out",
      format: 'iife'
    },
    plugins: [typescript(), resolve(), commonjs(), node_builtin(), alias({
      entries: [
        {
          find: 'minimatch', replacement: './../node_modules/minimatch-browser/minimatch'
        }
      ]
    })]
  },
];
