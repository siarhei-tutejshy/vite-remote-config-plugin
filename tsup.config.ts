import { defineConfig } from 'tsup'
import {buildSync, Plugin} from "esbuild";
import path from "path";

const filter = /\?raw/
const namespace = '_' + Math.random().toString(36).substring(2, 9)

const raw: Plugin = {
    name: 'inline-plugin',
    setup(build) {
        build.onResolve({ filter }, args => {
            const realPath = args.path.replace(filter, '');
            return {
                path: path.resolve(args.resolveDir, realPath),
                namespace,
            };
        });

        build.onLoad({ filter: /.*/, namespace }, async args => {
            const [result] = buildSync({
                write: false,
                entryPoints: [args.path],
                bundle: true,
                splitting: false,
            }).outputFiles;

            return {
                contents: result.text,
                loader: 'text'
            };
        });
    }
};
export default defineConfig({
    esbuildPlugins: [raw],
    entry: ['src/index.ts'],
    dts: true,
    format: ['cjs', 'esm'],
})
