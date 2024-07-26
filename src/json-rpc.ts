import { z } from "zod";
import {
	Address,
	BlockIdentifier,
	Ether,
	HexString,
	HexValue,
	Integer,
	OptionalAddress,
	Timestamp,
	Wei,
} from "./core";

export const SignedLegacyTransaction = z.object({
	type: z.literal("0x0"),
	nonce: Wei,
	to: Address.or(z.null()),
	gas: Wei,
	value: Wei,
	input: HexString,
	gasPrice: Wei,
	chainId: Integer.optional(),
	v: HexValue,
	r: HexValue,
	s: HexValue,
});
export type SignedLegacyTransaction = z.infer<typeof SignedLegacyTransaction>;

export const Signed2930Transaction = z.object({
	type: z.literal("0x1"),
	blockHash: HexString,
	blockNumber: Integer,
	from: Address,
	gas: Wei,
	gasPrice: Wei,
	hash: HexString,
	input: HexString,
	nonce: HexString,
	to: OptionalAddress,
	transactionIndex: Integer,
	value: Ether,
	accessList: z.array(
		z.object({
			address: Address,
			storageKeys: z.array(HexString),
		}),
	),
	chainId: Integer,
	v: HexValue,
	r: HexValue,
	s: HexValue,
	yParity: Integer,
});
export type Signed2930Transaction = z.infer<typeof Signed2930Transaction>;

export const Signed1559Transaction = z.object({
	type: z.literal("0x2"),
	blockHash: HexString,
	blockNumber: Integer,
	from: Address,
	gas: Wei,
	gasPrice: Wei,
	maxFeePerGas: Wei,
	maxPriorityFeePerGas: Wei,
	hash: HexString,
	input: HexString,
	nonce: Integer,
	to: z
		.null()
		.or(Address)
		.or(OptionalAddress.transform(a => a ?? null)),
	transactionIndex: Integer,
	value: Wei,
	accessList: z
		.array(
			z.object({
				address: Address,
				storageKeys: z.array(HexString),
			}),
		)
		.optional(),
	chainId: Integer,
	v: HexValue,
	r: HexValue,
	s: HexValue,
});
export type Signed1559Transaction = z.infer<typeof Signed1559Transaction>;

export const Signed4844Transaction = z.object({
	type: HexString,
	nonce: HexString,
	to: Address,
	gas: Wei,
	value: Wei,
	input: z.string(),
	maxPriorityFeePerGas: Wei,
	maxFeePerGas: Wei,
	maxFeePerBlobGas: Wei,
	accessList: z.array(
		z.object({
			address: Address,
			storageKeys: z.array(HexString),
		}),
	),
	blobVersionedHashes: z.array(HexString),
	chainId: Integer,
	yParity: Integer,
	r: z.string(),
	s: z.string(),
});
export type Signed4844Transaction = z.infer<typeof Signed4844Transaction>;

export const EipTransaction = z
	.discriminatedUnion("type", [
		SignedLegacyTransaction,
		Signed2930Transaction,
		Signed1559Transaction,
	])
	.or(Signed4844Transaction);
export type EipTransaction = z.infer<typeof EipTransaction>;

export const Block = z
	.object({
		difficulty: Wei,
		extraData: HexString,
		gasLimit: Wei,
		gasUsed: Wei,
		hash: HexString,
		logsBloom: HexString,
		miner: Address,
		mixHash: HexString,
		nonce: HexString,
		number: Integer,
		parentHash: HexString,
		receiptsRoot: HexString,
		sha3Uncles: HexString,
		size: Integer,
		stateRoot: HexString,
		timestamp: Timestamp,
		totalDifficulty: Wei,
		transactions: z.array(z.string()),
		transactionsRoot: HexString,
		uncles: z.array(HexString),
	})
	.or(z.null());
export type Block = z.infer<typeof Block>;

export const BlockWithTransactions = z
	.object({
		difficulty: Wei,
		extraData: HexString,
		gasLimit: Wei,
		gasUsed: Wei,
		hash: HexString,
		logsBloom: HexString,
		miner: Address,
		mixHash: HexString,
		nonce: HexString,
		number: Integer,
		parentHash: HexString,
		receiptsRoot: HexString,
		sha3Uncles: HexString,
		size: Integer,
		stateRoot: HexString,
		timestamp: Timestamp,
		totalDifficulty: Wei,
		transactions: z.array(EipTransaction),
		transactionsRoot: HexString,
		uncles: z.array(HexString),
	})
	.or(z.null());
export type BlockWithTransactions = z.infer<typeof BlockWithTransactions>;

export const GetTransactionParams = z
	.object({
		hash: HexString,
	})
	.or(
		z.object({
			block: BlockIdentifier,
			index: Integer.min(0),
		}),
	);
export type GetTransactionParams = z.infer<typeof GetTransactionParams>;

export const UncleBlock = z.object({
	baseFeePerGas: Wei,
	difficulty: Wei,
	extraData: HexString,
	gasLimit: Wei,
	gasUsed: Wei,
	hash: HexString,
	logsBloom: HexString,
	miner: HexString,
	mixHash: HexString,
	nonce: HexString,
	number: Wei,
	parentHash: HexString,
	receiptsRoot: HexString,
	sha3Uncles: HexString,
	size: Wei,
	stateRoot: HexString,
	timestamp: Wei,
	transactionsRoot: HexString,
	uncles: z.array(HexString),
});
export type UncleBlock = z.infer<typeof UncleBlock>;

export const TransactionReceipt = z.object({
	blobGasPrice: Wei.optional(),
	blobGasUsed: Wei.optional(),
	blockHash: HexString,
	blockNumber: Integer,
	contractAddress: Address.nullable().optional(),
	cumulativeGasUsed: Wei,
	effectiveGasPrice: Wei,
	from: Address,
	gasUsed: Wei,
	logs: z.array(
		z.object({
			address: Address,
			topics: z.array(HexString),
			data: HexString,
			blockNumber: Integer,
			transactionHash: HexString,
			transactionIndex: Integer,
			blockHash: HexString,
			logIndex: Integer,
			removed: z.boolean(),
		}),
	),
	logsBloom: HexString,
	root: HexString.optional(),
	status: Integer.optional(),
	to: Address.nullable(),
	transactionHash: HexString,
	transactionIndex: Integer,
	type: Integer,
});
export type TransactionReceipt = z.infer<typeof TransactionReceipt>;

/**
 * Call parameters for the `eth_call` JSON-RPC method.
 *
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call | `eth_call`} documentation.
 */
export const CallParams = z.object({
	from: Address.optional(),
	to: Address,
	gas: Wei.optional(),
	gasPrice: Wei.optional(),
	value: Wei.optional(),
	data: HexString.optional(),
});
export type CallParams = z.infer<typeof CallParams>;
