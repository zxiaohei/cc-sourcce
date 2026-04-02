import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const outdir = "dist";

// 启用的 feature flag 列表 — 只有这里列出的会被替换为 true，其余为 false
const ENABLED_FEATURES = new Set(["BUDDY"]);

// Step 1: Clean output directory
const { rmSync } = await import("fs");
rmSync(outdir, { recursive: true, force: true });

// Step 2: Bundle with splitting
// bun:bundle 源码预处理插件 —— 在 Bun 内置 bun:bundle 处理之前，
// 将 feature("X") 调用替换为 true/false 字面量，确保 DCE 保留/删除正确的分支。
const featureFlagPlugin: import("bun").BunPlugin = {
    name: "feature-flag-preprocessor",
    setup(build) {
        // 匹配所有 .ts/.tsx/.js/.jsx 源文件
        build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
            // 跳过 node_modules
            if (args.path.includes("node_modules")) return;

            const source = await Bun.file(args.path).text();
            // 没有 feature( 调用的文件直接跳过
            if (!source.includes("feature(")) return;

            // 替换 feature("X") / feature('X') 为 true 或 false
            const transformed = source.replace(
                /\bfeature\(\s*(['"])(\w+)\1\s*\)/g,
                (_match, _q, name) => ENABLED_FEATURES.has(name) ? "true" : "false",
            );

            if (transformed === source) return;

            const loader = args.path.endsWith(".tsx") ? "tsx"
                : args.path.endsWith(".ts") ? "ts"
                : args.path.endsWith(".jsx") ? "jsx"
                : "js";
            return { contents: transformed, loader };
        });
    },
};

const result = await Bun.build({
    entrypoints: ["src/entrypoints/cli.tsx"],
    outdir,
    target: "bun",
    splitting: true,
    plugins: [featureFlagPlugin],
});

if (!result.success) {
    console.error("Build failed:");
    for (const log of result.logs) {
        console.error(log);
    }
    process.exit(1);
}

// Step 3: Post-process — replace Bun-only `import.meta.require` with Node.js compatible version
const files = await readdir(outdir);
const IMPORT_META_REQUIRE = "var __require = import.meta.require;";
const COMPAT_REQUIRE = `var __require = typeof import.meta.require === "function" ? import.meta.require : (await import("module")).createRequire(import.meta.url);`;

let patched = 0;
for (const file of files) {
    if (!file.endsWith(".js")) continue;
    const filePath = join(outdir, file);
    const content = await readFile(filePath, "utf-8");
    if (content.includes(IMPORT_META_REQUIRE)) {
        await writeFile(
            filePath,
            content.replace(IMPORT_META_REQUIRE, COMPAT_REQUIRE),
        );
        patched++;
    }
}

console.log(
    `Bundled ${result.outputs.length} files to ${outdir}/ (patched ${patched} for Node.js compat)`,
);
