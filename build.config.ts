import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	declaration: true,
	rollup: {
		emitCJS: true,
	},
	entries: ["src/index.ts", "src/cache/index.ts"],
});
