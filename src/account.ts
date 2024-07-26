import { z } from "zod";
import {
	Address,
	EnumBoolean,
	Ether,
	HexString,
	HexValue,
	Integer,
	OptionalAddress,
	OptionalString,
	Timestamp,
	Wei,
} from "./core";

export const GetBalancesParams = z.array(Address).max(20);
export type GetBalancesParams = z.infer<typeof GetBalancesParams>;

export const GetBalancesResponse = z.array(z.object({ account: Address, balance: Ether }));
export type GetBalancesResponse = z.infer<typeof GetBalancesResponse>;

export const Transaction = z
	.object({
		blockNumber: Integer,
		blockHash: HexString,
		timeStamp: Timestamp,
		hash: HexString,
		nonce: Integer,
		transactionIndex: Integer,
		from: Address,
		to: OptionalAddress,
		value: Ether,
		gas: Wei,
		gasPrice: Wei,
		input: HexValue,
		methodId: HexValue,
		functionName: OptionalString,
		contractAddress: OptionalAddress,
		cumulativeGasUsed: Wei,
		txreceipt_status: z.enum(["", "0", "1"]).transform(status => status === "1"),
		gasUsed: Wei,
		confirmations: Integer,
		isError: EnumBoolean,
	})
	.transform(({ timeStamp: timestamp, ...rest }) => ({ timestamp, ...rest }));
export type Transaction = z.infer<typeof Transaction>;

export const InternalTransaction = z
	.object({
		blockNumber: Integer,
		timeStamp: Timestamp,
		hash: z.string(),
		from: Address,
		to: OptionalAddress,
		value: Ether,
		contractAddress: OptionalAddress,
		input: OptionalString.or(HexValue),
		type: z.enum(["call", "create"]),
		gas: Wei,
		gasUsed: Wei,
		traceId: z.string(),
		isError: EnumBoolean,
		errCode: OptionalString,
	})
	.transform(({ timeStamp: timestamp, ...rest }) => ({ timestamp, ...rest }));
export type InternalTransaction = z.infer<typeof InternalTransaction>;

export const InternalTransactionsOfTransaction = z
	.object({
		blockNumber: Integer,
		timeStamp: Timestamp,
		from: Address,
		to: OptionalAddress,
		value: Ether,
		contractAddress: OptionalAddress,
		input: HexValue.or(OptionalString),
		type: z.enum(["call", "create"]),
		gas: Wei,
		gasUsed: Wei,
		isError: EnumBoolean,
		errCode: OptionalString,
	})
	.transform(({ timeStamp: timestamp, ...rest }) => ({ timestamp, ...rest }));
export type InternalTransactionsOfTransaction = z.infer<typeof InternalTransactionsOfTransaction>;

export const GetTokenTransfersParams = z.union([
	z.object({
		address: Address,
		contractAddress: Address.optional(),
	}),
	z.object({
		address: Address.optional(),
		contractAddress: Address,
	}),
	z.object({
		address: Address,
		contractAddress: Address,
	}),
]);
export type GetTokenTransfersParams = z.infer<typeof GetTokenTransfersParams>;

export const Erc20Transfer = z
	.object({
		blockNumber: Integer,
		timeStamp: Timestamp,
		hash: z.string(),
		nonce: Integer,
		blockHash: z.string(),
		from: Address,
		contractAddress: Address,
		to: Address,
		value: Ether,
		tokenName: z.string(),
		tokenSymbol: z.string(),
		tokenDecimal: z.coerce.number(),
		transactionIndex: Integer,
		gas: Wei,
		gasPrice: Wei,
		gasUsed: Wei,
		cumulativeGasUsed: Wei,
		input: z.string(),
		confirmations: Integer,
	})
	.transform(({ timeStamp: timestamp, ...rest }) => ({ timestamp, ...rest }));
export type Erc20Transfer = z.infer<typeof Erc20Transfer>;

export const Erc721Transfer = z
	.object({
		blockNumber: Integer,
		timeStamp: Timestamp,
		hash: z.string(),
		nonce: Integer,
		blockHash: z.string(),
		from: Address,
		contractAddress: Address,
		to: Address,
		tokenID: z.string(),
		tokenName: z.string(),
		tokenSymbol: z.string(),
		tokenDecimal: z.literal("0"),
		transactionIndex: Integer,
		gas: Wei,
		gasPrice: Wei,
		gasUsed: Wei,
		cumulativeGasUsed: Wei,
		input: z.string(),
		confirmations: Integer,
	})
	.transform(({ timeStamp: timestamp, ...rest }) => ({ timestamp, ...rest }));
export type Erc721Transfer = z.infer<typeof Erc721Transfer>;

export const Erc1155Transfer = z
	.object({
		blockNumber: Integer,
		timeStamp: Timestamp,
		hash: z.string(),
		nonce: Integer,
		blockHash: z.string(),
		transactionIndex: Integer,
		gas: Wei,
		gasPrice: Wei,
		gasUsed: Wei,
		cumulativeGasUsed: Wei,
		input: z.string(),
		contractAddress: Address,
		from: Address,
		to: Address,
		tokenID: z.string(),
		tokenValue: Ether,
		tokenName: z.string(),
		tokenSymbol: z.string(),
		confirmations: Integer,
	})
	.transform(({ timeStamp: timestamp, ...rest }) => ({ timestamp, ...rest }));
export type Erc1155Transfer = z.infer<typeof Erc1155Transfer>;

export const GetValidatedBlockOptions = z.object({
	blockType: z.enum(["blocks", "uncles"]).optional(),
	page: z.number().int().min(1).optional(),
	offset: z.number().int().min(1).max(10000).optional(),
});
export type GetValidatedBlockOptions = Partial<z.infer<typeof GetValidatedBlockOptions>>;

export const ValidatedBlock = z
	.object({
		blockNumber: Integer,
		timeStamp: Timestamp,
		blockReward: Wei,
	})
	.transform(({ timeStamp: timestamp, ...rest }) => ({ timestamp, ...rest }));
export type ValidatedBlock = z.infer<typeof ValidatedBlock>;

export const BeaconChainWithdrawal = z.object({
	withdrawalIndex: Integer,
	validatorIndex: Integer,
	address: Address,
	amount: Wei,
	blockNumber: Integer,
	timestamp: Timestamp,
});
export type BeaconChainWithdrawal = z.infer<typeof BeaconChainWithdrawal>;
