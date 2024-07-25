import { z } from "zod";
import { Address, EnumBoolean, HexString, HexValue, OptionalString } from "./core";

export const Component = z.object({
	type: z.string(),
	name: z.string(),
});
Component.extend({
	components: z.array(Component).optional(),
});
export type Component = z.infer<typeof Component> & {
	components?: Component[];
};

export const Function_ = z.object({
	type: z.enum(["function"]),
	name: z.string(),
	inputs: z
		.array(
			z.object({
				type: z.string(),
				name: z.string(),
				components: z.array(Component).optional(),
			}),
		)
		.optional(),
	outputs: z
		.array(
			z.object({
				type: z.string(),
				name: z.string().optional(),
				components: z.array(Component).optional(),
			}),
		)
		.optional(),
	stateMutability: z.enum(["pure", "view", "nonpayable", "payable"]).optional(),
});

export const Constructor = z.object({
	type: z.literal("constructor"),
	inputs: z.array(
		z.object({
			type: z.string(),
			name: z.string(),
			components: z.array(Component).optional(),
		}),
	),
	stateMutability: z.enum(["nonpayable", "payable"]).optional(),
});

export const Receive = z.object({
	type: z.literal("receive"),
	stateMutability: z.literal("payable"),
});

export const Fallback = z.object({
	type: z.literal("fallback"),
	stateMutability: z.enum(["nonpayable", "payable"]).optional(),
});

export const Event = z.object({
	type: z.enum(["event"]),
	name: z.string(),
	inputs: z.array(
		z.object({
			name: z.string(),
			type: z.string(),
			components: z.array(Component).optional(),
			indexed: z.boolean().optional(),
		}),
	),
	anonymous: z.boolean(),
});

export const Error_ = z.object({
	type: z.enum(["error"]),
	name: z.string(),
	inputs: z.array(
		z.object({
			name: z.string(),
			type: z.string(),
			components: z.array(Component).optional(),
		}),
	),
});

export const AbiItem = z.discriminatedUnion("type", [
	Function_,
	Constructor,
	Receive,
	Fallback,
	Event,
	Error_,
]);

export const AbiStr = z
	.string()
	.transform(str => JSON.parse(str))
	.pipe(z.array(AbiItem));

const MultiFileSourceCode = z
	.string()
	.transform((value, ctx) => {
		if (!value.startsWith("{") || !value.endsWith("}")) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Invalid JSON",
			});
			return z.NEVER;
		}
		try {
			const parsed = JSON.parse(value.substring(1, value.length - 1));
			return parsed;
		} catch (e) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Invalid JSON",
			});
			return z.NEVER;
		}
	})
	.pipe(
		z.object({
			language: z.string(),
			sources: z
				.record(z.object({ content: z.string() }))
				.transform(sources =>
					Object.entries(sources).map(([name, { content }]) => ({ name, content })),
				),
			settings: z.object({}).passthrough().optional(),
		}),
	);

export const ContractSourceCode = z
	.object({
		SourceCode: MultiFileSourceCode.or(z.string()),
		ABI: AbiStr,
		ContractName: z.string(),
		CompilerVersion: z.string(),
		OptimizationUsed: EnumBoolean,
		Runs: z.coerce.number(),
		ConstructorArguments: z.string(),
		EVMVersion: z.string(),
		Library: z.string(),
		LicenseType: z.string(),
		Proxy: EnumBoolean,
		Implementation: OptionalString,
		SwarmSource: OptionalString,
	})
	.transform(
		({
			SourceCode: sourceCode,
			ABI: abi,
			ContractName: name,
			CompilerVersion: compilerVersion,
			OptimizationUsed: isOptimized,
			Runs: optimizationRuns,
			ConstructorArguments: constructorArguments,
			EVMVersion: evmVersion,
			Library: library,
			LicenseType: license,
			Proxy: proxy,
			Implementation: implementation,
			SwarmSource: swarmSource,
		}) => ({
			name,
			license,
			evmVersion,
			compilerVersion,
			isOptimized,
			optimizationRuns,
			sourceCode,
			abi,
			constructorArguments,
			library,
			proxy,
			implementation,
			swarmSource,
		}),
	);
export type ContractSourceCode = z.infer<typeof ContractSourceCode>;

export const NotContract = z
	.object({
		ABI: z.string(),
	})
	.refine(value => value.ABI === "Contract source code not verified")
	.transform(() => undefined);

export const ContractSourceCodeResponse = NotContract.or(ContractSourceCode);

export const GetContractCreationInput = z.array(Address).min(1).max(5);
export type GetContractCreationInput = z.infer<typeof GetContractCreationInput>;

export const ContractCreation = z.object({
	contractAddress: Address,
	txHash: HexString,
	contractCreator: Address,
});
