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

test("Get Total Supply of Ether", async () => {
	await expect(client.getEtherSupply()).resolves.toBeGreaterThan(1n);
});

test("Get Total Supply of Ether 2", async () => {
	await expect(client.getEther2Supply()).resolves.toMatchObject({
		etherSupply: expect.any(BigInt),
		stakingRewards: expect.any(BigInt),
		burntFees: expect.any(BigInt),
		withdrawnTotal: expect.any(BigInt),
	});
});

test("Get Ether Last Price", async () => {
	await expect(client.getLastEtherPrice()).resolves.toMatchObject({
		eth2btc: expect.any(BigInt),
		eth2btcTimestamp: expect.any(Number),
		eth2usd: expect.any(BigInt),
		eth2usdTimestamp: expect.any(Number),
	});
});

test("Get Ethereum Nodes Size", async () => {
	await expect(
		client.getEthereumNodeSize({
			startDate: "2019-02-01",
			endDate: "2019-02-28",
			clientType: "geth",
			syncMode: "default",
			sort: "asc",
		}),
	).resolves.toMatchObject(expect.any(Array));
});

test("Get Total Nodes Count", async () => {
	await expect(client.getNodeCount()).resolves.toMatchObject({
		timestamp: expect.any(Number),
		count: expect.any(Number),
	});
});
