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

test("Get ERC20-Token TotalSupply by ContractAddress", async () => {
	await expect(
		client.getErc20TokenSupply("0x57d90b64a1a57749b0f932f1a3395792e12e7055"),
	).resolves.toBeDefined();
});

test("Get ERC20-Token Account Balance for TokenContractAddress", async () => {
	await expect(
		client.getErc20TokenBalance({
			address: "0x57d90b64a1a57749b0f932f1a3395792e12e7055",
			contractAddress: "0x57d90b64a1a57749b0f932f1a3395792e12e7055",
		}),
	).resolves.toBeDefined();
});
