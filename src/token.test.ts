import { expect, test } from "vitest";
import getTestClient from "./fixtures/client";

const client = getTestClient();

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
