import { z } from "zod";
import { EnumBoolean, OptionalString } from "./core";

export const ContractExecutionStatus = z
	.object({
		isError: EnumBoolean,
		errDescription: OptionalString,
	})
	.transform(({ isError, errDescription }) => {
		if (isError) {
			return { error: true as const, description: errDescription };
		}
		return { error: false as const };
	});
export type ContractExecutionStatus = z.infer<typeof ContractExecutionStatus>;

export const TransactionReceiptStatus = z
	.object({
		status: EnumBoolean,
	})
	.transform(({ status }) => status);
export type TransactionReceiptStatus = z.infer<typeof TransactionReceiptStatus>;
