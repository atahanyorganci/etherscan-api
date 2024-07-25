import { z } from "zod";
import { Integer, TimeStamp, Address, BigInt_ } from "./core";

export const BlockAndUncleRewards = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	blockMiner: Address,
	blockReward: BigInt_,
	uncles: z.array(
		z
			.object({
				miner: Address,
				unclePosition: Integer.min(0),
				blockreward: BigInt_,
			})
			.transform(({ blockreward, ...rest }) => ({ ...rest, blockReward: blockreward })),
	),
	uncleInclusionReward: BigInt_,
});
export type BlockAndUncleRewards = z.infer<typeof BlockAndUncleRewards>;

export const EstimatedTimeToBlockNo = z
	.object({
		CurrentBlock: Integer,
		CountdownBlock: Integer,
		RemainingBlock: Integer,
		EstimateTimeInSec: z.coerce.number().transform(time => Math.trunc(time * 1000)),
	})
	.transform(
		({
			CurrentBlock: currentBlock,
			CountdownBlock: countdownBlock,
			RemainingBlock: remainingBlock,
			EstimateTimeInSec: estimatedTime,
		}) => ({
			currentBlock,
			countdownBlock,
			remainingBlock,
			estimatedTime,
		}),
	);
export type EstimatedTimeToBlockNo = z.infer<typeof EstimatedTimeToBlockNo>;

export const ClosestOption = z.enum(["before", "after"]);
export type ClosestOption = z.infer<typeof ClosestOption>;
