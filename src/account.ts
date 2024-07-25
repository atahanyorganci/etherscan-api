import { z } from "zod";
import { Address, Wei, Ether, Integer, TimeStamp } from "./core";

export const GetBalancesInput = z.array(Address).max(20);
export type GetBalancesInput = z.infer<typeof GetBalancesInput>;

export const GetBalancesResult = z.array(z.object({ account: Address, balance: Ether }));
export type GetBalancesResult = z.infer<typeof GetBalancesResult>;

export const GetTokenTransfersInput = z.union([
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
export type GetTokenTransfersInput = z.infer<typeof GetTokenTransfersInput>;

export const Erc20Transfer = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
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
});
export type Erc20Transfer = z.infer<typeof Erc20Transfer>;

export const Erc721Transfer = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
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
});
export type Erc721Transfer = z.infer<typeof Erc721Transfer>;

export const Erc1155Transfer = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
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
});
export type Erc1155Transfer = z.infer<typeof Erc1155Transfer>;

export const GetValidatedBlockOptions = z
	.object({
		blockType: z.enum(["blocks", "uncles"]).optional(),
		page: z.number().int().min(1).optional(),
		offset: z.number().int().min(1).max(10000).optional(),
	})
	.transform(({ blockType, page, offset }) => ({ blocktype: blockType, page, offset }));
export type GetValidatedBlockOptions = Partial<z.infer<typeof GetValidatedBlockOptions>>;

export const ValidatedBlock = z.object({
	blockNumber: Integer,
	timeStamp: TimeStamp,
	blockReward: Wei,
});
export type ValidatedBlock = z.infer<typeof ValidatedBlock>;
