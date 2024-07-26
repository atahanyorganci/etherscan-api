import { InvalidAddressError, getAddress, parseEther } from "viem";
import { z } from "zod";

/**
 * Address hex-strings `0x` prefix followed by 40 hexadecimal characters
 */
export const Address = z.string().transform((value, ctx) => {
	try {
		return getAddress(value);
	} catch (error) {
		if (error instanceof InvalidAddressError) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: error.message,
			});
		}
		return z.NEVER;
	}
});

/**
 * Ether value with 18 decimal places represented as a string
 *
 * @example `"1.0"` is parsed as  `1000000000000000000n` wei
 */
export const Ether = z.string().transform(ether => parseEther(ether));

/**
 * Optional string represented as an empty string `""` or a non-empty string
 */
export const OptionalString = z.string().transform(value => (value === "" ? undefined : value));

/**
 * Address represented as a string with a `0x` prefix followed by 40 hexadecimal characters or an empty string
 */
export const OptionalAddress = Address.or(OptionalString);

/**
 * Hexadecimal value represented as a string with a `0x` prefix followed by an even number of hexadecimal characters
 * if string is only `0x` then it is parsed as `undefined`
 */
export const HexValue = z
	.string()
	.refine(value => value.match(/^0x[0-9a-fA-F]*$/i))
	.transform(value => (value.length === 2 ? undefined : value));
export type HexValue = z.infer<typeof HexValue>;

/**
 * Hexadecimal string represented as a string with a `0x` prefix followed by an even number of hexadecimal characters
 */
export const HexString = z.string().refine(value => value.match(/^0x[0-9a-fA-F]*$/i));
export type HexString = z.infer<typeof HexString>;

/**
 * Unix timestamp represented as a number of seconds since the Unix epoch
 */
export const Timestamp = z.coerce.number();

/**
 * Integer string represented as a string of digits
 */
export const Integer = z.coerce.number().int();

/**
 * Big integer represented as a string of digits
 */
export const Wei = z.coerce.bigint();

/**
 * Boolean represented as a string `"0"` or `"1"`
 */
export const EnumBoolean = z.enum(["0", "1"]).transform(value => value === "1");

export const BlockTag = z.union([
	z.literal("earliest"),
	z.literal("finalized"),
	z.literal("safe"),
	z.literal("latest"),
]);

/**
 * Block tag represented as a string
 * - `"earliest"`: the earliest block the client has available
 * - `"finalized"`: the latest finalized block
 * - `"safe"`: the latest safe block that is secure from re-orgs
 * - `"latest"`: the latest block in the canonical chain
 */
export type BlockTag = z.infer<typeof BlockTag>;

export const BlockIdentifier = BlockTag.or(Integer.min(0));

/**
 * Block identifier represented as a {@link BlockTag `BlockTag`} or a block number.
 */
export type BlockIdentifier = z.infer<typeof BlockIdentifier>;

export function ensureBlockIdentifier(block?: BlockIdentifier): string {
	const identifier = BlockIdentifier.default("latest").parse(block);
	return typeof identifier === "number" ? `0x${identifier.toString(16)}` : identifier;
}

export const DateString = z.string().refine(data => data.match(/^\d{4}-\d{2}-\d{2}$/));
