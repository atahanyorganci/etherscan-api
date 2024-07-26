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

const OLD_ADDRESS = "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae";
const NEW_ADDRESS = "0x6B182919cAAaC95272c45bfC61ec418d0E301140";

test("Get Ether Balance for a Single Address", async () => {
	await expect(client.getBalance(NEW_ADDRESS)).resolves.toBeGreaterThan(0n);
	await expect(client.getBalance(NEW_ADDRESS, "pending")).resolves.toBeGreaterThan(0n);
	await expect(client.getBalance(NEW_ADDRESS, "latest")).resolves.toBeGreaterThan(0n);

	await expect(client.getBalance(OLD_ADDRESS)).resolves.toBeGreaterThan(0n);
	await expect(client.getBalance(OLD_ADDRESS, "pending")).resolves.toBeGreaterThan(0n);
	await expect(client.getBalance(OLD_ADDRESS, "latest")).resolves.toBeGreaterThan(0n);
});

test("Get Ether Balance for Multiple Addresses in a Single Call", async () => {
	await expect(client.getBalances([OLD_ADDRESS, NEW_ADDRESS])).resolves.toHaveLength(2);
	await expect(client.getBalances([OLD_ADDRESS, NEW_ADDRESS]), "pending").resolves.toHaveLength(2);
	await expect(client.getBalances([OLD_ADDRESS, NEW_ADDRESS]), "latest").resolves.toHaveLength(2);
});

test("Get a list of 'Normal' Transactions By Address", async () => {
	await expect(client.getTransactions(OLD_ADDRESS)).resolves.toBeDefined();
	await expect(client.getTransactions(NEW_ADDRESS)).resolves.toBeDefined();
});

test("Get a list of 'Internal' Transactions by Address", async () => {
	await expect(
		client.getInternalTransactions("0x2c1ba59d6f58433fb1eaee7d20b26ed83bda51a3"),
	).resolves.toBeDefined();
});

test("Get 'Internal Transactions' by Transaction Hash", async () => {
	await expect(
		client.getInternalTransactionsInTransaction(
			"0x40eb908387324f2b575b4879cd9d7188f69c8fc9d87c901b9e2daaea4b442170",
		),
	).resolves.toBeDefined();
});

test("Get a list of 'ERC20 - Token Transfer Events' by Address", async () => {
	await expect(
		client.getErc20Transfers({
			address: "0x4e83362442b8d1bec281594cea3050c8eb01311c",
			contractAddress: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
		}),
	).resolves.toBeDefined();
});

test("Get a list of 'ERC721 - Token Transfer Events' by Address", async () => {
	await expect(
		client.getErc721Transfers({
			address: "0x6975be450864c02b4613023c2152ee0743572325",
			contractAddress: "0x06012c8cf97bead5deae237070f9587f8e7a266d",
		}),
	).resolves.toBeDefined();
});

test("Get a list of 'ERC1155 - Token Transfer Events' by Address", async () => {
	await expect(
		client.getErc1155Transfers({
			address: "0x83f564d180b58ad9a02a449105568189ee7de8cb",
			contractAddress: "0x76be3b62873462d2142405439777e971754e8e77",
		}),
	).resolves.toBeDefined();
});

test("Get list of Blocks Validated by Address", async () => {
	await expect(
		client.getBlocksValidatedByAddress("0x9dd134d14d1e65f84b706d6f205cd5b1cd03a46b"),
	).resolves.toBeDefined();
	await expect(
		client.getBlocksValidatedByAddress("0x9dd134d14d1e65f84b706d6f205cd5b1cd03a46b", {
			blockType: "uncles",
		}),
	).resolves.toBeDefined();
});

test("Get Beacon Chain Withdrawals by Address and Block Range", async () => {
	await expect(
		client.getBeaconChainWithdrawals("0xB9D7934878B5FB9610B3fE8A5e441e8fad7E293f"),
	).resolves.toBeDefined();
});
