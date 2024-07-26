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

test("Get Contract ABI for Verified Contract Source Codes", async () => {
	await expect(client.getAbi("0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413")).resolves.toBeDefined();
	await expect(client.getAbi("0x92BeEb23B09Bb1309545B56072f4A8AcEe6C280B")).resolves.toBeDefined();
	await expect(client.getAbi("0xA59d94ec9F1ecf6C705FB8cE9765fF7801cd52C4")).resolves.toBeDefined();
	await expect(client.getAbi("0xad5e98Ed273AA66fE13054B7D9F785a07D15C59D")).resolves.toBeDefined();
	await expect(client.getAbi("0x693dF41DD51dEFA0080E19653F23D4a835b5330B")).resolves.toBeDefined();
	await expect(client.getAbi("0xDA733433033C4231Ca4b4626ea0145AF7141a04F")).resolves.toBeDefined();
	await expect(client.getAbi("0xA0F162bD8c9d02Bd507690Bfab17fb1D5017D6Ed")).resolves.toBeDefined();
	await expect(client.getAbi("0x2084D23AaDD5C6393b816Af9e1990748dad28161")).resolves.toBeDefined();
	await expect(client.getAbi("0x9221A6E16e3576d2EFd3Aa4Bd635C15A752c19f7")).resolves.toBeDefined();
	await expect(client.getAbi("0xb2329f36b75Cd63f73d26888580A8af0D1dCbDF4")).resolves.toBeDefined();
	await expect(client.getAbi("0x5f1BF628Ae19dfeCb0FB9a2Ac0Ed5a33B8279090")).resolves.toBeDefined();
	await expect(client.getAbi("0x6D794AE701F9e4A290a843f66005233a98f2154B")).resolves.toBeDefined();
});

test("Get Contract Source Code for Verified Contract Source Codes", async () => {
	await expect(
		client.getSourceCode("0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0x92BeEb23B09Bb1309545B56072f4A8AcEe6C280B"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0xA59d94ec9F1ecf6C705FB8cE9765fF7801cd52C4"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0xad5e98Ed273AA66fE13054B7D9F785a07D15C59D"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0x693dF41DD51dEFA0080E19653F23D4a835b5330B"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0xDA733433033C4231Ca4b4626ea0145AF7141a04F"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0xA0F162bD8c9d02Bd507690Bfab17fb1D5017D6Ed"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0x2084D23AaDD5C6393b816Af9e1990748dad28161"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0x9221A6E16e3576d2EFd3Aa4Bd635C15A752c19f7"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0xb2329f36b75Cd63f73d26888580A8af0D1dCbDF4"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0x5f1BF628Ae19dfeCb0FB9a2Ac0Ed5a33B8279090"),
	).resolves.toBeDefined();
	await expect(
		client.getSourceCode("0x6D794AE701F9e4A290a843f66005233a98f2154B"),
	).resolves.toBeDefined();
});

test("Get Contract Creator and Creation Tx Hash", async () => {
	const CONTRACTS = [
		"0xB83c27805aAcA5C7082eB45C868d955Cf04C337F",
		"0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
		"0xe4462eb568E2DFbb5b0cA2D3DbB1A35C9Aa98aad",
		"0xdAC17F958D2ee523a2206206994597C13D831ec7",
		"0xf5b969064b91869fBF676ecAbcCd1c5563F591d0",
	];
	await expect(client.getContractCreation(CONTRACTS.toSpliced(1))).resolves.toHaveLength(1);
	await expect(client.getContractCreation(CONTRACTS.toSpliced(3))).resolves.toHaveLength(3);
	await expect(client.getContractCreation(CONTRACTS)).resolves.toHaveLength(5);
});
