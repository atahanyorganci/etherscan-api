import { ofetch } from "ofetch";
import { expect, test, vi } from "vitest";
import { Client } from ".";
import { createCache } from "./cache";

vi.mock("ofetch", async importOriginal => {
	return {
		...(await importOriginal<typeof import("ofetch")>()),
		// this will only affect "foo" outside of the original module
		ofetch: vi.fn(() => ({ foo: "bar" })),
	};
});

test("fetchData", async () => {
	const cache = createCache();
	const client = new Client({
		cache,
	});
	expect(cache.storage.getKeys()).resolves.toHaveLength(0);
	expect(await client.fetch({ module: "test" })).toMatchInlineSnapshot(`
		{
		  "foo": "bar",
		}
	`);
	expect(ofetch).toBeCalledTimes(1);
	expect(cache.storage.getKeys()).resolves.toHaveLength(1);
	expect(await client.fetch({ module: "test" })).toMatchInlineSnapshot(`
		{
		  "foo": "bar",
		}
	`);
	expect(ofetch).toBeCalledTimes(1);
	expect(cache.storage.getKeys()).resolves.toHaveLength(1);
});
