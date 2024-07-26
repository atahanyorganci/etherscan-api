import { z } from "zod";
import { Address, Integer, Timestamp, Wei } from "./core";

export const BlockAndUncleRewards = z
	.object({
		blockNumber: Integer,
		timeStamp: Timestamp,
		blockMiner: Address,
		blockReward: Wei,
		uncles: z.array(
			z
				.object({
					miner: Address,
					unclePosition: Integer.min(0),
					blockreward: Wei,
				})
				.transform(({ blockreward, ...rest }) => ({ ...rest, blockReward: blockreward })),
		),
		uncleInclusionReward: Wei,
	})
	.transform(({ timeStamp: timestamp, ...rest }) => ({ timestamp, ...rest }));
export type BlockAndUncleRewards = z.infer<typeof BlockAndUncleRewards>;

export const EstimatedTimeToBlockNumber = z
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
export type EstimatedTimeToBlockNumber = z.infer<typeof EstimatedTimeToBlockNumber>;

export const ClosestOption = z.enum(["before", "after"]);
export type ClosestOption = z.infer<typeof ClosestOption>;
