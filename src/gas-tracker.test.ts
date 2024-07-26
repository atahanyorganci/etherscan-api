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

test("Get Estimation of Confirmation Time", async () => {
	await expect(client.getEstimatedConfirmationTime(2000000000n)).resolves.toBeDefined();
});

test("Get Gas Oracle", async () => {
	await expect(client.getGasOracle()).resolves.toBeDefined();
});
