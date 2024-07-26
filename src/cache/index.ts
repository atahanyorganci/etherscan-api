import { objectHash, sha256base64 } from "ohash";
import { type Driver, type Storage, createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import type { Cache } from "..";

/**
 * Options for {@link createCache `createCache`}
 */
export interface CreateCacheOptions {
	// Function to use when serializing request URL and headers.
	serialize: Cache["serialize"];
	/**
	 * {@link Driver | `Driver`} implementation from {@link https://unstorage.unjs.io/drivers | `unstorage`} used to
	 * create {@link Storage `Storage`} instance.
	 */
	driver: Driver;
}

/**
 * Create SHA-256 hash from any JS object
 *
 * @see {@link https://github.com/unjs/ohash | `ohash`} package for implementation and {@link objectHash | `objectHash`}
 *
 * @param object - object to serialize
 * @returns base64 encoded SHA-256 hash of {@link objectHash | `objectHash`}
 */
export const serialize: Cache["serialize"] = (object: unknown) => sha256base64(objectHash(object));

/**
 * Create a {@link Cache | `Cache`} instance by default {@link serialize | `serialize`} is used for generating keys for storage and
 * {@link memoryDriver | `memoryDriver`} from {@link https://github.com/unjs/unstorage | `unstorage`} is used for persistance. Serialization and
 * persistance method can be customized.
 *
 * @param options - {@link CreateCacheOptions `CreateCacheOptions`}
 * @returns concrete {@link Cache `Cache`}
 */
export function createCache({ driver, ...opts }: Partial<CreateCacheOptions> = {}): Cache {
	return {
		serialize,
		storage: createStorage({
			driver: driver ?? memoryDriver(),
		}),
		...opts,
	};
}
