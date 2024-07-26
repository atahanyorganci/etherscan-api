import { z } from "zod";
import { Address, HexString, HexValue, Integer, Timestamp, Wei } from "./core";

export const Operator = z.enum(["and", "or"]);
export type Operator = z.infer<typeof Operator>;

export const GetLogsParams = z
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
export type GetLogsParams = z.infer<typeof GetLogsParams>;

export const Log = z
	.object({
		address: Address,
		topics: z.array(HexString),
		data: HexValue,
		blockNumber: Integer,
		timeStamp: Timestamp,
		gasPrice: Wei,
		gasUsed: Wei,
		logIndex: HexValue,
		transactionHash: HexValue,
		transactionIndex: HexValue,
	})
	.transform(({ timeStamp, ...rest }) => ({ timestamp: timeStamp, ...rest }));
export type Log = z.infer<typeof Log>;
