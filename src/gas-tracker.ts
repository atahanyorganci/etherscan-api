import { z } from "zod";
import { Integer } from "./core";

export const GasOracleResponse = z
	.object({
		LastBlock: Integer,
		SafeGasPrice: Integer,
		ProposeGasPrice: Integer,
		FastGasPrice: Integer,
		suggestBaseFee: z.coerce.number().nonnegative(),
		gasUsedRatio: z
			.string()
			.transform(x => x.split(","))
			.pipe(z.array(z.coerce.number())),
	})
	.transform(
		({
			LastBlock: lastBlock,
			SafeGasPrice: safeGasPrice,
			ProposeGasPrice: proposeGasPrice,
			FastGasPrice: fastGasPrice,
			suggestBaseFee: estimatedBaseFee,
			gasUsedRatio,
		}) => ({
			lastBlock,
			safeGasPrice,
			proposeGasPrice,
			fastGasPrice,
			estimatedBaseFee,
			gasUsedRatio,
		}),
	);
export type GasOracleResponse = z.infer<typeof GasOracleResponse>;
