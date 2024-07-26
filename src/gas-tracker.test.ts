import { expect, test } from "vitest";
import getTestClient from "./fixtures/client";

const client = getTestClient();

test("Get Estimation of Confirmation Time", async () => {
	await expect(client.getEstimatedConfirmationTime(2000000000n)).resolves.toBeDefined();
});

test("Get Gas Oracle", async () => {
	await expect(client.getGasOracle()).resolves.toBeDefined();
});
