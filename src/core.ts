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

export const BlockTagEnum = z.union([
	z.literal("earliest"),
	z.literal("finalized"),
	z.literal("safe"),
	z.literal("latest"),
]);
export type BlockTagEnum = z.infer<typeof BlockTagEnum>;

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
export const TimeStamp = z.coerce.number().transform(value => new Date(value * 1000));

/**
 * Integer string represented as a string of digits
 */
export const Integer = z.coerce.number().int();

/**
 * Big integer represented as a string of digits
 */
export const BigInt_ = z.coerce.bigint();
