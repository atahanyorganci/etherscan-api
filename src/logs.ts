import { z } from "zod";
import { Address, HexString, HexValue, Integer, TimeStamp, Wei } from "./core";

export const Operator = z.enum(["and", "or"]);
export type Operator = z.infer<typeof Operator>;

export const GetLogsInput = z
	.object({
		address: z.string().optional(),
		topic0: HexString,
		topic1: HexString,
		topic0_1_opr: Operator,
	})
	.or(
		z.object({
			topic0: HexString,
			address: z.string().optional(),
		}),
	)
	.or(
		z.object({
			address: z.string(),
		}),
	);
export type GetLogsInput = z.infer<typeof GetLogsInput>;

export const Log = z.object({
	address: Address,
	topics: z.array(HexString),
	data: HexValue,
	blockNumber: Integer,
	timeStamp: TimeStamp,
	gasPrice: Wei,
	gasUsed: Wei,
	logIndex: HexValue,
	transactionHash: HexValue,
	transactionIndex: HexValue,
});
export type Log = z.infer<typeof Log>;
