import fsLite from "unstorage/drivers/fs-lite";
import { Client } from "..";
import { createCache } from "../cache";

export default function getTestClient() {
	return new Client({
		apiKey: process.env.VITE_ETHERSCAN_API_KEY,
		cache: createCache({
			serialize({ module, action, ...params }) {
				const paramsSerialized = Object.entries(params)
					.filter(([_, value]) => value !== undefined && value !== null)
					.toSorted(([a], [b]) => a.localeCompare(b))
					.map(([key, value]) => `${key}:${value}`);
				const keys = [`module:${module}`];
				if (action) {
					keys.push(`action:${action}`);
				}
				const key = [...keys, ...paramsSerialized].join(":");
				return `${key}.json`;
			},
			driver: fsLite({
				base: "test/cache",
			}),
		}),
	});
}
