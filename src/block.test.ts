import fs from "unstorage/drivers/fs-lite";
import { expect, test } from "vitest";
import { Client } from ".";
import { createCache } from "./cache";

const client = new Client({
	apiKey: process.env.VITE_ETHERSCAN_API_KEY,
	cache: createCache({
		driver: fs({
			base: "cache",
		}),
	}),
});

test("Get Block And Uncle Rewards by BlockNo", async () => {
	await expect(client.getBlockAndUncleRewardsByBlockNumber(2165403)).resolves.toStrictEqual({
		blockNumber: 2165403,
		timeStamp: 1472533979,
		blockMiner: "0x13A06D3dFe21e0DB5C016C03Ea7D2509f7f8D1e3",
		blockReward: 5314181600000000000n,
		uncles: [
			{
				miner: "0xbCDFC35b86BedF72F0Cda046A3c16829A2Ef41d1",
				unclePosition: 0,
				blockReward: 3750000000000000000n,
			},
			{
				miner: "0x0d0C9855c722ff0c78F21E43aA275a5B8eA60DcE",
				unclePosition: 1,
				blockReward: 3750000000000000000n,
			},
		],
		uncleInclusionReward: 312500000000000000n,
	});
});

test("Get Estimated Block Countdown Time by BlockNo", async () => {
	const current = await client.getBlockNumber();
	await expect(client.getEstimatedTimeToBlockNumber(current + 1_000)).resolves.toBeDefined();
});

test("Get Block Number by Timestamp", async () => {
	await expect(client.getBlockNoByTimestamp(1578638524, "before")).resolves.toBeDefined();
});
