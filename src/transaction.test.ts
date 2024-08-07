import { expect, test } from "vitest";
import getTestClient from "./fixtures/client";

const client = getTestClient();

test("Check Contract Execution Status", async () => {
	await expect(
		client.getTransactionStatus(
			"0x15f8e5ea1079d9a0bb04a4c58ae5fe7654b5b2b4463375ff7ffb490aa0032f3a",
		),
	).resolves.toStrictEqual({
		error: true,
		description: "Bad jump destination",
	});
	await expect(
		client.getTransactionStatus(
			"0xa6a9f3b0eb3351140d99ce8ebaa2509fd69a958c73ec3ba916bae3e938a27908",
		),
	).resolves.toStrictEqual({
		error: false,
	});
});

test("Check Transaction Receipt Status", async () => {
	await expect(
		client.getTransactionReceiptStatus(
			"0x513c1ba0bebf66436b5fed86ab668452b7805593c05073eb2d51d3a52f480a76",
		),
	).resolves.toBe(true);
	await expect(
		client.getTransactionReceiptStatus(
			"0xa6a9f3b0eb3351140d99ce8ebaa2509fd69a958c73ec3ba916bae3e938a27908",
		),
	).resolves.toBe(true);
});
