import { expect, test } from "vitest";
import getTestClient from "./fixtures/client";

const client = getTestClient();

test("Get Block And Uncle Rewards by BlockNo", async () => {
	await expect(client.getBlockAndUncleRewardsByBlockNumber(2165403)).resolves.toMatchObject({
		blockNumber: expect.any(Number),
		timestamp: expect.any(Number),
		blockMiner: expect.any(String),
		blockReward: expect.any(BigInt),
		uncles: [
			{
				miner: expect.any(String),
				unclePosition: expect.any(Number),
				blockReward: expect.any(BigInt),
			},
			{
				miner: expect.any(String),
				unclePosition: expect.any(Number),
				blockReward: expect.any(BigInt),
			},
		],
		uncleInclusionReward: expect.any(BigInt),
	});
});

test("Get Estimated Block Countdown Time by BlockNo", async () => {
	const current = await client.getBlockNumber();
	await expect(client.getEstimatedTimeToBlockNumber(current + 1_000)).resolves.toBeDefined();
});

test("Get Block Number by Timestamp", async () => {
	await expect(client.getBlockNumberByTimestamp(1578638524, "before")).resolves.toBeDefined();
});
