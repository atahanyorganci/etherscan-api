import fs from "unstorage/drivers/fs-lite";
import { describe, expect, test } from "vitest";
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

describe("JSON-RPC API", () => {
	test("eth_blockNumber", async () => {
		await expect(client.getBlockNumber()).resolves.toBeGreaterThan(20382827);
	});

	test("eth_getBlockByNumber", async () => {
		// Shanghai 17034870
		await expect(client.getBlock(17034870)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(17034870)).resolves.toBeDefined();

		// Paris 15537394
		await expect(client.getBlock(17034870)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(17034870)).resolves.toBeDefined();

		// GrayGlacier 15050000
		await expect(client.getBlock(15050000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(15050000)).resolves.toBeDefined();

		// ArrowGlacier 13773000
		await expect(client.getBlock(13773000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(13773000)).resolves.toBeDefined();

		// London 12965000
		await expect(client.getBlock(12965000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(12965000)).resolves.toBeDefined();

		// Berlin 12244000
		await expect(client.getBlock(12244000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(12244000)).resolves.toBeDefined();

		// MuirGlacier 9200000
		await expect(client.getBlock(9200000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(9200000)).resolves.toBeDefined();

		// Istanbul 9069000
		await expect(client.getBlock(9069000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(9069000)).resolves.toBeDefined();

		// Constantinople 7280000
		await expect(client.getBlock(17034870)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(17034870)).resolves.toBeDefined();

		// Byzantium 4370000
		await expect(client.getBlock(4370000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(4370000)).resolves.toBeDefined();

		// SpuriousDragon 2675000
		await expect(client.getBlock(2675000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(2675000)).resolves.toBeDefined();

		// TangerineWhistle 2463000
		await expect(client.getBlock(2463000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(2463000)).resolves.toBeDefined();

		// Homestead 1150000
		await expect(client.getBlock(1150000)).resolves.toBeDefined();
		await expect(client.getBlockWithTransactions(1150000)).resolves.toBeDefined();
	});

	test("eth_getUncleByBlockNumberAndIndex", async () => {
		await expect(client.getUncleBlock(0xc63276, 0x0)).resolves.toBeDefined();
	});

	test("eth_getBlockTransactionCountByNumber", async () => {
		await expect(client.getTransactionCountByBlock(0x10fb78)).resolves.toBe(0x3);
		await expect(client.getTransactionCountByBlock("latest")).resolves.toBeGreaterThan(0);
	});

	test("eth_getTransactionByHash", async () => {
		await expect(
			client.getTransaction({
				hash: "0xbc78ab8a9e9a0bca7d0321a27b2c03addeae08ba81ea98b03cd3dd237eabed44",
			}),
		).resolves.toBeDefined();
	});

	test("eth_getTransactionByBlockNumberAndIndex", async () => {
		await expect(
			client.getTransaction({
				block: 0xc6331d,
				index: 0x11a,
			}),
		).resolves.toBeDefined();
	});

	test("eth_getTransactionCount", async () => {
		await expect(
			client.getTransactionCountByAddress("0x6B182919cAAaC95272c45bfC61ec418d0E301140"),
		).resolves.toBeDefined();
		await expect(
			client.getTransactionCountByAddress("0x6B182919cAAaC95272c45bfC61ec418d0E301140", "latest"),
		).resolves.toBeDefined();
		await expect(
			client.getTransactionCountByAddress("0x6B182919cAAaC95272c45bfC61ec418d0E301140", "pending"),
		).resolves.toBeDefined();
	});

	test("eth_getTransactionReceipt", async () => {
		await expect(
			client.getTransactionReceipt(
				"0xadb8aec59e80db99811ac4a0235efa3e45da32928bcff557998552250fa672eb",
			),
		).resolves.toBeDefined();

		// Homestead
		await expect(
			client.getTransactionReceipt(
				"0x44b739227cc061888d40e5e3dc50f9b86bd137557d65e3de66c9808e71f6ce62",
			),
		).resolves.toBeDefined();
	});

	test("eth_call", async () => {
		await expect(
			client.call({
				to: "0xAEEF46DB4855E25702F8237E8f403FddcaF931C0",
				data: "0x70a08231000000000000000000000000e16359506c028e51f16be38986ec5746251e9724",
			}),
		).resolves.toBeDefined();
		await expect(
			client.call({
				to: "0xAEEF46DB4855E25702F8237E8f403FddcaF931C0",
				data: "0x70a08231000000000000000000000000e16359506c028e51f16be38986ec5746251e9724",
				tag: "latest",
			}),
		).resolves.toBeDefined();
	});

	test("eth_getCode", async () => {
		await expect(
			client.getCode("0xf75e354c5edc8efed9b59ee9f67a80845ade7d0c"),
		).resolves.toBeDefined();

		await expect(
			client.getCode("0xf75e354c5edc8efed9b59ee9f67a80845ade7d0c", "latest"),
		).resolves.toBeDefined();
	});

	test("eth_estimateGas", async () => {
		await expect(
			client.estimateGas({
				data: "0x4e71d92d",
				to: "0xf0160428a8552ac9bb7e050d90eeade4ddd52843",
				value: 0xff22n,
				gasPrice: 0x51da038ccn,
				gas: 0x5f5e0ffn,
			}),
		).resolves.toBeDefined();
	});
});
