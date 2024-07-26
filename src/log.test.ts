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

test("Get Event Logs by Address", async () => {
	await expect(
		client.getLogs(
			{
				address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
			},
			{
				fromBlock: 20382707,
				toBlock: 20382707,
			},
		),
	).resolves.toBeDefined();
	await expect(
		client.getLogs(
			{
				address: "0xd07e86f68c7b9f9b215a3ca3e79e74bf94d6a847",
				topic0: "0x1ca44014a5a36217a467507491f4bb0117097c066ab4108946fb579e63db90d9",
			},
			{
				fromBlock: 20382484,
				toBlock: 20382484,
			},
		),
	).resolves.toBeDefined();
	await expect(
		client.getLogs(
			{
				address: "0xd07e86f68c7b9f9b215a3ca3e79e74bf94d6a847",
				topic0: "0x1ca44014a5a36217a467507491f4bb0117097c066ab4108946fb579e63db90d9",
				topic1: "0x0000000000000000000000005ab8599f79b0090befe1ab0ce3b9c78e374965af",
				topic0_1_opr: "and",
			},
			{
				fromBlock: 20382484,
				toBlock: 20382484,
			},
		),
	).resolves.toBeDefined();
});
